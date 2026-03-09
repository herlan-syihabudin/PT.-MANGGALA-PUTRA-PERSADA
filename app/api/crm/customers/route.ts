import { NextResponse } from "next/server"
import { google } from "googleapis"
import { randomUUID } from "crypto"

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

const RETRYABLE = [408, 429, 502, 503]
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    const code = error.code || error.response?.status
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

// ==================== GET ====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)))
    const search = searchParams.get("search")?.toLowerCase().trim()
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    
    const allowedSort: (keyof Customer)[] = [
      "company_name", "customer_type", "pic_name", "email",
      "city", "province", "status", "created_at"
    ]
    let sortBy = searchParams.get("sortBy") as keyof Customer | null
if (!sortBy || !allowedSort.includes(sortBy)) sortBy = "company_name"
    
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc"

    const res = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:P`,
    }))

    let customers: Customer[] = (res.data.values || [])
      .filter((r: any[]) => r?.length >= 16 && r[0] && r[1])
      .map((r: string[]) => ({
        customer_id: r[0],
        company_name: r[1],
        customer_type: r[2],
        pic_name: r[3],
        pic_position: r[4] || "",
        email: r[5] || "",
        phone: r[6] || "",
        npwp: r[7] || "",
        address: r[8] || "",
        city: r[9] || "",
        province: r[10] || "",
        postal_code: r[11] || "",
        status: r[12] || "Active",
        notes: r[13] || "",
        created_at: r[14] || "",
created_by: r[15] || "",
      }))

    // Apply filters
    if (search) {
      customers = customers.filter(c => 
        (c.company_name || "").toLowerCase().includes(search) ||
        (c.pic_name || "").toLowerCase().includes(search) ||
        (c.email || "").toLowerCase().includes(search)
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

    logger.info('GET Success', { page, limit, total })

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
  try {
    const body = await req.json()
    const { company_name, customer_type = "Owner", pic_name, pic_position = "", email = "", phone, npwp = "", address = "", city = "", province = "", postal_code = "", status = "Active", notes = "" } = body

    // Validation
    if (!company_name?.trim()) return NextResponse.json({ message: "Nama perusahaan wajib diisi" }, { status: 400 })
    if (!pic_name?.trim()) return NextResponse.json({ message: "Nama PIC wajib diisi" }, { status: 400 })
    if (!phone?.trim()) return NextResponse.json({ message: "Nomor telepon wajib diisi" }, { status: 400 })
    if (!validate.email(email)) return NextResponse.json({ message: "Format email tidak valid" }, { status: 400 })
    if (!validate.phone(phone)) return NextResponse.json({ message: "Nomor telepon harus 10-15 digit" }, { status: 400 })
    if (!validate.npwp(npwp)) return NextResponse.json({ message: "NPWP harus 15 digit" }, { status: 400 })

    // Check duplicate
    const check = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:B`,
    }))
    
    const name = company_name.toLowerCase().trim()
    const exists = (check.data.values || [])
      .some(r => (r?.[1] || "").toLowerCase().trim() === name)
    
    if (exists) return NextResponse.json({ message: "Perusahaan sudah terdaftar" }, { status: 409 })

    const customer_id = `CUST-${randomUUID().slice(0,8)}`
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
    logger.error('POST Failed', error, { body: await req.json().catch(() => ({})) })
    const status = error.code || error.response?.status
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ success: false, message: error.message }, { status })
    }
    return NextResponse.json({ success: false, message: "Gagal menyimpan customer" }, { status: 500 })
  }
}
