import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
function validateEnvironment() {
  const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_CRM_ID'] as const
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

const RETRYABLE_CODES = [408, 429, 502, 503] as const

/* ================= TYPES ================= */
interface PendingInquiry {
  inquiry_id: string
  tanggal_masuk: string
  customer_name: string
  nama_pekerjaan: string
  layanan: string
  estimasi_nilai: number
}

interface GetInquiriesResponse {
  data: PendingInquiry[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  summary: {
    total_estimasi: number
    avg_estimasi: number
    by_layanan: Record<string, number>
  }
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

function isValidRow(row: any[]): row is string[] {
  return row && row.length >= 19 && !!row[COLUMNS.INQUIRY_ID]
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

function isNotConverted(row: any[]): boolean {
  const rabId = (row[COLUMNS.CONVERTED_RAB_ID] || "").toString().trim()
  const projectId = (row[COLUMNS.CONVERTED_PROJECT_ID] || "").toString().trim()
  const proposalId = (row[COLUMNS.CONVERTED_PROPOSAL_ID] || "").toString().trim()
  
  return rabId === "" && projectId === "" && proposalId === ""
}

/* ================= GET PENDING INQUIRIES ================= */
export async function GET(req: Request) {
  try {
    
    // ===== PARSE QUERY PARAMETERS =====
const { searchParams } = new URL(req.url)

const pageParam = parseInt(searchParams.get('page') || '1')
const limitParam = parseInt(searchParams.get('limit') || '50')

const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam)
const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 50 : limitParam))

const search = searchParams.get('search')?.toLowerCase()
const layanan = searchParams.get('layanan')
const startDate = searchParams.get('startDate')
const endDate = searchParams.get('endDate')

    // ===== FETCH DATA =====
    const res = await withRetry(() => 
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `CRM_INQUIRY!A2:S`,
      })
    )

    const rows = res.data.values || []

    // ===== FILTER DATA =====
    let pending: PendingInquiry[] = rows
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
      pending = pending.filter(inq => 
        inq.customer_name.toLowerCase().includes(search) ||
        inq.nama_pekerjaan.toLowerCase().includes(search) ||
        inq.inquiry_id.toLowerCase().includes(search)
      )
    }

    if (layanan) {
      pending = pending.filter(inq => inq.layanan === layanan)
    }

    if (startDate) {
      const start = new Date(startDate).getTime()
      pending = pending.filter(inq => safeParseDate(inq.tanggal_masuk) >= start)
    }

    if (endDate) {
      const end = new Date(endDate).getTime()
      pending = pending.filter(inq => safeParseDate(inq.tanggal_masuk) <= end)
    }

    // ===== SORT =====
    pending.sort((a, b) => {
      const tA = safeParseDate(a.tanggal_masuk)
      const tB = safeParseDate(b.tanggal_masuk)
      return tB - tA
    })

    // ===== CALCULATE SUMMARY =====
    const total_estimasi = pending.reduce((sum, inq) => sum + inq.estimasi_nilai, 0)
    const avg_estimasi = pending.length > 0 ? total_estimasi / pending.length : 0
    
    const by_layanan = pending.reduce((acc, inq) => {
      const layanan = inq.layanan || 'Unknown'
      acc[layanan] = (acc[layanan] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // ===== PAGINATION =====
const total = pending.length
const pages = Math.ceil(total / limit) || 1
const safePage = Math.min(page, pages)

const offset = (safePage - 1) * limit
const paginatedData = pending.slice(offset, offset + limit)

    logger.info('GET Pending Inquiries Success', { 
      total, 
      page, 
      pages,
      filters: { search, layanan, startDate, endDate }
    })

    const response: GetInquiriesResponse = {
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
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store'
      }
    })

  } catch (error: any) {
    logger.error('GET Pending Inquiries Error', error)

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
      { message: "Gagal mengambil data pending inquiry" },
      { status: 500 }
    )
  }
}
