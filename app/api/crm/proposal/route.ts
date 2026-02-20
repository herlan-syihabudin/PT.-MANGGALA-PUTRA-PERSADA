import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const PROPOSAL_SHEET = "PROPOSAL"

/* ================= CONSTANTS ================= */
const PROPOSAL_COLUMNS = {
  PROPOSAL_ID: 0,
  PIPELINE_ID: 1,
  RAB_ID: 2,
  TOTAL_VALUE: 3,
  STATUS: 4,
  CREATED_AT: 5,
} as const

const RETRYABLE_CODES = [408, 429, 502, 503] as const

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

function getSheets() {
  if (
    !process.env.GOOGLE_CLIENT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY ||
    !process.env.GSHEET_CRM_ID
  ) {
    throw new Error("Environment variables belum lengkap")
  }

  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  return google.sheets({ version: "v4", auth })
}

/* ================= GET PROPOSAL LIST ================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Pagination
    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(100, Number(searchParams.get("limit") || 50))
    
    // Filters
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    logger.info('GET Proposal requested', { page, limit, status, search })

    const sheets = getSheets()

    const response = await withRetry(() => 
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GSHEET_CRM_ID!,
        range: `${PROPOSAL_SHEET}!A2:F`, // Ambil semua baris
      })
    )

    const rows = response.data.values || []

    if (!rows.length) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      })
    }

    // Map data dengan constant
    let proposals = rows
      .filter((r) => r[PROPOSAL_COLUMNS.PROPOSAL_ID]) // Filter row valid
      .map((r) => ({
        proposal_id: r[PROPOSAL_COLUMNS.PROPOSAL_ID] || "",
        pipeline_id: r[PROPOSAL_COLUMNS.PIPELINE_ID] || "",
        rab_id: r[PROPOSAL_COLUMNS.RAB_ID] || "",
        total_value: Number(r[PROPOSAL_COLUMNS.TOTAL_VALUE] || 0),
        status: (r[PROPOSAL_COLUMNS.STATUS] || "DRAFT").toUpperCase(),
        created_at: r[PROPOSAL_COLUMNS.CREATED_AT] || "",
      }))

    // Filter by status
    if (status) {
      proposals = proposals.filter(p => p.status === status.toUpperCase())
    }

    // Search by proposal_id or pipeline_id
    if (search) {
      const s = search.toLowerCase()
      proposals = proposals.filter(p => 
        p.proposal_id.toLowerCase().includes(s) ||
        p.pipeline_id.toLowerCase().includes(s) ||
        p.rab_id.toLowerCase().includes(s)
      )
    }

    // Sort by created_at desc (terbaru di atas)
    proposals.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

    // Pagination
    const total = proposals.length
    const paginated = proposals.slice((page - 1) * limit, page * limit)

    logger.info('GET Proposal success', { 
      total, 
      returned: paginated.length,
      page,
      totalPages: Math.ceil(total / limit)
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
    logger.error('GET Proposal error', error)

    // Map error codes to user-friendly messages
    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet proposal tidak ditemukan", status: 404 },
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
      { message: "Gagal mengambil data proposal" },
      { status: 500 }
    )
  }
}
