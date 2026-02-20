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

const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CUSTOMERS"

/* ================= CONSTANTS ================= */
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
  return row && row.length >= 16 && row[0] && row[1]
}

/* ==============================
   GET : LIST CUSTOMER
================================ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    
    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)))
    const search = searchParams.get("search")?.toLowerCase()
    const status = searchParams.get("status")
    const type = searchParams.get("type") // ✅ TAMBAH INI
    const sortBy = searchParams.get("sortBy") || "company_name" // ✅ TAMBAH 
    const sortOrder = searchParams.get("sortOrder") || "asc" // ✅ TAMBAH 

    const res = await withRetry(() => 
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:P`,
      })
    )

    const rows = res.data.values || []
    
    let customers: Customer[] = rows
      .filter(isCustomerRow)
      .map((r) => ({
        customer_id: r[0],
        company_name: r[1],
        customer_type: r[2],
        pic_name: r[3],
        pic_position: r[4],
        email: r[5],
        phone: r[6],
        npwp: r[7],
        address: r[8],
        city: r[9],
        province: r[10],
        postal_code: r[11],
        status: r[12] || "Active",
        notes: r[13],
        created_at: r[14],
        created_by: r[15],
      }))

    // Filter
    if (search) {
      customers = customers.filter(c => 
        c.company_name.toLowerCase().includes(search) ||
        c.pic_name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
      )
    }

    if (status) {
      customers = customers.filter(c => c.status === status)
    }

    if (type && type !== "all") { // ✅ TAMBAH FILTER TYPE
      customers = customers.filter(c => c.customer_type === type)
    }

    // Sort
    customers.sort((a, b) => {
      let aVal = a[sortBy as keyof Customer] || "" // ✅ PAKE SORTBY
      let bVal = b[sortBy as keyof Customer] || ""
      
      if (sortBy === "created_at") {
        return sortOrder === "asc"
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime()
      }
      
      const comparison = String(aVal).localeCompare(String(bVal))
      return sortOrder === "asc" ? comparison : -comparison
    })

    // Pagination
    const total = customers.length
    const paginated = customers.slice((page - 1) * limit, page * limit)

    logger.info('GET Customers Success', { 
      page, 
      limit, 
      total,
      filtered: paginated.length 
    })

    return NextResponse.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error: any) {
    logger.error('GET Customers', error)

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

/* ==============================
   POST : CREATE CUSTOMER
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json()

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

    // VALIDATION
    if (!company_name || !company_name.trim()) {
      return NextResponse.json(
        { message: "Nama perusahaan wajib diisi" },
        { status: 400 }
      )
    }

    if (!pic_name || !pic_name.trim()) {
      return NextResponse.json(
        { message: "Nama PIC wajib diisi" },
        { status: 400 }
      )
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { message: "Nomor telepon wajib diisi" },
        { status: 400 }
      )
    }

    // Format validations
    if (email && !validateEmail(email)) {
      return NextResponse.json(
        { message: "Format email tidak valid" },
        { status: 400 }
      )
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { message: "Nomor telepon harus 10-15 digit" },
        { status: 400 }
      )
    }

    if (npwp && !validateNPWP(npwp)) {
      return NextResponse.json(
        { message: "NPWP harus 15 digit" },
        { status: 400 }
      )
    }

    // Check duplicate
    const checkRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!B2:B`, // Kolom company_name
      })
    )

    const existingCompanies = (checkRes.data.values || [])
      .map(r => r[0]?.toLowerCase().trim())
      .filter(Boolean)

    if (existingCompanies.includes(company_name.toLowerCase().trim())) {
      return NextResponse.json(
        { message: "Perusahaan sudah terdaftar" },
        { status: 409 }
      )
    }

    const customer_id = `CUST-${Date.now()}`
    const created_at = new Date().toISOString()
    
    // TODO: Get from session
    const created_by = "admin" 

    await withRetry(() =>
      sheets.spreadsheets.values.append({
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
          ]],
        },
      })
    )

    logger.info('POST Customer Success', { 
      customer_id, 
      company_name 
    })

    return NextResponse.json(
      {
        success: true,
        customer_id,
        message: "Customer berhasil ditambahkan",
      },
      { status: 201 }
    )

  } catch (error: any) {
    logger.error('POST Customer', error, { body: await req.json().catch(() => ({})) })

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
      { 
        success: false, 
        message: "Gagal menyimpan customer" 
      },
      { status: 500 }
    )
  }
}
