// app/api/procurement/vendors/route.ts
import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

// ========== CONSTANTS ==========
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_PROCUREMENT_ID!
const VENDOR_SHEET = "VENDORS"

// 🔥 Column constants dengan tipe lengkap
const COLUMNS = {
  VENDOR_ID: 0,
  VENDOR_CODE: 1,
  VENDOR_NAME: 2,
  PHONE: 3,
  EMAIL: 4,
  ADDRESS: 5,
  CITY: 6,
  BANK_NAME: 7,
  BANK_ACCOUNT: 8,
  NPWP: 9,
  STATUS: 10,
  CREATED_BY: 11,
  UPDATED_BY: 12,
  DELETED_BY: 13,
  CREATED_AT: 14,
  UPDATED_AT: 15,
  DELETED_AT: 16,
  // 🔥 FIELD STRATEGIS untuk next level
  VENDOR_TYPE: 17,      // supplier / subcontractor
  PAYMENT_TERM: 18,     // NET30 / COD / NET15
  IS_BLACKLISTED: 19,   // TRUE / FALSE
  RATING: 20,           // 1-5
} as const

type Vendor = {
  vendor_id: string
  vendor_code: string
  vendor_name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  bank_name?: string
  bank_account?: string
  npwp?: string
  status: "ACTIVE" | "INACTIVE"
  vendor_type?: "supplier" | "subcontractor" | "both"
  payment_term?: string
  is_blacklisted?: boolean
  rating?: number
  created_by?: string
  updated_by?: string
  deleted_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// ========== PRODUCTION-GRADE UTILITIES ==========

/**
 * 🔥 CEK DELETED - Handle semua kemungkinan value kosong
 */
const isDeleted = (val: any): boolean => {
  return val && String(val).trim() !== ""
}

/**
 * 🔥 SANITIZE - Handle spasi dan empty string dengan benar
 */
function sanitize(str: any): string | undefined {
  if (str === undefined || str === null) return undefined
  const val = String(str).trim()
  return val === "" ? undefined : val
}

/**
 * 🔥 NORMALIZE untuk case-insensitive comparison
 */
function normalize(str: any): string {
  return String(str || "").trim().toLowerCase()
}

/**
 * 🔥 SAFE DATE PARSING - Mencegah NaN
 */
const getTime = (d?: string): number => {
  return new Date(d || 0).getTime()
}

/**
 * 🔥 VALIDASI EMAIL - Lebih strict
 */
function isValidEmail(email?: string): boolean {
  if (!email) return true
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(email)
}

/**
 * 🔥 VALIDASI PHONE - Format Indonesia (+62, 62, 08)
 */
function isValidPhone(phone?: string): boolean {
  if (!phone) return true
  const cleaned = phone.replace(/[-\s]/g, '')
  const re = /^(\+62|62|0)[0-9]{9,13}$/
  return re.test(cleaned)
}

/**
 * 🔥 VALIDASI NPWP - 15 digit
 */
function isValidNPWP(npwp?: string): boolean {
  if (!npwp) return true
  const cleaned = npwp.replace(/[.-]/g, '')
  return /^\d{15}$/.test(cleaned)
}

/**
 * 🔥 VALIDASI VENDOR CODE - Format standar
 */
function isValidVendorCode(code: string): boolean {
  return /^[A-Z0-9-]{3,20}$/.test(code)
}

/**
 * 🔥 FILTER ROW KOSONG - Mencegah ghost rows
 */
function isValidRow(row: any[]): boolean {
  return row && row[COLUMNS.VENDOR_ID] && String(row[COLUMNS.VENDOR_ID]).trim() !== ""
}

// ========== RATE LIMITING (Sementara pake Map, siap migrasi ke Redis) ==========
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 50

function checkRateLimit(req: Request): { allowed: boolean; retryAfter?: number } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
             req.headers.get("x-real-ip") ||
             "unknown"
  const now = Date.now()
  
  const record = rateLimit.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW }
  
  if (now > record.resetAt) {
    record.count = 1
    record.resetAt = now + RATE_LIMIT_WINDOW
  } else {
    record.count++
  }
  
  rateLimit.set(ip, record)
  
  // Cleanup expired entries (setiap 100 request)
  if (rateLimit.size > 1000) {
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetAt) {
        rateLimit.delete(key)
      }
    }
  }
  
  return {
    allowed: record.count <= RATE_LIMIT_MAX,
    retryAfter: record.count > RATE_LIMIT_MAX ? Math.ceil((record.resetAt - now) / 1000) : undefined
  }
}

