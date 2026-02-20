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
  return row && row.length >= 14 && !!row[COLUMNS.INQUIRY_ID]
}

/* ================= GET PENDING INQUIRIES ================= */
export async function GET() {
  try {
    const res = await withRetry(() => 
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `CRM_INQUIRY!A2:S`,
      })
    )

    const rows = res.data.values || []

    const pending: PendingInquiry[] = rows
      .filter(isValidRow)
      .filter(row => {
        const status = (row[COLUMNS.STATUS] || "").toString().toLowerCase()
        return status === "estimating"
      })
      .filter(row => {
        const rabId = (row[COLUMNS.CONVERTED_RAB_ID] || "").toString().trim()
        return rabId === ""
      })
      .map(row => ({
        inquiry_id: row[COLUMNS.INQUIRY_ID],
        tanggal_masuk: row[COLUMNS.TANGGAL_MASUK] || "",
        customer_name: row[COLUMNS.CUSTOMER_NAME] || "-",
        nama_pekerjaan: row[COLUMNS.NAMA_PEKERJAAN] || "Untitled",
        layanan: row[COLUMNS.LAYANAN] || "",
        estimasi_nilai: Number(
          String(row[COLUMNS.ESTIMASI_NILAI] || 0).replace(/[^\d]/g, "")
        ),
      }))
      .sort((a, b) => {
        const tA = a.tanggal_masuk ? new Date(a.tanggal_masuk).getTime() : 0
        const tB = b.tanggal_masuk ? new Date(b.tanggal_masuk).getTime() : 0
        return tB - tA
      })

    logger.info('GET Pending Inquiries Success', { count: pending.length })

    return NextResponse.json(pending, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error: any) {
    logger.error('GET Pending Inquiries', error)

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
