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
  const items = rows.filter(
  (r) =>
    r[RAB_ITEM_COLUMNS.RAB_ID] === rab_id &&
    (r[RAB_ITEM_COLUMNS.STATUS] || "").trim() !== "Deleted"
)

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

// ===================== GET SINGLE ITEM =====================
export async function GET(
  req: Request,
  { params }: { params: { rab_id: string; item_id: string } }
) {
  try {
    const { rab_id, item_id } = params

    const itemRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!A2:P`,
      })
    )
    
    const rows = itemRes.data.values || []
    const row = rows.find(
  (r) =>
    r[RAB_ITEM_COLUMNS.ITEM_ID] === item_id &&
    r[RAB_ITEM_COLUMNS.RAB_ID] === rab_id &&
    r[RAB_ITEM_COLUMNS.STATUS] !== "Deleted"
)

    if (!row) {
      return NextResponse.json(
        { message: "Item tidak ditemukan" },
        { status: 404 }
      )
    }

    logger.info('GET Item Success', { rab_id, item_id })

    return NextResponse.json({
      item_id: row[RAB_ITEM_COLUMNS.ITEM_ID] || "",
      rab_id: row[RAB_ITEM_COLUMNS.RAB_ID] || "",
      project_id: row[RAB_ITEM_COLUMNS.PROJECT_ID] || "",
      scope: row[RAB_ITEM_COLUMNS.SCOPE] || "",
      item_name: row[RAB_ITEM_COLUMNS.ITEM_NAME] || "",
      category: row[RAB_ITEM_COLUMNS.CATEGORY] || "",
      qty: n(row[RAB_ITEM_COLUMNS.QTY]),
      unit: row[RAB_ITEM_COLUMNS.UNIT] || "",
      material_price: n(row[RAB_ITEM_COLUMNS.MATERIAL_PRICE]),
      labour_price: n(row[RAB_ITEM_COLUMNS.LABOUR_PRICE]),
      unit_price: n(row[RAB_ITEM_COLUMNS.UNIT_PRICE]),
      total_price: n(row[RAB_ITEM_COLUMNS.TOTAL_PRICE]),
      status: row[RAB_ITEM_COLUMNS.STATUS] || "Draft",
      created_by: row[RAB_ITEM_COLUMNS.CREATED_BY] || "",
      created_at: row[RAB_ITEM_COLUMNS.CREATED_AT] || "",
      updated_at: row[RAB_ITEM_COLUMNS.UPDATED_AT] || "",
    })

  } catch (error: any) {
    logger.error('GET Item Error', error, { rab_id: params.rab_id, item_id: params.item_id })

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
      { message: "Gagal mengambil item" },
      { status: 500 }
    )
  }
}

// ===================== UPDATE ITEM =====================
export async function PATCH(
  req: Request,
  { params }: { params: { rab_id: string; item_id: string } }
) {
  try {
    const { rab_id, item_id } = params
    const patch = await req.json()
    const allowedFields = [
  "scope",
  "item_name",
  "category",
  "qty",
  "unit",
  "material_price",
  "labour_price"
]

Object.keys(patch).forEach((key) => {
  if (!allowedFields.includes(key)) {
    delete patch[key]
  }
})

    // Cek status RAB
    const status = await checkRABStatus(rab_id)
    if (!status) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
        { status: 404 }
      )
    }

    if ((status || "").toLowerCase().trim() !== "draft") {
      return NextResponse.json(
        { message: `Tidak bisa update item karena RAB status ${status}` },
        { status: 403 }
      )
    }

    // Cari baris item
    const itemRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!A2:P`,
      })
    )
    
    const rows = itemRes.data.values || []
   const idx = rows.findIndex(
  (r) =>
    r[RAB_ITEM_COLUMNS.ITEM_ID] === item_id &&
    r[RAB_ITEM_COLUMNS.RAB_ID] === rab_id &&
    r[RAB_ITEM_COLUMNS.STATUS] !== "Deleted"
)

    if (idx === -1) {
      return NextResponse.json(
        { message: "Item tidak ditemukan" },
        { status: 404 }
      )
    }

    const rowNumber = idx + 2
    const row = rows[idx]

    // Hitung ulang prices
    let qty = patch.qty !== undefined ? n(patch.qty) : n(row[RAB_ITEM_COLUMNS.QTY])
    let material_price = patch.material_price !== undefined ? n(patch.material_price) : n(row[RAB_ITEM_COLUMNS.MATERIAL_PRICE])
    let labour_price = patch.labour_price !== undefined ? n(patch.labour_price) : n(row[RAB_ITEM_COLUMNS.LABOUR_PRICE])

    if (qty < 0 || material_price < 0 || labour_price < 0) {
      return NextResponse.json(
        { message: "angka tidak boleh negatif" },
        { status: 400 }
      )
    }

    const unit_price = material_price + labour_price
    const total_price = qty * unit_price
    const updated_at = new Date().toISOString()

    // Prepare update values (D sampai P)
    const updates = [
      patch.scope !== undefined ? patch.scope : row[RAB_ITEM_COLUMNS.SCOPE],
      patch.item_name !== undefined ? patch.item_name : row[RAB_ITEM_COLUMNS.ITEM_NAME],
      patch.category !== undefined ? patch.category : row[RAB_ITEM_COLUMNS.CATEGORY],
      qty,
      patch.unit !== undefined ? patch.unit : row[RAB_ITEM_COLUMNS.UNIT],
      material_price,
      labour_price,
      unit_price,
      total_price,
      row[RAB_ITEM_COLUMNS.STATUS] || "Draft",
      row[RAB_ITEM_COLUMNS.CREATED_BY] || "",
      row[RAB_ITEM_COLUMNS.CREATED_AT] || "",
      updated_at,
    ]

    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!D${rowNumber}:P${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [updates] }
      })
    )

    const summary = await recalcHeader(rab_id)

    logger.info('PATCH Item Success', { rab_id, item_id })

    return NextResponse.json({
      message: "Item updated",
      summary
    })

  } catch (error: any) {
    logger.error('PATCH Item Error', error, { rab_id: params.rab_id, item_id: params.item_id })

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
      { message: "Gagal update item" },
      { status: 500 }
    )
  }
}

