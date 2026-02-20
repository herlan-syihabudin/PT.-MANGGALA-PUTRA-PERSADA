import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
function validateEnvironment() {
  const required = [
    'GOOGLE_CLIENT_EMAIL', 
    'GOOGLE_PRIVATE_KEY', 
    'GSHEET_ESTIMATOR_ID'
  ] as const
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

validateEnvironment()

/* ================= GOOGLE AUTH ================= */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

const RAB_PROJECT = "RAB_PROJECT"
const RAB_ITEM = "RAB_ITEM"

/* ================= CONSTANTS ================= */
const RAB_HEADER_COLUMNS = {
  RAB_ID: 0,
  INQUIRY_ID: 1,
  PROJECT_ID: 2,
  PROJECT_NAME: 3,
  CUSTOMER_NAME: 4,
  TOTAL_ITEMS: 5,
  TOTAL_VALUE: 6,
  STATUS: 7,
  AKSI: 8,
  CREATED_BY: 9,
  CREATED_AT: 10,
} as const

const RAB_ITEM_COLUMNS = {
  ITEM_ID: 0,
  RAB_ID: 1,
  PROJECT_ID: 2,
  SCOPE: 3,
  ITEM_NAME: 4,
  CATEGORY: 5,
  QTY: 6,
  UNIT: 7,
  MATERIAL_PRICE: 8,
  LABOUR_PRICE: 9,
  UNIT_PRICE: 10,
  TOTAL_PRICE: 11,
  STATUS: 12,
  CREATED_BY: 13,
  CREATED_AT: 14,
  UPDATED_AT: 15,
} as const

const RETRYABLE_CODES = [408, 429, 502, 503] as const

/* ================= HELPERS ================= */
function n(x: any) {
  const v = Number(x)
  return Number.isFinite(v) ? v : 0
}

const logger = {
  error: (context: string, error: any, metadata: any = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      context,
      error: {
        message: error?.message,
        stack: error?.stack,
        code: error?.code
      },
      ...metadata
    }))
  },
  info: (context: string, metadata: any = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      context,
      ...metadata
    }))
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && RETRYABLE_CODES.includes(error.code)) {
      const delay = 1000 * (4 - retries)
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

async function checkRABStatus(rab_id: string): Promise<string | null> {
  const headerRes = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:H`,
    })
  )
  
  const headerRows = headerRes.data.values || []
  const headerRow = headerRows.find(r => r[RAB_HEADER_COLUMNS.RAB_ID] === rab_id)
  
  if (!headerRow) return null
  return headerRow[RAB_HEADER_COLUMNS.STATUS] || "Draft"
}

async function recalcHeader(rab_id: string) {
  const itemRes = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A2:P`,
    })
  )
  
  const rows = itemRes.data.values || []
  const items = rows.filter((r) => r[RAB_ITEM_COLUMNS.RAB_ID] === rab_id)

  const total_items = items.length
  const total_value = items.reduce((s, r) => s + n(r[RAB_ITEM_COLUMNS.TOTAL_PRICE]), 0)

  const headerRes = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:K`,
    })
  )
  
  const headerRows = headerRes.data.values || []
  const idx = headerRows.findIndex((r) => r[RAB_HEADER_COLUMNS.RAB_ID] === rab_id)
  
  if (idx === -1) return { total_items, total_value }

  const row = idx + 2
  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!F${row}:G${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[total_items, total_value]] },
    })
  )

  return { total_items, total_value }
}

// ===================== GET ALL ITEMS =====================
export async function GET(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id

    const itemRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!A2:P`,
      })
    )
    
    const rows = itemRes.data.values || []

    const items = rows
      .filter((r) => r[RAB_ITEM_COLUMNS.RAB_ID] === rab_id)
      .filter((r) => r[RAB_ITEM_COLUMNS.STATUS] !== "Deleted")
      .map((r) => ({
        item_id: r[RAB_ITEM_COLUMNS.ITEM_ID] || "",
        rab_id: r[RAB_ITEM_COLUMNS.RAB_ID] || "",
        project_id: r[RAB_ITEM_COLUMNS.PROJECT_ID] || "",
        scope: r[RAB_ITEM_COLUMNS.SCOPE] || "",
        item_name: r[RAB_ITEM_COLUMNS.ITEM_NAME] || "",
        category: r[RAB_ITEM_COLUMNS.CATEGORY] || "",
        qty: n(r[RAB_ITEM_COLUMNS.QTY]),
        unit: r[RAB_ITEM_COLUMNS.UNIT] || "",
        material_price: n(r[RAB_ITEM_COLUMNS.MATERIAL_PRICE]),
        labour_price: n(r[RAB_ITEM_COLUMNS.LABOUR_PRICE]),
        unit_price: n(r[RAB_ITEM_COLUMNS.UNIT_PRICE]),
        total_price: n(r[RAB_ITEM_COLUMNS.TOTAL_PRICE]),
        status: r[RAB_ITEM_COLUMNS.STATUS] || "Draft",
        created_by: r[RAB_ITEM_COLUMNS.CREATED_BY] || "",
        created_at: r[RAB_ITEM_COLUMNS.CREATED_AT] || "",
        updated_at: r[RAB_ITEM_COLUMNS.UPDATED_AT] || "",
      }))
      .sort((a, b) => a.created_at.localeCompare(b.created_at))

    logger.info('GET Items Success', { rab_id, count: items.length })

    return NextResponse.json(items)

  } catch (error: any) {
    logger.error('GET Items Error', error, { rab_id: params.rab_id })

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { message: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { message: "Gagal mengambil items" },
      { status: 500 }
    )
  }
}