// ========== LOGGING (WAJIB UNTUK ERP) ==========
function log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  }
  
  // Di production, bisa kirim ke logging service
  if (level === 'error') {
    console.error(JSON.stringify(logEntry))
  } else {
    console.log(JSON.stringify(logEntry))
  }
}

// ========== GET ==========
export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(req)
    if (!rateLimitResult.allowed) {
      log('warn', 'Rate limit exceeded', { retryAfter: rateLimitResult.retryAfter })
      return NextResponse.json({
        success: false,
        error: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds`,
      }, { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const vendorType = searchParams.get("vendor_type")
    const includeDeleted = searchParams.get("include_deleted") === "true"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${VENDOR_SHEET}!A2:U`, // 🔥 sampai U (21 columns)
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    // 🔥 FILTER ROW KOSONG
    let rows = (res.data.values || []).filter(isValidRow)

    // 🔥 SOFT DELETE YANG BENAR
    if (!includeDeleted) {
      rows = rows.filter(r => !isDeleted(r[COLUMNS.DELETED_AT]))
    }

    const vendors: Vendor[] = rows.map(r => ({
      vendor_id: r[COLUMNS.VENDOR_ID] || "",
      vendor_code: r[COLUMNS.VENDOR_CODE] || "",
      vendor_name: r[COLUMNS.VENDOR_NAME] || "",
      phone: r[COLUMNS.PHONE] || undefined,
      email: r[COLUMNS.EMAIL] || undefined,
      address: r[COLUMNS.ADDRESS] || undefined,
      city: r[COLUMNS.CITY] || undefined,
      bank_name: r[COLUMNS.BANK_NAME] || undefined,
      bank_account: r[COLUMNS.BANK_ACCOUNT] || undefined,
      npwp: r[COLUMNS.NPWP] || undefined,
      status: r[COLUMNS.STATUS] === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      vendor_type: r[COLUMNS.VENDOR_TYPE] as any || undefined,
      payment_term: r[COLUMNS.PAYMENT_TERM] || undefined,
      is_blacklisted: r[COLUMNS.IS_BLACKLISTED] === "TRUE",
      rating: r[COLUMNS.RATING] ? parseInt(r[COLUMNS.RATING]) : undefined,
      created_by: r[COLUMNS.CREATED_BY] || undefined,
      updated_by: r[COLUMNS.UPDATED_BY] || undefined,
      deleted_by: r[COLUMNS.DELETED_BY] || undefined,
      created_at: r[COLUMNS.CREATED_AT] || "",
      updated_at: r[COLUMNS.UPDATED_AT] || "",
      deleted_at: isDeleted(r[COLUMNS.DELETED_AT]) ? r[COLUMNS.DELETED_AT] : null,
    }))

    let filtered = vendors

    if (status === "ACTIVE" || status === "INACTIVE") {
      filtered = filtered.filter(v => v.status === status)
    }

    if (vendorType) {
      filtered = filtered.filter(v => v.vendor_type === vendorType)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(v =>
        v.vendor_name?.toLowerCase().includes(s) ||
        v.vendor_code?.toLowerCase().includes(s) ||
        v.email?.toLowerCase().includes(s) ||
        v.city?.toLowerCase().includes(s) ||
        v.phone?.toLowerCase().includes(s)
      )
    }

    // 🔥 SORTING AMAN
    filtered.sort((a, b) => getTime(b.created_at) - getTime(a.created_at))

    // Pagination
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    log('info', 'Vendors fetched', { 
      total: filtered.length,
      returned: paginated.length,
      page,
      limit 
    })

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasNext: start + limit < filtered.length,
        hasPrev: page > 1
      },
      error: null,
    })

  } catch (error) {
    log('error', 'GET VENDORS ERROR', { error: String(error) })
    
    if (error instanceof Error && error.message.includes('Google Sheets API')) {
      return NextResponse.json({
        success: false,
        error: "Vendor service temporarily unavailable",
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: "Failed to fetch vendors",
    }, { status: 500 })
  }
}

