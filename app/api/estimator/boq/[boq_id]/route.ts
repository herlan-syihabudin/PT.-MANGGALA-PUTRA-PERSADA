import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
function validateEnvironment() {
  const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_ESTIMATOR_ID'] as const
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`)
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

/* ================= CONSTANTS ================= */
const BOQ_HEADER_COLUMNS = {
  BOQ_ID: 0,        // A
  PROJECT_ID: 1,    // B
  PROJECT_NAME: 2,  // C
  CUSTOMER_NAME: 3, // D
  STATUS: 4,        // E
  TOTAL_ITEMS: 5,   // F
  TOTAL_VALUE: 6,   // G
  CREATED_BY: 7,    // H
  CREATED_AT: 8,    // I
  UPDATED_AT: 9,    // J
} as const

const BOQ_ITEM_COLUMNS = {
  ITEM_ID: 0,       // A
  BOQ_ID: 1,        // B
  LINE_NO: 2,       // C
  DESCRIPTION: 3,   // D
  CATEGORY: 4,      // E
  VOLUME: 5,        // F
  UNIT: 6,          // G
  UNIT_PRICE: 7,    // H
  SUBTOTAL: 8,      // I
  CREATED_AT: 9,    // J
} as const

const RETRYABLE_CODES = [408, 429, 502, 503] as const

/* ================= TYPES ================= */
type BoqStatus = "DRAFT" | "LOCKED" | "APPROVED" | "REJECTED" | "ARCHIVED"

interface BoqHeader {
  boq_id: string
  project_id: string
  project_name: string
  customer_name: string
  status: BoqStatus
  total_items: number
  total_value: number
  created_by: string
  created_at: string
  updated_at: string
}

interface BoqItem {
  item_id: string
  boq_id: string
  line_no: number
  description: string
  category: string
  volume: number
  unit: string
  unit_price: number
  subtotal: number
  created_at: string
}

interface BoqDetailResponse {
  header: BoqHeader
  items: BoqItem[]
}

/* ================= HELPERS ================= */
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

function safeParseNumber(value: any): number {
  if (value === null || value === undefined) return 0
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

/* ================= GET BOQ DETAIL ================= */
export async function GET(
  req: Request,
  { params }: { params: { boq_id: string } }
) {
  try {
    const boq_id = params.boq_id
    logger.info('Fetching BOQ detail', { boq_id })

    if (!boq_id) {
      return NextResponse.json(
        { message: "BOQ ID diperlukan" },
        { status: 400 }
      )
    }

    // ===== FETCH HEADER =====
    const headerRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `BOQ_HEADER!A2:J`,
      })
    )

    const headerRows = headerRes.data.values || []
    
    // Cari header berdasarkan BOQ_ID
    const headerRow = headerRows.find(row => 
      row[BOQ_HEADER_COLUMNS.BOQ_ID] === boq_id
    )

    if (!headerRow) {
      logger.info('BOQ not found', { boq_id })
      return NextResponse.json(
        { message: "BOQ tidak ditemukan" },
        { status: 404 }
      )
    }

    // Parse header
    const header: BoqHeader = {
      boq_id: headerRow[BOQ_HEADER_COLUMNS.BOQ_ID] || "",
      project_id: headerRow[BOQ_HEADER_COLUMNS.PROJECT_ID] || "",
      project_name: headerRow[BOQ_HEADER_COLUMNS.PROJECT_NAME] || "Untitled",
      customer_name: headerRow[BOQ_HEADER_COLUMNS.CUSTOMER_NAME] || "-",
      status: (headerRow[BOQ_HEADER_COLUMNS.STATUS] || "DRAFT") as BoqStatus,
      total_items: safeParseNumber(headerRow[BOQ_HEADER_COLUMNS.TOTAL_ITEMS]),
      total_value: safeParseNumber(headerRow[BOQ_HEADER_COLUMNS.TOTAL_VALUE]),
      created_by: headerRow[BOQ_HEADER_COLUMNS.CREATED_BY] || "System",
      created_at: headerRow[BOQ_HEADER_COLUMNS.CREATED_AT] || new Date().toISOString(),
      updated_at: headerRow[BOQ_HEADER_COLUMNS.UPDATED_AT] || "",
    }

    // ===== FETCH ITEMS =====
    const itemsRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `BOQ_ITEMS!A2:J`,
      })
    )

    const itemRows = itemsRes.data.values || []
    
    // Filter items berdasarkan BOQ_ID dan sort by LINE_NO
    const items: BoqItem[] = itemRows
      .filter(row => row[BOQ_ITEM_COLUMNS.BOQ_ID] === boq_id)
      .map(row => ({
        item_id: row[BOQ_ITEM_COLUMNS.ITEM_ID] || "",
        boq_id: row[BOQ_ITEM_COLUMNS.BOQ_ID] || "",
        line_no: safeParseNumber(row[BOQ_ITEM_COLUMNS.LINE_NO]),
        description: row[BOQ_ITEM_COLUMNS.DESCRIPTION] || "",
        category: row[BOQ_ITEM_COLUMNS.CATEGORY] || "",
        volume: safeParseNumber(row[BOQ_ITEM_COLUMNS.VOLUME]),
        unit: row[BOQ_ITEM_COLUMNS.UNIT] || "",
        unit_price: safeParseNumber(row[BOQ_ITEM_COLUMNS.UNIT_PRICE]),
        subtotal: safeParseNumber(row[BOQ_ITEM_COLUMNS.SUBTOTAL]),
        created_at: row[BOQ_ITEM_COLUMNS.CREATED_AT] || "",
      }))
      .sort((a, b) => a.line_no - b.line_no)

    // ===== VALIDATE & RECALCULATE IF NEEDED =====
    const calculatedTotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const calculatedItems = items.length

    // Jika ada perbedaan, update header di sheet
    if (calculatedTotal !== header.total_value || calculatedItems !== header.total_items) {
      logger.info('Recalculating BOQ totals', { 
        boq_id, 
        old_total: header.total_value, 
        new_total: calculatedTotal,
        old_items: header.total_items,
        new_items: calculatedItems
      })

      // Cari row index untuk update
      const rowIndex = headerRows.findIndex(row => row[BOQ_HEADER_COLUMNS.BOQ_ID] === boq_id)
      const rowNumber = rowIndex + 2 // +2 karena header di baris 1

      // Update TOTAL_ITEMS dan TOTAL_VALUE
      await withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `BOQ_HEADER!F${rowNumber}:G${rowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[calculatedItems, calculatedTotal]]
          }
        })
      )

      // Update header di response
      header.total_items = calculatedItems
      header.total_value = calculatedTotal
    }

    const response: BoqDetailResponse = {
      header,
      items
    }

    logger.info('BOQ detail fetched successfully', { 
      boq_id, 
      item_count: items.length,
      total_value: header.total_value 
    })

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store'
      }
    })

  } catch (error: any) {
    logger.error('GET BOQ Detail Error', error, { boq_id: params.boq_id })

    // Map error codes
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
      { message: "Gagal mengambil data BOQ" },
      { status: 500 }
    )
  }
}

