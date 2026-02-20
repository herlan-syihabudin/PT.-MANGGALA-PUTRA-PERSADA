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

const VALID_STATUSES = ["Draft", "Approved", "Rejected", "Locked", "Deleted"] as const
const STATUS_TRANSITIONS: Record<string, string[]> = {
  "Draft": ["Draft", "Approved", "Rejected", "Deleted"],
  "Approved": ["Approved", "Locked"],
  "Rejected": ["Draft", "Deleted"],
  "Locked": ["Locked"],
  "Deleted": ["Deleted"],
}

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

// ===================== GET DETAIL RAB =====================
export async function GET(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id

    // ===== HEADER =====
    const headerRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!A2:K`,
      })
    )

    const headerRows = headerRes.data.values || []
    const headerRowIndex = headerRows.findIndex(
      r => r[RAB_HEADER_COLUMNS.RAB_ID] === rab_id
    )
    
    if (headerRowIndex === -1) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
        { status: 404 }
      )
    }

    const headerRow = headerRows[headerRowIndex]
    const headerRowNumber = headerRowIndex + 2

    // ===== ITEMS =====
    const itemRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!A2:P`,
      })
    )

    const rows = itemRes.data.values || []
    const items = rows
      .filter(r => r[RAB_ITEM_COLUMNS.RAB_ID] === rab_id)
      .filter(r => r[RAB_ITEM_COLUMNS.STATUS] !== "Deleted")
      .map(r => ({
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

    // Hitung total
    const total_value = items.reduce((s, i) => s + n(i.total_price), 0)
    const total_items = items.length

    // Update header dengan nilai terbaru
    if (total_value !== n(headerRow[RAB_HEADER_COLUMNS.TOTAL_VALUE])) {
      await withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${RAB_PROJECT}!G${headerRowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[total_value]] }
        })
      )
    }

    if (total_items !== n(headerRow[RAB_HEADER_COLUMNS.TOTAL_ITEMS])) {
      await withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${RAB_PROJECT}!F${headerRowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[total_items]] }
        })
      )
    }

    logger.info('GET RAB Detail Success', { rab_id, total_items, total_value })

    return NextResponse.json({
      rab_id,
      inquiry_id: headerRow[RAB_HEADER_COLUMNS.INQUIRY_ID],
      project_id: headerRow[RAB_HEADER_COLUMNS.PROJECT_ID],
      project_name: headerRow[RAB_HEADER_COLUMNS.PROJECT_NAME],
      customer_name: headerRow[RAB_HEADER_COLUMNS.CUSTOMER_NAME],
      total_items,
      total_value,
      status: headerRow[RAB_HEADER_COLUMNS.STATUS] || "Draft",
      created_by: headerRow[RAB_HEADER_COLUMNS.CREATED_BY] || "",
      created_at: headerRow[RAB_HEADER_COLUMNS.CREATED_AT] || "",
      items,
    })

  } catch (error: any) {
    logger.error('GET RAB Detail Error', error, { rab_id: params.rab_id })

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
      { message: "Gagal mengambil data RAB" },
      { status: 500 }
    )
  }
}

// ===================== UPDATE RAB HEADER =====================
export async function PATCH(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id
    const body = await req.json()

    // Validasi input
    if (body.project_name !== undefined && typeof body.project_name !== 'string') {
      return NextResponse.json(
        { message: "project_name harus string" },
        { status: 400 }
      )
    }

    if (body.customer_name !== undefined && typeof body.customer_name !== 'string') {
      return NextResponse.json(
        { message: "customer_name harus string" },
        { status: 400 }
      )
    }

    if (body.status !== undefined && !VALID_STATUSES.includes(body.status as any)) {
      return NextResponse.json(
        { message: "Status tidak valid" },
        { status: 400 }
      )
    }

    // Cari baris header
    const headerRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!A2:K`,
      })
    )

    const headerRows = headerRes.data.values || []
    const idx = headerRows.findIndex(r => r[RAB_HEADER_COLUMNS.RAB_ID] === rab_id)

    if (idx === -1) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
        { status: 404 }
      )
    }

    const rowNumber = idx + 2
    const currentRow = headerRows[idx]

    // Validasi transisi status
    const currentStatus = currentRow[RAB_HEADER_COLUMNS.STATUS] || "Draft"
    if (body.status && body.status !== currentStatus) {
      if (!STATUS_TRANSITIONS[currentStatus]?.includes(body.status)) {
        return NextResponse.json(
          { message: `Tidak bisa ubah status dari ${currentStatus} ke ${body.status}` },
          { status: 400 }
        )
      }
    }

    // Mapping kolom yang bisa di-update
    const updates: Record<number, any> = {}
    if (body.project_name !== undefined) updates[RAB_HEADER_COLUMNS.PROJECT_NAME] = body.project_name
    if (body.customer_name !== undefined) updates[RAB_HEADER_COLUMNS.CUSTOMER_NAME] = body.customer_name
    if (body.status !== undefined) updates[RAB_HEADER_COLUMNS.STATUS] = body.status

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data yang diupdate" },
        { status: 400 }
      )
    }

    // Update per kolom
    for (const [colIndex, value] of Object.entries(updates)) {
      const col = String.fromCharCode(65 + Number(colIndex))
      await withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${RAB_PROJECT}!${col}${rowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[value]] }
        })
      )
    }

    logger.info('PATCH RAB Success', { rab_id, updates: Object.keys(updates) })

    return NextResponse.json({
      success: true,
      message: "RAB berhasil diupdate",
      updates: Object.keys(updates)
    })

  } catch (error: any) {
    logger.error('PATCH RAB Error', error, { rab_id: params.rab_id })

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
      { message: "Gagal update RAB" },
      { status: 500 }
    )
  }
}

// ===================== DELETE RAB (SOFT DELETE) =====================
export async function DELETE(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id

    // Cari baris header
    const headerRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!A2:K`,
      })
    )

    const headerRows = headerRes.data.values || []
    const idx = headerRows.findIndex(r => r[RAB_HEADER_COLUMNS.RAB_ID] === rab_id)

    if (idx === -1) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
        { status: 404 }
      )
    }

    const rowNumber = idx + 2
    const currentRow = headerRows[idx]

    // Cek apakah sudah di-approve
    if (currentRow[RAB_HEADER_COLUMNS.STATUS] === "Approved") {
      return NextResponse.json(
        { message: "RAB yang sudah Approved tidak bisa dihapus" },
        { status: 403 }
      )
    }

    // SOFT DELETE - ubah status jadi "Deleted"
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!H${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Deleted"]] }
      })
    )

    // Cari semua items terkait
    const itemRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!A2:P`,
      })
    )

    const itemRows = itemRes.data.values || []
    const itemIndices = itemRows
      .map((r, i) => r[RAB_ITEM_COLUMNS.RAB_ID] === rab_id ? i + 2 : -1)
      .filter(i => i !== -1)

    // Soft delete semua items
    for (const itemRow of itemIndices) {
      await withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${RAB_ITEM}!M${itemRow}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [["Deleted"]] }
        })
      )
    }

    logger.info('DELETE RAB Success', { rab_id, items_deleted: itemIndices.length })

    return NextResponse.json({
      success: true,
      message: "RAB berhasil dihapus",
      deleted_items: itemIndices.length
    })

  } catch (error: any) {
    logger.error('DELETE RAB Error', error, { rab_id: params.rab_id })

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
      { message: "Gagal menghapus RAB" },
      { status: 500 }
    )
  }
}
