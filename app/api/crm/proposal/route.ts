import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

// ===== CONSTANTS =====
const PROPOSAL_SHEET = "PROPOSAL"
const SALES_PIPELINE = "CRM_INQUIRY"

const PROPOSAL_COLUMNS = {
  PROPOSAL_ID: 0,
  PIPELINE_ID: 1,
  RAB_ID: 2,
  TOTAL_VALUE: 3,
  STATUS: 4,
  CREATED_AT: 5,
  CREATED_BY: 6,
  APPROVED_AT: 7,
  EXPIRY_DATE: 8,
} as const

const PIPELINE_COLUMNS = {
  PIPELINE_ID: 0,
  RAB_ID: 13,
  CREATED_AT: 15,
  STAGE: 17,
  PROPOSAL_ID: 18
} as const

const ALLOWED_STAGES = ["PENAWARAN", "NEGOSIASI"] as const
const RETRYABLE_CODES = [408, 429, 502, 503, 504] as const

// ===== ENVIRONMENT VALIDATION =====
const REQUIRED_ENV = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_CRM_ID'] as const
for (const env of REQUIRED_ENV) {
  if (!process.env[env]) {
    console.error(`Missing environment variable: ${env}`)
    throw new Error(`Missing environment variable: ${env}`)
  }
}

// Sanitize private key
const privateKey = process.env.GOOGLE_PRIVATE_KEY!
  .replace(/\\n/g, '\n')
  .replace(/^["']|["']$/g, '')

// ===== GOOGLE SHEETS CLIENT =====
let sheetsClient: any = null

function getSheets() {
  if (sheetsClient) return sheetsClient

  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    privateKey,
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  sheetsClient = google.sheets({ version: "v4", auth })
  return sheetsClient
}

// ===== TYPES =====
type CreateProposalRequest = {
  inquiry_id: string
  rab_id: string
  total_value?: number
  created_by?: string
  notes?: string
}

// ===== HELPER FUNCTIONS =====
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
  },
  warn: (context: string, metadata: any = {}) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      context,
      ...metadata
    }))
  }
}

async function withRetry<T>(
  fn: () => Promise<T>, 
  retries = 3,
  context = ''
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      const isRetryable = RETRYABLE_CODES.includes(error.code) ||
                          error.message?.includes('rate limit') ||
                          error.message?.includes('quota')
      
      if (isRetryable && i < retries - 1) {
        const delay = Math.pow(2, i) * 1000
        logger.warn(`Retry attempt ${i + 1}/${retries} for ${context}`, { delay })
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      break
    }
  }
  
  throw lastError
}

function generateProposalId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = nanoid(6).toUpperCase()
  return `PRP-${timestamp}-${random}`
}

function calculateExpiryDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString()
}

