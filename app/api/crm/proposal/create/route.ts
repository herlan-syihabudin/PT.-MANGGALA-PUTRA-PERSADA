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
  // Tambahin untuk tracking
  CREATED_BY: 6,
  APPROVED_AT: 7,
  EXPIRY_DATE: 8,
} as const

const PIPELINE_COLUMNS = {
  PIPELINE_ID: 0,
  RAB_ID: 13,
  CREATED_AT: 15,
  STAGE: 17,
  PROPOSAL_ID: 19
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
        const delay = Math.pow(2, i) * 1000 // exponential backoff
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
  date.setDate(date.getDate() + 30) // 30 days validity
  return date.toISOString()
}

// ===== MAIN API HANDLER =====
export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    // ===== VALIDASI INPUT =====
    const body = await req.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json(
        { error: "Request body tidak valid", code: "INVALID_JSON" },
        { status: 400 }
      )
    }

    const { inquiry_id, rab_id, total_value, created_by = "System" } = body as CreateProposalRequest

    // Validasi required fields
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

    // Validasi format inquiry_id
    if (typeof inquiry_id !== 'string' || inquiry_id.length < 3) {
      return NextResponse.json(
        { error: "Format inquiry_id tidak valid", code: "INVALID_INQUIRY_ID" },
        { status: 400 }
      )
    }

    logger.info(`[${requestId}] Create Proposal requested`, { 
      inquiry_id, 
      rab_id,
      created_by 
    })

    const sheets = getSheets()
    const sheetId = process.env.GSHEET_CRM_ID!

    /* ===== VALIDASI PIPELINE ===== */
    const pipelineRes: any = await withRetry(
      () => sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SALES_PIPELINE}!A2:T`,
      }),
      3,
      'fetch-pipeline'
    ).catch(error => {
      if (error.code === 404) throw new Error("SHEET_NOT_FOUND")
      if (error.code === 403) throw new Error("ACCESS_DENIED")
      if (error.code === 429) throw new Error("QUOTA_EXCEEDED")
      throw error
    })

    const pipelineRows = pipelineRes.data.values || []
    
    // Cari pipeline dengan index
    const pipelineIndex = pipelineRows.findIndex(
      r => r[PIPELINE_COLUMNS.PIPELINE_ID]?.toString().trim() === inquiry_id
    )

    if (pipelineIndex === -1) {
      logger.warn(`[${requestId}] Pipeline not found`, { inquiry_id })
      return NextResponse.json(
        { error: "Pipeline tidak ditemukan", code: "PIPELINE_NOT_FOUND" },
        { status: 404 }
      )
    }

    const pipelineRow = pipelineRows[pipelineIndex]
    const rowNumber = pipelineIndex + 2 // +2 karena header dan index 0-based

    /* ===== CEK DUPLIKAT PROPOSAL ===== */
    const existingProposalId = pipelineRow[PIPELINE_COLUMNS.PROPOSAL_ID]?.toString().trim()
    
    if (existingProposalId) {
      logger.warn(`[${requestId}] Pipeline already has proposal`, { 
        inquiry_id, 
        existing_proposal_id: existingProposalId 
      })
      
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
      logger.warn(`[${requestId}] Invalid stage for proposal creation`, { 
        inquiry_id, 
        current_stage: currentStage 
      })
      
      return NextResponse.json(
        { 
          error: `Proposal hanya bisa dibuat saat stage ${ALLOWED_STAGES.join(' atau ')}`,
          current_stage: currentStage,
          required_stages: ALLOWED_STAGES,
          code: "INVALID_STAGE"
        },
        { status: 400 }
      )
    }

    /* ===== DOUBLE-CHECK ANTI RACE CONDITION ===== */
    const latestCheck: any = await withRetry(
      () => sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SALES_PIPELINE}!T${rowNumber}`, // Column S = PROPOSAL_ID
      }),
      2,
      'double-check'
    )

    if (latestCheck.data.values?.[0]?.[0]?.toString().trim()) {
      logger.warn(`[${requestId}] Race condition detected`, { inquiry_id })
      return NextResponse.json(
        { error: "Pipeline sudah memiliki proposal", code: "RACE_CONDITION" },
        { status: 409 }
      )
    }

    /* ===== CREATE PROPOSAL ===== */
    const proposal_id = generateProposalId()
    const created_at = new Date().toISOString()
    const expiry_date = calculateExpiryDate()
    
    // Validasi total_value
    const finalTotalValue = typeof total_value === 'number' && total_value > 0 
      ? total_value 
      : 0

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
            "", // approved_at
            expiry_date
          ]]
        }
      }),
      3,
      'append-proposal'
    )

    /* ===== UPDATE PIPELINE (BATCH UPDATE) ===== */
    await withRetry(
      () => sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          data: [
            {
              range: `${SALES_PIPELINE}!R${rowNumber}`, // STAGE
              values: [["NEGOSIASI"]],
            },
            {
              range: `${SALES_PIPELINE}!S${rowNumber}`, // PROPOSAL_ID
              values: [[proposal_id]],
            }
          ],
          valueInputOption: "USER_ENTERED",
        }
      }),
      3,
      'update-pipeline'
    )

    const duration = Date.now() - startTime
    logger.info(`[${requestId}] Proposal created successfully`, { 
      proposal_id, 
      inquiry_id,
      stage: "NEGOSIASI",
      duration_ms: duration
    })

    /* ===== RETURN RESPONSE ===== */
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
    }, {
      headers: {
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`
      }
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error(`[${requestId}] Create Proposal error`, error, { duration_ms: duration })

    // Handle specific errors
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

    if (error.message === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "Kuota Google Sheets API habis", code: "QUOTA_EXCEEDED" },
        { status: 429 }
      )
    }

    // Map error codes
    const errorMap: Record<number, { message: string; code: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", code: "SHEET_NOT_FOUND", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", code: "ACCESS_DENIED", status: 403 },
      429: { message: "Terlalu banyak request", code: "RATE_LIMITED", status: 429 },
      500: { message: "Internal server error", code: "INTERNAL_ERROR", status: 500 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { 
          error: errorResponse.message,
          code: errorResponse.code,
          request_id: requestId
        },
        { status: errorResponse.status }
      )
    }

    // Default error
    return NextResponse.json(
      { 
        error: "Gagal membuat proposal",
        code: "UNKNOWN_ERROR",
        request_id: requestId
      },
      { status: 500 }
    )
  }
}
