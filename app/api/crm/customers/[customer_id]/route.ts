import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
function validateEnvironment() {
  const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_CRM_ID'] as const
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

/* ================= CONFIG ================= */
const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CUSTOMERS"
const HEADER_ROWS = 1
const ROW_OFFSET = HEADER_ROWS + 1
const RETRYABLE_CODES = [408, 429, 502, 503] as const

/* ================= TYPES ================= */
interface Customer {
  customer_id: string
  company_name: string
  customer_type: string
  pic_name: string
  pic_position: string
  email: string
  phone: string
  npwp: string
  address: string
  city: string
  province: string
  postal_code: string
  status: string
  notes: string
  created_at: string
  created_by: string
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

async function getAllRows() {
  const res = await withRetry(() => 
    sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:P`,
    })
  )
  return res.data.values || []
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

function validateNPWP(npwp: string): boolean {
  const digits = npwp.replace(/\D/g, '')
  return digits.length === 15 || digits.length === 0
}

function isCustomerRow(row: any[]): row is string[] {
  return row && row.length >= 16 && row[0]
}

function mapRowToCustomer(row: string[]): Customer {
  return {
    customer_id: row[0],
    company_name: row[1],
    customer_type: row[2],
    pic_name: row[3],
    pic_position: row[4],
    email: row[5],
    phone: row[6],
    npwp: row[7],
    address: row[8],
    city: row[9],
    province: row[10],
    postal_code: row[11],
    status: row[12] || "Active",
    notes: row[13] || "",
    created_at: row[14],
    created_by: row[15],
  }
}

/* =====================================================
   GET : CUSTOMER DETAIL
===================================================== */
export async function GET(
  req: Request,
  { params }: { params: { customer_id: string } }
) {
  try {
    const rows = await getAllRows()

    const row = rows.find(
      (r) => r[0] && r[0] === params.customer_id
    )

    if (!row || !isCustomerRow(row)) {
      return NextResponse.json(
        { message: "Customer tidak ditemukan" },
        { status: 404 }
      )
    }

    const customer = mapRowToCustomer(row)

    logger.info('GET Customer Detail Success', { customerId: params.customer_id })

    return NextResponse.json(customer, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error: any) {
    logger.error('GET Customer Detail', error, { customerId: params.customer_id })

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
      { message: "Gagal mengambil data customer" },
      { status: 500 }
    )
  }
}

/* =====================================================
   PUT : UPDATE CUSTOMER
===================================================== */
export async function PUT(
  req: Request,
  { params }: { params: { customer_id: string } }
) {
  try {
    const body = await req.json()
    const rows = await getAllRows()

    const rowIndex = rows.findIndex(
      (r) => r[0] === params.customer_id
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Customer tidak ditemukan" },
        { status: 404 }
      )
    }

    // Validasi input
    if (!body.company_name?.trim()) {
      return NextResponse.json(
        { message: "Nama perusahaan wajib diisi" },
        { status: 400 }
      )
    }

    if (!body.pic_name?.trim()) {
      return NextResponse.json(
        { message: "Nama PIC wajib diisi" },
        { status: 400 }
      )
    }

    if (!body.phone?.trim()) {
      return NextResponse.json(
        { message: "Nomor telepon wajib diisi" },
        { status: 400 }
      )
    }

    if (body.email && !validateEmail(body.email)) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 }
      )
    }

    if (!validatePhone(body.phone)) {
      return NextResponse.json(
        { message: "Nomor telepon harus 10-15 digit" },
        { status: 400 }
      )
    }

    if (body.npwp && !validateNPWP(body.npwp)) {
      return NextResponse.json(
        { message: "NPWP harus 15 digit" },
        { status: 400 }
      )
    }

    const existingRow = rows[rowIndex]
    const sheetRowNumber = rowIndex + ROW_OFFSET

    // Partial update - merge dengan data existing
    const updatedValues = [
      params.customer_id,
      body.company_name?.trim() ?? existingRow[1],
      body.customer_type ?? existingRow[2],
      body.pic_name?.trim() ?? existingRow[3],
      body.pic_position ?? existingRow[4],
      body.email?.trim() ?? existingRow[5],
      body.phone?.trim() ?? existingRow[6],
      body.npwp ?? existingRow[7],
      body.address ?? existingRow[8],
      body.city ?? existingRow[9],
      body.province ?? existingRow[10],
      body.postal_code ?? existingRow[11],
      body.status ?? existingRow[12] || "Active",
      body.notes ?? existingRow[13] || "",
      existingRow[14], // keep created_at
      existingRow[15], // keep created_by
    ]

    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A${sheetRowNumber}:P${sheetRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [updatedValues] },
      })
    )

    logger.info('PUT Customer Success', { customerId: params.customer_id })

    return NextResponse.json({ 
      success: true,
      message: "Customer berhasil diupdate" 
    })

  } catch (error: any) {
    logger.error('PUT Customer', error, { customerId: params.customer_id })

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { success: false, message: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { success: false, message: "Gagal update customer" },
      { status: 500 }
    )
  }
}

/* =====================================================
   DELETE : SOFT DELETE (DEFAULT) + HARD DELETE OPTION
===================================================== */
export async function DELETE(
  req: Request,
  { params }: { params: { customer_id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const hard = searchParams.get("hard") === "true"

    const rows = await getAllRows()

    const rowIndex = rows.findIndex(
      (r) => r[0] === params.customer_id
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Customer tidak ditemukan" },
        { status: 404 }
      )
    }

    const sheetRowNumber = rowIndex + ROW_OFFSET

    if (hard) {
      // Hard delete - clear semua data
      await withRetry(() =>
        sheets.spreadsheets.values.clear({
          spreadsheetId: SHEET_ID,
          range: `${SHEET_NAME}!A${sheetRowNumber}:P${sheetRowNumber}`,
        })
      )
      logger.info('DELETE Customer Hard', { customerId: params.customer_id })
    } else {
      // Soft delete - update status jadi Inactive
      await withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${SHEET_NAME}!M${sheetRowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [["Inactive"]] },
        })
      )
      logger.info('DELETE Customer Soft', { customerId: params.customer_id })
    }

    return NextResponse.json({ 
      success: true,
      message: hard ? "Customer dihapus permanen" : "Customer dinonaktifkan"
    })

  } catch (error: any) {
    logger.error('DELETE Customer', error, { customerId: params.customer_id })

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { success: false, message: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { success: false, message: "Gagal menghapus customer" },
      { status: 500 }
    )
  }
}