// ===================== DELETE ITEM (SOFT DELETE) =====================
export async function DELETE(
  req: Request,
  { params }: { params: { rab_id: string; item_id: string } }
) {
  try {
    const { rab_id, item_id } = params

    // Cek status RAB
    const status = await checkRABStatus(rab_id)
    if (!status) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
        { status: 404 }
      )
    }

    if ((status || "").toLowerCase().trim() !== "draft") {
      return NextResponse.json(
        { message: `Tidak bisa hapus item karena RAB status ${status}` },
        { status: 403 }
      )
    }

    // Cari baris item
    const itemRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!A2:P`,
      })
    )
    
    const rows = itemRes.data.values || []
    const idx = rows.findIndex(
      (r) => r[RAB_ITEM_COLUMNS.ITEM_ID] === item_id && 
            r[RAB_ITEM_COLUMNS.RAB_ID] === rab_id
    )

    if (idx === -1) {
      return NextResponse.json(
        { message: "Item tidak ditemukan" },
        { status: 404 }
      )
    }

    const rowNumber = idx + 2
    const now = new Date().toISOString()

    // SOFT DELETE - ubah status jadi "Deleted"
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!M${rowNumber}`, // Kolom STATUS
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Deleted"]] }
      })
    )

    // Update updated_at
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!P${rowNumber}`, // Kolom UPDATED_AT
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[now]] }
      })
    )

    const summary = await recalcHeader(rab_id)

    logger.info('DELETE Item Success', { rab_id, item_id })

    return NextResponse.json({
      message: "Item deleted (soft)",
      summary
    })

  } catch (error: any) {
    logger.error('DELETE Item Error', error, { rab_id: params.rab_id, item_id: params.item_id })

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
      { message: "Gagal hapus item" },
      { status: 500 }
    )
  }
}
