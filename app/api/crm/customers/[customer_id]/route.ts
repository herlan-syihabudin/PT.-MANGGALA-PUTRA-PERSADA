import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

// ==================== ENVIRONMENT ====================
const requiredEnv = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_CRM_ID'] as const
for (const env of requiredEnv) {
  if (!process.env[env]) throw new Error(`Missing ${env}`)
}

// ==================== GOOGLE SHEETS ====================
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CUSTOMERS"
const HEADER_ROWS = 1
const ROW_OFFSET = HEADER_ROWS + 1
const RETRYABLE = [408, 429, 502, 503]

// ==================== TYPES ====================
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

// ==================== HELPERS ====================
const logger = {
  error: (context: string, error: any, meta = {}) => console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', context, error: { message: error?.message, code: error?.code }, ...meta })),
  info: (context: string, meta = {}) => console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', context, ...meta }))
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    const code = Number(error.code || error.response?.status)
    if (retries > 0 && RETRYABLE.includes(code)) {
      await new Promise(r => setTimeout(r, 1000 * (4 - retries)))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

async function getAllRows() {
  const res = await withRetry(() => sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:P`,
  }))
  return (res.data.values || []).filter(r => r[0])
}

const validate = {
  email: (e: string) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
  phone: (p: string) => {
    if (!p) return true
    const digits = p.replace(/\D/g, '')
    return digits.length >= 10 && digits.length <= 15
  },
  npwp: (n: string) => !n || [0, 15].includes(n.replace(/\D/g, '').length)
}

function mapRowToCustomer(row: string[]): Customer {
  return {
    customer_id: row[0] || "",
    company_name: row[1] || "",
    customer_type: row[2] || "",
    pic_name: row[3] || "",
    pic_position: row[4] || "",
    email: row[5] || "",
    phone: row[6] || "",
    npwp: row[7] || "",
    address: row[8] || "",
    city: row[9] || "",
    province: row[10] || "",
    postal_code: row[11] || "",
    status: row[12] || "Active",
    notes: row[13] || "",
    created_at: row[14] || "",
    created_by: row[15] || "",
  }
}

// ==================== GET ====================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const { customer_id } = await params
    const rows = await getAllRows()
    
    const row = rows.find(r => r[0] === customer_id)
    if (!row) {
      return NextResponse.json({ message: "Customer tidak ditemukan" }, { status: 404 })
    }

    logger.info('GET Success', { customer_id })
    return NextResponse.json(mapRowToCustomer(row), {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=120' }
    })

  } catch (error: any) {
    logger.error('GET Failed', error)
    const status = error.code || error.response?.status
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ message: error.message }, { status })
    }
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 })
  }
}

// ==================== PUT ====================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const { customer_id } = await params
    const body = await req.json()
    const rows = await getAllRows()

    const rowIndex = rows.findIndex(r => r[0] === customer_id)
    if (rowIndex === -1) {
      return NextResponse.json({ message: "Customer tidak ditemukan" }, { status: 404 })
    }

    // Validation
    if (!body.company_name?.trim()) return NextResponse.json({ message: "Nama perusahaan wajib diisi" }, { status: 400 })
    if (!body.pic_name?.trim()) return NextResponse.json({ message: "Nama PIC wajib diisi" }, { status: 400 })
    if (!body.phone?.trim()) return NextResponse.json({ message: "Nomor telepon wajib diisi" }, { status: 400 })
    if (!validate.email(body.email)) return NextResponse.json({ message: "Format email tidak valid" }, { status: 400 })
    if (!validate.phone(body.phone)) return NextResponse.json({ message: "Nomor telepon harus 10-15 digit" }, { status: 400 })
    if (!validate.npwp(body.npwp)) return NextResponse.json({ message: "NPWP harus 15 digit" }, { status: 400 })

    // Check duplicate name (excluding current)
    const name = body.company_name.toLowerCase().trim()
    const duplicate = rows.some((r, i) => 
      i !== rowIndex && (r[1] || "").toLowerCase().trim() === name
    )
    if (duplicate) return NextResponse.json({ message: "Nama perusahaan sudah digunakan" }, { status: 409 })

    const existing = rows[rowIndex]
    const updatedValues = [
      customer_id,
      body.company_name?.trim() ?? existing[1],
      body.customer_type ?? existing[2] ?? "",
      body.pic_name?.trim() ?? existing[3],
      body.pic_position ?? existing[4] ?? "",
      body.email?.trim() ?? existing[5] ?? "",
      body.phone?.trim() ?? existing[6],
      body.npwp ?? existing[7] ?? "",
      body.address ?? existing[8] ?? "",
      body.city ?? existing[9] ?? "",
      body.province ?? existing[10] ?? "",
      body.postal_code ?? existing[11] ?? "",
      body.status ?? existing[12] ?? "Active",
      body.notes ?? existing[13] ?? "",
      existing[14], // keep created_at
      existing[15], // keep created_by
    ]

    await withRetry(() => sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${rowIndex + ROW_OFFSET}:P${rowIndex + ROW_OFFSET}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedValues] }
    }))

    logger.info('PUT Success', { customer_id })
    return NextResponse.json({ success: true, message: "Customer berhasil diupdate" })

  } catch (error: any) {
    logger.error('PUT Failed', error)
    const status = error.code || error.response?.status
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ success: false, message: error.message }, { status })
    }
    return NextResponse.json({ success: false, message: "Gagal update customer" }, { status: 500 })
  }
}

// ==================== DELETE ====================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ customer_id: string }> }
) {
  try {
    const { customer_id } = await params
    const { searchParams } = new URL(req.url)
    const hard = searchParams.get("hard") === "true"

    const rows = await getAllRows()
    const rowIndex = rows.findIndex(r => r[0] === customer_id)
    if (rowIndex === -1) {
      return NextResponse.json({ message: "Customer tidak ditemukan" }, { status: 404 })
    }

    if (hard) {
      // Get sheet metadata to find sheet ID
      const sheetMeta = await withRetry(() => sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID,
        ranges: [],
        includeGridData: false
      }))
      
      const sheet = sheetMeta.data.sheets?.find(s => s.properties?.title === SHEET_NAME)
      if (!sheet?.properties?.sheetId) {
        return NextResponse.json({ message: "Sheet tidak ditemukan" }, { status: 404 })
      }

      // Hard delete - remove entire row using batchUpdate
      await withRetry(() => sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: "ROWS",
                startIndex: rowIndex + HEADER_ROWS,
                endIndex: rowIndex + HEADER_ROWS + 1
              }
            }
          }]
        }
      }))
      logger.info('DELETE Hard Success', { customer_id })
    } else {
      // Soft delete - update status to Inactive
      await withRetry(() => sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!M${rowIndex + ROW_OFFSET}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Inactive"]] }
      }))
      logger.info('DELETE Soft Success', { customer_id })
    }

    return NextResponse.json({ 
      success: true, 
      message: hard ? "Customer dihapus permanen" : "Customer dinonaktifkan" 
    })

  } catch (error: any) {
    logger.error('DELETE Failed', error)
    const status = error.code || error.response?.status
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ success: false, message: error.message }, { status })
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus customer" }, { status: 500 })
  }
}