/* ================= UPDATE BOQ ================= */
export async function PUT(
  req: Request,
  { params }: { params: { boq_id: string } }
) {
  try {
    const boq_id = params.boq_id
    const body = await req.json()
    const { header, items } = body

    logger.info('Updating BOQ', { boq_id, item_count: items?.length })

    if (!header || !items) {
      return NextResponse.json(
        { message: "Header dan items diperlukan" },
        { status: 400 }
      )
    }

    // ===== VALIDATE STATUS =====
    if (header.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Hanya BOQ dengan status DRAFT yang bisa diupdate" },
        { status: 403 }
      )
    }

    const now = new Date().toISOString()

    // ===== UPDATE HEADER =====
    const headerRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `BOQ_HEADER!A2:J`,
      })
    )

    const headerRows = headerRes.data.values || []
    const headerIndex = headerRows.findIndex(row => row[BOQ_HEADER_COLUMNS.BOQ_ID] === boq_id)

    if (headerIndex === -1) {
      return NextResponse.json(
        { message: "BOQ tidak ditemukan" },
        { status: 404 }
      )
    }

    const headerRowNumber = headerIndex + 2

    // Update header
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `BOQ_HEADER!A${headerRowNumber}:J${headerRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            boq_id,
            header.project_id || "",
            header.project_name || "Untitled",
            header.customer_name || "-",
            header.status || "DRAFT",
            items.length,
            items.reduce((sum: number, item: any) => 
              sum + (item.volume * item.unit_price), 0
            ),
            header.created_by || "System",
            header.created_at || now,
            now, // updated_at
          ]]
        }
      })
    )

    // ===== DELETE ALL EXISTING ITEMS =====
    const itemsRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `BOQ_ITEMS!A2:J`,
      })
    )

    const itemRows = itemsRes.data.values || []
    
    // Cari semua baris items yang akan dihapus
    const itemIndices = itemRows
      .map((row, idx) => row[BOQ_ITEM_COLUMNS.BOQ_ID] === boq_id ? idx + 2 : -1)
      .filter(idx => idx !== -1)
      .sort((a, b) => b - a) // Hapus dari bawah ke atas

    // Hapus items (clear values)
    for (const rowNum of itemIndices) {
      await withRetry(() =>
        sheets.spreadsheets.values.clear({
          spreadsheetId: SHEET_ID,
          range: `BOQ_ITEMS!A${rowNum}:J${rowNum}`,
        })
      )
    }

    // ===== INSERT NEW ITEMS =====
    for (const item of items) {
      const subtotal = (item.volume || 0) * (item.unit_price || 0)
      
      await withRetry(() =>
        sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: `BOQ_ITEMS!A:J`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[
              item.item_id || `ITEM-${Date.now()}-${Math.random()}`,
              boq_id,
              item.line_no || 1,
              item.description || "",
              item.category || "",
              item.volume || 0,
              item.unit || "",
              item.unit_price || 0,
              subtotal,
              now,
            ]]
          }
        })
      )
    }

    logger.info('BOQ updated successfully', { boq_id, item_count: items.length })

    return NextResponse.json({
      message: "BOQ berhasil diupdate",
      header: {
        ...header,
        total_items: items.length,
        total_value: items.reduce((sum: number, item: any) => 
          sum + (item.volume * item.unit_price), 0
        ),
        updated_at: now
      }
    })

  } catch (error: any) {
    logger.error('PUT BOQ Error', error, { boq_id: params.boq_id })

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
      { message: "Gagal update BOQ" },
      { status: 500 }
    )
  }
}

/* ================= DELETE BOQ (SOFT DELETE) ================= */
export async function DELETE(
  req: Request,
  { params }: { params: { boq_id: string } }
) {
  try {
    const boq_id = params.boq_id
    logger.info('Deleting BOQ', { boq_id })

    // ===== CHECK STATUS =====
    const headerRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `BOQ_HEADER!A2:J`,
      })
    )

    const headerRows = headerRes.data.values || []
    const headerIndex = headerRows.findIndex(row => row[BOQ_HEADER_COLUMNS.BOQ_ID] === boq_id)

    if (headerIndex === -1) {
      return NextResponse.json(
        { message: "BOQ tidak ditemukan" },
        { status: 404 }
      )
    }

    const status = headerRows[headerIndex][BOQ_HEADER_COLUMNS.STATUS] || "DRAFT"
    
    if (status !== "DRAFT") {
      return NextResponse.json(
        { message: "Hanya BOQ dengan status DRAFT yang bisa dihapus" },
        { status: 403 }
      )
    }

    const headerRowNumber = headerIndex + 2

    // ===== SOFT DELETE HEADER (change status to ARCHIVED) =====
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `BOQ_HEADER!E${headerRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["ARCHIVED"]]
        }
      })
    )

    // ===== SOFT DELETE ITEMS =====
    const itemsRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `BOQ_ITEMS!A2:J`,
      })
    )

    const itemRows = itemsRes.data.values || []
    
    // Cari semua baris items yang akan di-archive
    const itemIndices = itemRows
      .map((row, idx) => row[BOQ_ITEM_COLUMNS.BOQ_ID] === boq_id ? idx + 2 : -1)
      .filter(idx => idx !== -1)

    // Untuk soft delete items, bisa juga di-archive atau dihapus
    // Di sini kita akan hapus items (clear values) karena header sudah di-archive
    for (const rowNum of itemIndices) {
      await withRetry(() =>
        sheets.spreadsheets.values.clear({
          spreadsheetId: SHEET_ID,
          range: `BOQ_ITEMS!A${rowNum}:J${rowNum}`,
        })
      )
    }

    logger.info('BOQ deleted successfully', { boq_id, items_deleted: itemIndices.length })

    return NextResponse.json({
      message: "BOQ berhasil dihapus",
      deleted_items: itemIndices.length
    })

  } catch (error: any) {
    logger.error('DELETE BOQ Error', error, { boq_id: params.boq_id })

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
      { message: "Gagal menghapus BOQ" },
      { status: 500 }
    )
  }
}
