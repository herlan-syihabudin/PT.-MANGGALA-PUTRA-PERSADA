import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
const REQUIRED_ENV = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_CRM_ID'] as const
for (const env of REQUIRED_ENV) {
  if (!process.env[env]) {
    console.error(`Missing environment variable: ${env}`)
    throw new Error(`Missing environment variable: ${env}`)
  }
}

// Sanitize private key (remove quotes and fix newlines)
const privateKey = process.env.GOOGLE_PRIVATE_KEY!
  .replace(/\\n/g, '\n')
  .replace(/^["']|["']$/g, '')

/* ================= GOOGLE SHEETS SETUP ================= */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  privateKey,
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_CRM_ID!

/* ================= CONSTANTS ================= */
const COLUMNS = {
  INQUIRY_ID: 0,
  TANGGAL_MASUK: 1,
  CUSTOMER_ID: 2,
  CUSTOMER_NAME: 3,
  NAMA_PEKERJAAN: 4,
  LAYANAN: 5,
  ESTIMASI_NILAI: 6,
  SUMBER: 7,
  ASSIGNED_TO: 8,
  STATUS: 9,
  PRIORITAS: 10,
  LOKASI: 11,
  CATATAN: 12,
  CONVERTED_RAB_ID: 13,
  CONVERTED_PROJECT_ID: 14,
  CREATED_AT: 15,
  CREATED_BY: 16,
  STAGE: 17,
  CONVERTED_PROPOSAL_ID: 18,
} as const

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 100 // requests
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

/* ================= HELPER FUNCTIONS ================= */
function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimit.get(ip)

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

function safeParseDate(dateStr: string): number {
  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? 0 : date.getTime()
  } catch {
    return 0
  }
}

function safeParseNumber(value: any): number {
  if (value === null || value === undefined) return 0
  const cleaned = String(value).replace(/[^\d]/g, "")
  const num = Number(cleaned)
  return isNaN(num) ? 0 : num
}

function isValidRow(row: any[]): boolean {
  return row && !!row[COLUMNS.INQUIRY_ID]
}

function isNotConverted(row: any[]): boolean {
  const rabId = (row[COLUMNS.CONVERTED_RAB_ID] || "").toString().trim()
  const projectId = (row[COLUMNS.CONVERTED_PROJECT_ID] || "").toString().trim()
  const proposalId = (row[COLUMNS.CONVERTED_PROPOSAL_ID] || "").toString().trim()
  return !rabId && !projectId && !proposalId
}

/* ================= MAIN API HANDLER ================= */
export async function GET(req: Request) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    // ===== RATE LIMITING =====
    const clientIp = getClientIp(req)
    if (!checkRateLimit(clientIp)) {
      console.warn(`[${requestId}] Rate limit exceeded for IP: ${clientIp}`)
      return NextResponse.json(
        { message: "Terlalu banyak request, coba lagi nanti" },
        { status: 429 }
      )
    }

    // ===== PARSE QUERY PARAMETERS =====
    const { searchParams } = new URL(req.url)
    
    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    
    // Filters
    const search = searchParams.get('search')?.toLowerCase()
    const layanan = searchParams.get('layanan')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Validate dates if provided
    if (startDate && isNaN(new Date(startDate).getTime())) {
      return NextResponse.json(
        { message: "Format startDate tidak valid" },
        { status: 400 }
      )
    }
    if (endDate && isNaN(new Date(endDate).getTime())) {
      return NextResponse.json(
        { message: "Format endDate tidak valid" },
        { status: 400 }
      )
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { message: "startDate tidak boleh lebih besar dari endDate" },
        { status: 400 }
      )
    }

    // ===== FETCH FROM GOOGLE SHEETS =====
    console.log(`[${requestId}] Fetching data from Google Sheets...`)
    
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!A2:S`,
    }).catch(error => {
      // Handle specific Google Sheets errors
      if (error.code === 404) {
        throw new Error("SHEET_NOT_FOUND")
      }
      if (error.code === 403) {
        throw new Error("ACCESS_DENIED")
      }
      if (error.code === 429) {
        throw new Error("QUOTA_EXCEEDED")
      }
      throw error
    })

    const rows = res.data.values || []
    console.log(`[${requestId}] Fetched ${rows.length} rows`)

    // ===== PROCESS DATA =====
    let inquiries = rows
      .filter(isValidRow)
      .filter(row => {
        const status = (row[COLUMNS.STATUS] || "").toString().toLowerCase().trim()
        return status === "estimating"
      })
      .filter(isNotConverted)
      .map(row => ({
        inquiry_id: row[COLUMNS.INQUIRY_ID],
        tanggal_masuk: row[COLUMNS.TANGGAL_MASUK] || "",
        customer_name: row[COLUMNS.CUSTOMER_NAME] || "-",
        nama_pekerjaan: row[COLUMNS.NAMA_PEKERJAAN] || "Untitled",
        layanan: row[COLUMNS.LAYANAN] || "",
        estimasi_nilai: safeParseNumber(row[COLUMNS.ESTIMASI_NILAI]),
      }))

    // ===== APPLY FILTERS =====
    if (search) {
      inquiries = inquiries.filter(inq => 
        inq.customer_name.toLowerCase().includes(search) ||
        inq.nama_pekerjaan.toLowerCase().includes(search) ||
        inq.inquiry_id.toLowerCase().includes(search)
      )
    }

    if (layanan) {
      inquiries = inquiries.filter(inq => inq.layanan === layanan)
    }

    if (startDate) {
      const start = new Date(startDate).getTime()
      inquiries = inquiries.filter(inq => safeParseDate(inq.tanggal_masuk) >= start)
    }

    if (endDate) {
      const end = new Date(endDate).getTime()
      inquiries = inquiries.filter(inq => safeParseDate(inq.tanggal_masuk) <= end)
    }

    // ===== SORT (newest first) =====
    inquiries.sort((a, b) => {
      const tA = safeParseDate(a.tanggal_masuk)
      const tB = safeParseDate(b.tanggal_masuk)
      return tB - tA
    })

    // ===== CALCULATE SUMMARY =====
    const total_estimasi = inquiries.reduce((sum, inq) => sum + inq.estimasi_nilai, 0)
    const avg_estimasi = inquiries.length > 0 ? total_estimasi / inquiries.length : 0
    
    const by_layanan = inquiries.reduce((acc, inq) => {
      const layanan = inq.layanan || 'Unknown'
      acc[layanan] = (acc[layanan] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // ===== PAGINATION =====
    const total = inquiries.length
    const pages = Math.ceil(total / limit) || 1
    const safePage = Math.min(page, pages)
    const offset = (safePage - 1) * limit
    const paginatedData = inquiries.slice(offset, offset + limit)

    // ===== LOG SUCCESS =====
    const duration = Date.now() - startTime
    console.log(`[${requestId}] Success in ${duration}ms - Found ${total} inquiries`)

    // ===== RETURN RESPONSE =====
    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page: safePage,
        limit,
        total,
        pages
      },
      summary: {
        total_estimasi,
        avg_estimasi,
        by_layanan
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`
      }
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`[${requestId}] Error after ${duration}ms:`, error.message)

    // Handle known errors
    if (error.message === "SHEET_NOT_FOUND") {
      return NextResponse.json(
        { message: "Sheet tidak ditemukan" },
        { status: 404 }
      )
    }
    
    if (error.message === "ACCESS_DENIED") {
      return NextResponse.json(
        { message: "Akses ke Google Sheets ditolak. Periksa service account email dan permissions." },
        { status: 403 }
      )
    }
    
    if (error.message === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { message: "Kuota Google Sheets API habis, coba lagi nanti" },
        { status: 429 }
      )
    }

    // Default error
    return NextResponse.json(
      { 
        message: "Gagal mengambil data pending inquiry",
        requestId 
      },
      { status: 500 }
    )
  }
}
