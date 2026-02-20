import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

const PROPOSAL_SHEET = "PROPOSAL"
const SALES_PIPELINE = "SALES_PIPELINE"

/* ================= CONSTANTS ================= */
const PROPOSAL_COLUMNS = {
  PROPOSAL_ID: 0,
  PIPELINE_ID: 1,
  RAB_ID: 2,
  TOTAL_VALUE: 3,
  STATUS: 4,
  CREATED_AT: 5,
} as const

const PIPELINE_COLUMNS = {
  PIPELINE_ID: 0,
  INQUIRY_ID: 1,
  CUSTOMER_ID: 2,
  STAGE: 3,           // D
  ESTIMATED_VALUE: 4, // E
  RAB_ID: 5,          // F
  PROPOSAL_ID: 6,     // G
  CREATED_AT: 7,      // H
  UPDATED_AT: 8,      // I
} as const

const RETRYABLE_CODES = [408, 429, 502, 503] as const

/* ================= ENVIRONMENT VALIDATION ================= */
function validateEnvironment() {
  const required = [
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GSHEET_CRM_ID'
  ] as const
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

validateEnvironment()

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
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  return google.sheets({ version: "v4", auth })
}

/* ================= CREATE PROPOSAL ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { pipeline_id, rab_id, total_value } = body

    if (!pipeline_id) {
      return NextResponse.json(
        { message: "pipeline_id wajib diisi" },
        { status: 400 }
      )
    }

    logger.info('Create Proposal requested', { pipeline_id, rab_id })

    const sheets = getSheets()

    /* ================= VALIDASI PIPELINE ================= */
    const pipelineRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GSHEET_CRM_ID!,
        range: `${SALES_PIPELINE}!A2:I`, // Ambil semua baris
      })
    )

    const pipelineRows = pipelineRes.data.values || []
    const pipelineIndex = pipelineRows.findIndex(
      r => r[PIPELINE_COLUMNS.PIPELINE_ID] === pipeline_id
    )

    if (pipelineIndex === -1) {
      return NextResponse.json(
        { message: "Pipeline tidak ditemukan" },
        { status: 404 }
      )
    }

    const pipelineRow = pipelineRows[pipelineIndex]

    // Cek apakah sudah punya proposal
    if (pipelineRow[PIPELINE_COLUMNS.PROPOSAL_ID]) {
      return NextResponse.json(
        { 
          message: "Pipeline sudah memiliki proposal",
          proposal_id: pipelineRow[PIPELINE_COLUMNS.PROPOSAL_ID]
        },
        { status: 409 }
      )
    }

    // Cek stage harus "PENAWARAN" atau "NEGOSIASI"
    const currentStage = pipelineRow[PIPELINE_COLUMNS.STAGE] || ""
    if (!["PENAWARAN", "NEGOSIASI"].includes(currentStage)) {
      return NextResponse.json(
        { message: `Pipeline dengan stage ${currentStage} tidak bisa dibuat proposal` },
        { status: 400 }
      )
    }

    /* ================= CREATE PROPOSAL ================= */
    const proposal_id = "PRP-" + nanoid(6).toUpperCase()
    const created_at = new Date().toISOString()

    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GSHEET_CRM_ID!,
        range: `${PROPOSAL_SHEET}!A:F`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            proposal_id,
            pipeline_id,
            rab_id || "",
            total_value || 0,
            "DRAFT",
            created_at
          ]]
        }
      })
    )

    /* ================= UPDATE PIPELINE → NEGOSIASI ================= */
    const rowNumber = pipelineIndex + 2 // +2 karena header dan index mulai 0

    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GSHEET_CRM_ID!,
        range: `${SALES_PIPELINE}!D${rowNumber}:I${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            "NEGOSIASI",                          // STAGE di D
            pipelineRow[PIPELINE_COLUMNS.ESTIMATED_VALUE] || 0,  // ESTIMATED_VALUE di E
            rab_id || pipelineRow[PIPELINE_COLUMNS.RAB_ID] || "", // RAB_ID di F
            proposal_id,                          // PROPOSAL_ID di G
            pipelineRow[PIPELINE_COLUMNS.CREATED_AT] || created_at, // CREATED_AT di H
            new Date().toISOString()               // UPDATED_AT di I
          ]]
        }
      })
    )

    logger.info('Proposal created successfully', { 
      proposal_id, 
      pipeline_id,
      stage: "NEGOSIASI"
    })

    return NextResponse.json({
      success: true,
      proposal_id,
      message: "Proposal berhasil dibuat"
    })

  } catch (error: any) {
    logger.error('Create Proposal error', error)

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
      { message: "Gagal membuat proposal" },
      { status: 500 }
    )
  }
}
