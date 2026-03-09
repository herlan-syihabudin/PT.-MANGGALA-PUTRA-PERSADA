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
const INQUIRY_SHEET = "CRM_INQUIRY"
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
  total_inquiries?: number
}

// ==================== CONSTANTS ====================
const CUSTOMER_COLS = {
  ID: 0,
  COMPANY: 1,
  TYPE: 2,
  PIC_NAME: 3,
  PIC_POS: 4,
  EMAIL: 5,
  PHONE: 6,
  NPWP: 7,
  ADDRESS: 8,
  CITY: 9,
  PROVINCE: 10,
  POSTAL: 11,
  STATUS: 12,
  NOTES: 13,
  CREATED_AT: 14,
  CREATED_BY: 15,
} as const

const INQUIRY_COLS = {
  ID: 0,
  INQUIRY_ID: 1,
  CUSTOMER_ID: 2, // Kolom ke-3 adalah customer_id
  // ... kolom lainnya
} as const

// ==================== HELPERS ====================
const logger = {
  error: (context: string, error: any, meta = {}) =>
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      context,
      error: { message: error?.message, code: error?.code },
      ...meta
    })),

  warn: (context: string, meta = {}) =>
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      context,
      ...meta
    })),

  info: (context: string, meta = {}) =>
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      context,
      ...meta
    }))
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

const validate = {
  email: (e: string) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
  phone: (p: string) => {
    if (!p) return true
    const digits = p.replace(/\D/g, '')
    return digits.length >= 10 && digits.length <= 15
  },
  npwp: (n: string) => !n || [0, 15].includes(n.replace(/\D/g, '').length)
}

function isCustomerRow(row: any[]): row is string[] {
  return row && row.length >= 16 && row[0] && row[1]
}