/* ================= GET PROPOSAL LIST ================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    
    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(100, Number(searchParams.get("limit") || 50))
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    logger.info('GET Proposal requested', { page, limit, status, search })

    const sheets = getSheets()

    const response: any = await withRetry(() => 
  sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GSHEET_CRM_ID!,
    range: `${PROPOSAL_SHEET}!A2:I`,
  })
)

    const rows = response.data.values || []

    if (!rows.length) {
      return NextResponse.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      })
    }

    let proposals = rows
      .filter((r) => r[PROPOSAL_COLUMNS.PROPOSAL_ID])
      .map((r) => ({
        proposal_id: r[PROPOSAL_COLUMNS.PROPOSAL_ID] || "",
        pipeline_id: r[PROPOSAL_COLUMNS.PIPELINE_ID] || "",
        rab_id: r[PROPOSAL_COLUMNS.RAB_ID] || "",
        total_value: Number(r[PROPOSAL_COLUMNS.TOTAL_VALUE] || 0),
        status: (r[PROPOSAL_COLUMNS.STATUS] || "DRAFT").toUpperCase(),
        created_at: r[PROPOSAL_COLUMNS.CREATED_AT] || "",
        created_by: r[PROPOSAL_COLUMNS.CREATED_BY] || "",
        expiry_date: r[PROPOSAL_COLUMNS.EXPIRY_DATE] || "",
      }))

    if (status) {
      proposals = proposals.filter(p => p.status === status.toUpperCase())
    }

    if (search) {
      const s = search.toLowerCase()
      proposals = proposals.filter(p => 
        p.proposal_id.toLowerCase().includes(s) ||
        p.pipeline_id.toLowerCase().includes(s) ||
        p.rab_id.toLowerCase().includes(s)
      )
    }

    proposals.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

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

/* ================= CREATE PROPOSAL ================= */
export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    const body = await req.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json(
        { error: "Request body tidak valid", code: "INVALID_JSON" },
        { status: 400 }
      )
    }

    const { inquiry_id, rab_id, total_value, created_by = "System" } = body

    const missingFields = []
    if (!inquiry_id) missingFields.push('inquiry_id')
    if (!rab_id) missingFields.push('rab_id')
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Field wajib diisi: ${missingFields.join(', ')}`,
          code: "MISSING_FIELDS"
        },
        { status: 400 }
      )
    }

    logger.info(`[${requestId}] Create Proposal requested`, { inquiry_id, rab_id })

    const sheets = getSheets()
    const sheetId = process.env.GSHEET_CRM_ID!

    /* ===== VALIDASI PIPELINE ===== */
    const pipelineRes: any = await withRetry(
      () => sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SALES_PIPELINE}!A2:V`, 
      }),
      3,
      'fetch-pipeline'
    )

    const pipelineRows = pipelineRes.data.values || []
    
    const pipelineIndex = pipelineRows.findIndex(
      r => r[PIPELINE_COLUMNS.PIPELINE_ID]?.toString().trim() === inquiry_id
    )

    if (pipelineIndex === -1) {
      return NextResponse.json(
        { error: "Pipeline tidak ditemukan", code: "PIPELINE_NOT_FOUND" },
        { status: 404 }
      )
    }

    const pipelineRow = pipelineRows[pipelineIndex]
    const rowNumber = pipelineIndex + 2

    /* ===== CEK DUPLIKAT PROPOSAL ===== */
    const existingProposalId = pipelineRow[PIPELINE_COLUMNS.PROPOSAL_ID]?.toString().trim()
    
    if (existingProposalId) {
      return NextResponse.json(
        { 
          error: "Pipeline sudah memiliki proposal",
          proposal_id: existingProposalId,
          code: "DUPLICATE_PROPOSAL"
        },
        { status: 409 }
      )
    }

    /* ===== VALIDASI STAGE ===== */
    const currentStage = pipelineRow[PIPELINE_COLUMNS.STAGE]?.toString().trim() || ""
    
    if (!ALLOWED_STAGES.includes(currentStage as any)) {
      return NextResponse.json(
        { 
          error: `Proposal hanya bisa dibuat saat stage ${ALLOWED_STAGES.join(' atau ')}`,
          current_stage: currentStage,
          code: "INVALID_STAGE"
        },
        { status: 400 }
      )
    }

    /* ===== DOUBLE-CHECK ANTI RACE CONDITION ===== */
    const latestCheck: any = await withRetry(
      () => sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SALES_PIPELINE}!S${rowNumber}`,
      }),
      2,
      'double-check'
    )

    if (latestCheck.data.values?.[0]?.[0]?.toString().trim()) {
      return NextResponse.json(
        { error: "Pipeline sudah memiliki proposal", code: "RACE_CONDITION" },
        { status: 409 }
      )
    }

    /* ===== CREATE PROPOSAL ===== */
    const proposal_id = generateProposalId()
    const created_at = new Date().toISOString()
    const expiry_date = calculateExpiryDate()
    
    const finalTotalValue = typeof total_value === 'number' && total_value > 0 ? total_value : 0

    // Insert ke PROPOSAL sheet
    await withRetry(
      () => sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${PROPOSAL_SHEET}!A:I`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            proposal_id,
            inquiry_id,
            rab_id,
            finalTotalValue,
            "DRAFT",
            created_at,
            created_by,
            "",
            expiry_date
          ]]
        }
      }),
      3,
      'append-proposal'
    )

    /* ===== UPDATE PIPELINE ===== */
    await withRetry(
      () => sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          data: [
            {
              range: `${SALES_PIPELINE}!R${rowNumber}`,
              values: [["NEGOSIASI"]],
            },
            {
              range: `${SALES_PIPELINE}!S${rowNumber}`,
              values: [[proposal_id]],
            }
          ],
          valueInputOption: "USER_ENTERED",
        }
      }),
      3,
      'update-pipeline'
    )

    logger.info(`[${requestId}] Proposal created successfully`, { 
      proposal_id, 
      inquiry_id,
      duration_ms: Date.now() - startTime
    })

    return NextResponse.json({
      success: true,
      proposal_id,
      inquiry_id,
      status: "DRAFT",
      expiry_date,
      message: "Proposal berhasil dibuat",
      data: {
        proposal_id,
        inquiry_id,
        rab_id,
        total_value: finalTotalValue,
        status: "DRAFT",
        created_at,
        expiry_date
      }
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error(`[${requestId}] Create Proposal error`, error, { duration_ms: duration })

    if (error.message === "SHEET_NOT_FOUND") {
      return NextResponse.json(
        { error: "Sheet tidak ditemukan", code: "SHEET_NOT_FOUND" },
        { status: 404 }
      )
    }

    if (error.message === "ACCESS_DENIED") {
      return NextResponse.json(
        { error: "Akses ke Google Sheets ditolak", code: "ACCESS_DENIED" },
        { status: 403 }
      )
    }

    const errorMap: Record<number, { message: string; code: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", code: "SHEET_NOT_FOUND", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", code: "ACCESS_DENIED", status: 403 },
      429: { message: "Terlalu banyak request", code: "RATE_LIMITED", status: 429 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { error: errorResponse.message, code: errorResponse.code, request_id: requestId },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { error: "Gagal membuat proposal", code: "UNKNOWN_ERROR", request_id: requestId },
      { status: 500 }
    )
  }
}