// ========== POST ==========
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(req)
    if (!rateLimitResult.allowed) {
      log('warn', 'Rate limit exceeded on POST')
      return NextResponse.json({
        success: false,
        error: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds`,
      }, { status: 429 })
    }

    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON payload",
      }, { status: 400 })
    }

    // 🔥 AUTO GENERATE VENDOR CODE (fallback)
    let vendor_code = sanitize(body.vendor_code)?.toUpperCase()
    if (!vendor_code) {
      vendor_code = `VND-${Date.now()}-${nanoid(4).toUpperCase()}`
      log('info', 'Auto-generated vendor code', { vendor_code })
    }

    const vendor_name = sanitize(body.vendor_name)

    // Validation
    if (!vendor_code) {
      return NextResponse.json({
        success: false,
        error: "vendor_code is required",
      }, { status: 400 })
    }

    if (!isValidVendorCode(vendor_code)) {
      return NextResponse.json({
        success: false,
        error: "vendor_code must be 3-20 chars, uppercase letters, numbers, or hyphen",
      }, { status: 400 })
    }

    if (!vendor_name) {
      return NextResponse.json({
        success: false,
        error: "vendor_name is required",
      }, { status: 400 })
    }

    if (vendor_name.length < 2 || vendor_name.length > 100) {
      return NextResponse.json({
        success: false,
        error: "vendor_name must be between 2 and 100 characters",
      }, { status: 400 })
    }

    const email = sanitize(body.email)
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: "Invalid email format",
      }, { status: 400 })
    }

    const phone = sanitize(body.phone)
    if (!isValidPhone(phone)) {
      return NextResponse.json({
        success: false,
        error: "Invalid phone format. Must be Indonesian number (08xx, 62xx, +62xx)",
      }, { status: 400 })
    }

    const npwp = sanitize(body.npwp)
    if (!isValidNPWP(npwp)) {
      return NextResponse.json({
        success: false,
        error: "Invalid NPWP format. Must be 15 digits",
      }, { status: 400 })
    }

    // Check duplicate (soft delete aware)
    const checkRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${VENDOR_SHEET}!A2:U`,
    })

    const rows = (checkRes.data.values || []).filter(isValidRow)
    const exists = rows.some(r =>
      normalize(r[COLUMNS.VENDOR_CODE]) === normalize(vendor_code) &&
      !isDeleted(r[COLUMNS.DELETED_AT])
    )

    if (exists) {
      return NextResponse.json({
        success: false,
        error: "vendor_code must be unique",
      }, { status: 409 })
    }

    const allowedStatus = ["ACTIVE", "INACTIVE"]
    const status = allowedStatus.includes(body.status) ? body.status : "ACTIVE"

    // 🔥 VALIDASI VENDOR TYPE
    const allowedTypes = ["supplier", "subcontractor", "both"]
    const vendor_type = allowedTypes.includes(body.vendor_type) ? body.vendor_type : undefined

    // 🔥 VALIDASI PAYMENT TERM
    const payment_term = body.payment_term?.toUpperCase()
    const validPaymentTerms = ["NET15", "NET30", "NET45", "COD", "DP50"]
    const finalPaymentTerm = validPaymentTerms.includes(payment_term) ? payment_term : undefined

    const vendor_id = "VEN-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    const newVendor: Vendor = {
      vendor_id,
      vendor_code,
      vendor_name,
      phone,
      email,
      address: sanitize(body.address),
      city: sanitize(body.city),
      bank_name: sanitize(body.bank_name),
      bank_account: sanitize(body.bank_account),
      npwp,
      status,
      vendor_type,
      payment_term: finalPaymentTerm,
      is_blacklisted: false,
      rating: undefined,
      created_by: body.created_by || "SYSTEM",
      updated_by: body.created_by || "SYSTEM",
      created_at: now,
      updated_at: now,
      deleted_at: null,
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${VENDOR_SHEET}!A:U`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          newVendor.vendor_id,
          newVendor.vendor_code,
          newVendor.vendor_name,
          newVendor.phone || "",
          newVendor.email || "",
          newVendor.address || "",
          newVendor.city || "",
          newVendor.bank_name || "",
          newVendor.bank_account || "",
          newVendor.npwp || "",
          newVendor.status,
          newVendor.created_by,
          newVendor.updated_by,
          "",
          now,
          now,
          "",
          newVendor.vendor_type || "",
          newVendor.payment_term || "",
          newVendor.is_blacklisted ? "TRUE" : "FALSE",
          newVendor.rating || "",
        ]]
      }
    })

    // 🔥 LOGGING
    log('info', 'Vendor created', {
      vendor_id,
      vendor_code,
      vendor_name,
      by: body.created_by
    })

    return NextResponse.json({
      success: true,
      data: newVendor,
    }, { status: 201 })

  } catch (error) {
    log('error', 'CREATE VENDOR ERROR', { error: String(error) })
    
    if (error instanceof Error && error.message.includes('Google Sheets API')) {
      return NextResponse.json({
        success: false,
        error: "Vendor service temporarily unavailable",
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: "Failed to create vendor",
    }, { status: 500 })
  }
}