// ===================== CREATE ITEM =====================
export async function POST(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id
    const body = await req.json()

    // Cek status RAB
    const status = await checkRABStatus(rab_id)
    if (!status) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
        { status: 404 }
      )
    }

    if (status !== "Draft") {
      return NextResponse.json(
        { message: `Tidak bisa tambah item karena RAB status ${status}` },
        { status: 403 }
      )
    }

    const {
      project_id,
      scope = "",
      item_name,
      category = "",
      qty = 0,
      unit = "",
      material_price = 0,
      labour_price = 0,
      created_by = "System"
    } = body

    if (!project_id) {
      return NextResponse.json(
        { message: "project_id wajib" },
        { status: 400 }
      )
    }

    if (!item_name?.trim()) {
      return NextResponse.json(
        { message: "item_name wajib" },
        { status: 400 }
      )
    }

    if (qty < 0 || material_price < 0 || labour_price < 0) {
      return NextResponse.json(
        { message: "angka tidak boleh negatif" },
        { status: 400 }
      )
    }

    // Cek duplikat
    const existingItems = await GET_ITEMS(rab_id) // perlu implementasi
    const duplicate = existingItems.find(
      i => i.item_name.toLowerCase() === item_name.toLowerCase()
    )
    if (duplicate) {
      return NextResponse.json(
        { message: `Item "${item_name}" sudah ada` },
        { status: 409 }
      )
    }

    const item_id = "ITEM-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    const unit_price = material_price + labour_price
    const total_price = qty * unit_price

    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!A:P`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            item_id,
            rab_id,
            project_id,
            scope,
            item_name,
            category,
            qty,
            unit,
            material_price,
            labour_price,
            unit_price,
            total_price,
            "Draft",
            created_by,
            now,
            now,
          ]]
        }
      })
    )

    const summary = await recalcHeader(rab_id)

    logger.info('POST Item Success', { rab_id, item_id, item_name })

    return NextResponse.json({
      message: "Item berhasil dibuat",
      item: {
        item_id,
        rab_id,
        project_id,
        scope,
        item_name,
        category,
        qty,
        unit,
        material_price,
        labour_price,
        unit_price,
        total_price,
        status: "Draft",
        created_by,
        created_at: now,
        updated_at: now,
      },
      summary
    })

  } catch (error: any) {
    logger.error('POST Item Error', error, { rab_id: params.rab_id })

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { message: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { message: "Gagal tambah item" },
      { status: 500 }
    )
  }
}

// ===================== BULK CREATE ITEMS =====================
export async function PUT(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id
    const { project_id, created_by = "System", items } = await req.json()

    // Cek status RAB
    const status = await checkRABStatus(rab_id)
    if (!status) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
        { status: 404 }
      )
    }

    if (status !== "Draft") {
      return NextResponse.json(
        { message: `Tidak bisa ubah item karena RAB status ${status}` },
        { status: 403 }
      )
    }

    if (!project_id) {
      return NextResponse.json(
        { message: "project_id wajib" },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "items wajib array" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const by = String(created_by)

    const values = items
      .map((it: any) => {
        const scope = String(it.scope || "")
        const item_name = String(it.item_name || "")
        if (!item_name.trim()) return null

        const category = String(it.category || "")
        const qty = n(it.qty)
        const unit = String(it.unit || "")
        const material_price = n(it.material_price)
        const labour_price = n(it.labour_price)

        if (qty < 0 || material_price < 0 || labour_price < 0) return null

        const unit_price = material_price + labour_price
        const total_price = qty * unit_price

        return [
          "ITEM-" + nanoid(8).toUpperCase(),
          rab_id,
          project_id,
          scope,
          item_name,
          category,
          qty,
          unit,
          material_price,
          labour_price,
          unit_price,
          total_price,
          "Draft",
          by,
          now,
          now,
        ]
      })
      .filter(Boolean)

    if (values.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada item valid" },
        { status: 400 }
      )
    }

    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!A:P`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      })
    )

    const summary = await recalcHeader(rab_id)

    logger.info('PUT Bulk Items Success', { 
      rab_id, 
      inserted: values.length,
      total_items: summary.total_items
    })

    return NextResponse.json({
      message: "Bulk create sukses",
      inserted: values.length,
      summary
    })

  } catch (error: any) {
    logger.error('PUT Bulk Items Error', error, { rab_id: params.rab_id })

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { message: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { message: "Gagal bulk create" },
      { status: 500 }
    )
  }
}