// ==================== GET ====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    
    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)))
    const search = searchParams.get("search")?.toLowerCase()
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    
    const allowedSort: (keyof Customer)[] = [
      "company_name", "customer_type", "pic_name", "email",
      "city", "province", "status", "created_at"
    ]
    let sortBy = searchParams.get("sortBy") as keyof Customer
    if (!allowedSort.includes(sortBy)) sortBy = "company_name"
    
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc"

    // Fetch customers and inquiries in parallel with error handling
    const [custRes, inqRes] = await Promise.allSettled([
      withRetry(() => sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:P`,
      })),
      withRetry(() => sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${INQUIRY_SHEET}!A2:C`, // Cukup ambil kolom A-C
      }))
    ])

    // Handle customers data
    const rows = custRes.status === 'fulfilled' ? custRes.value.data.values || [] : []
    
    // Handle inquiries data
    let inquiryRows: any[] = []
    if (inqRes.status === 'fulfilled') {
      inquiryRows = inqRes.value.data.values || []
    } else {
      logger.warn('Failed to fetch inquiries', inqRes.reason)
    }

    let customers: Customer[] = rows
      .filter(isCustomerRow)
      .map((r) => {
        const customer_id = r[CUSTOMER_COLS.ID]
        const total_inquiries = inquiryRows.filter(
          (i) => i[INQUIRY_COLS.CUSTOMER_ID] === customer_id
        ).length

        return {
          customer_id,
          company_name: r[CUSTOMER_COLS.COMPANY],
          customer_type: r[CUSTOMER_COLS.TYPE],
          pic_name: r[CUSTOMER_COLS.PIC_NAME],
          pic_position: r[CUSTOMER_COLS.PIC_POS] || "",
          email: r[CUSTOMER_COLS.EMAIL] || "",
          phone: r[CUSTOMER_COLS.PHONE] || "",
          npwp: r[CUSTOMER_COLS.NPWP] || "",
          address: r[CUSTOMER_COLS.ADDRESS] || "",
          city: r[CUSTOMER_COLS.CITY] || "",
          province: r[CUSTOMER_COLS.PROVINCE] || "",
          postal_code: r[CUSTOMER_COLS.POSTAL] || "",
          status: r[CUSTOMER_COLS.STATUS] || "Active",
          notes: r[CUSTOMER_COLS.NOTES] || "",
          created_at: r[CUSTOMER_COLS.CREATED_AT] || "",
          created_by: r[CUSTOMER_COLS.CREATED_BY] || "",
          total_inquiries
        }
      })

    // Apply filters
    if (search) {
      customers = customers.filter(c => 
        c.company_name.toLowerCase().includes(search) ||
        c.pic_name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
      )
    }

    if (status) customers = customers.filter(c => c.status === status)
    if (type && type.toLowerCase() !== "all") customers = customers.filter(c => c.customer_type === type)

    // Apply sorting
    customers.sort((a, b) => {
      if (sortBy === 'created_at') {
        return sortOrder === 'asc' 
          ? new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()
          : new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime()
      }
      const aVal = String(a[sortBy] || '').toLowerCase()
      const bVal = String(b[sortBy] || '').toLowerCase()
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })

    const total = customers.length
    const paginated = customers.slice((page - 1) * limit, page * limit)

    logger.info('GET Success', { page, limit, total, returned: paginated.length })

    return NextResponse.json({
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
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

// ==================== POST ====================
export async function POST(req: Request) {
  let body: any = {}
  
  try {
    body = await req.json()

    const {
      company_name,
      customer_type = "Owner",
      pic_name,
      pic_position = "",
      email = "",
      phone,
      npwp = "",
      address = "",
      city = "",
      province = "",
      postal_code = "",
      status = "Active",
      notes = "",
    } = body

    // Validation
    if (!company_name?.trim()) return NextResponse.json({ message: "Nama perusahaan wajib diisi" }, { status: 400 })
    if (!pic_name?.trim()) return NextResponse.json({ message: "Nama PIC wajib diisi" }, { status: 400 })
    if (!phone?.trim()) return NextResponse.json({ message: "Nomor telepon wajib diisi" }, { status: 400 })
    if (!validate.email(email)) return NextResponse.json({ message: "Format email tidak valid" }, { status: 400 })
    if (!validate.phone(phone)) return NextResponse.json({ message: "Nomor telepon harus 10-15 digit" }, { status: 400 })
    if (!validate.npwp(npwp)) return NextResponse.json({ message: "NPWP harus 15 digit" }, { status: 400 })

    // Check duplicate
    const checkRes = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!B2:B`,
    }))
    
    const name = company_name.toLowerCase().trim()
    const exists = (checkRes.data.values || []).some(r => (r[0] || "").toLowerCase().trim() === name)
    if (exists) return NextResponse.json({ message: "Perusahaan sudah terdaftar" }, { status: 409 })

    // Get all existing customer IDs to generate next number
    const existing = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:A`,
      })
    )

    const idRows = existing.data.values || []
    const numbers = idRows
      .map(r => {
        const id = r[0] || ""
        const num = parseInt(id.replace("CUST-", ""), 10)
        return isNaN(num) ? 0 : num
      })
      .filter(n => n > 0)

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1
    const customer_id = `CUST-${String(nextNumber).padStart(6, "0")}` // 6 digit untuk aman
    
    const created_at = new Date().toISOString()
    const created_by = "admin" // TODO: from session

    await withRetry(() => sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:P`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          customer_id,
          company_name.trim(),
          customer_type,
          pic_name.trim(),
          pic_position,
          email.trim(),
          phone.trim(),
          npwp,
          address,
          city,
          province,
          postal_code,
          status,
          notes,
          created_at,
          created_by,
        ]]
      }
    }))

    logger.info('POST Success', { customer_id, company_name })

    return NextResponse.json({ success: true, customer_id, message: "Customer berhasil ditambahkan" }, { status: 201 })

  } catch (error: any) {
    logger.error('POST Failed', error, { body })
    const status = error.code || error.response?.status
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ success: false, message: error.message }, { status })
    }
    return NextResponse.json({ success: false, message: "Gagal menyimpan customer" }, { status: 500 })
  }
}
