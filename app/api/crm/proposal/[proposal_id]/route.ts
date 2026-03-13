import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

// ===== ENVIRONMENT VALIDATION =====
if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GSHEET_CRM_ID) {
  throw new Error("Missing Google Sheets environment variables")
}

// Sanitize private key
const privateKey = process.env.GOOGLE_PRIVATE_KEY
  .replace(/\\n/g, '\n')
  .replace(/^["']|["']$/g, '')

// ===== GOOGLE SHEETS CLIENT =====
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  privateKey,
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_CRM_ID!

// ===== LOGGER =====
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

// ===== GET PROPOSAL BY ID =====
export async function GET(
  req: Request,
  { params }: { params: { proposal_id: string } }
) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    const proposal_id = params.proposal_id?.toString().trim()

    if (!proposal_id || proposal_id.length < 3) {
      return NextResponse.json(
        { error: "Invalid proposal ID", code: "INVALID_ID" },
        { status: 400 }
      )
    }

    logger.info(`[${requestId}] Fetching proposal: ${proposal_id}`)

    // Fetch data dari sheet
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "PROPOSAL!A2:I",
    })

    const rows = res.data.values || []

    // Cari proposal yang match
    const row = rows.find(
      r => r?.[0]?.toString().trim() === proposal_id
    )

    if (!row) {
      logger.warn(`[${requestId}] Proposal not found: ${proposal_id}`)
      return NextResponse.json(
        { error: "Proposal not found", code: "NOT_FOUND" },
        { status: 404 }
      )
    }

    const duration = Date.now() - startTime
    logger.info(`[${requestId}] Proposal found in ${duration}ms`)

    // Return dengan default values untuk field yang mungkin kosong
    return NextResponse.json({
      proposal_id: row[0] || "",
      inquiry_id: row[1] || "", // pipeline_id = inquiry_id
      rab_id: row[2] || "",
      total_value: Number(row[3] || 0),
      status: row[4] || "DRAFT",
      created_at: row[5] || new Date().toISOString(),
      created_by: row[6] || "System",
      approved_at: row[7] || null,
      expiry_date: row[8] || null,
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`
      }
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error(`[${requestId}] Error fetching proposal`, error, { duration_ms: duration })

    // Handle specific Google Sheets errors
    if (error.code === 404) {
      return NextResponse.json(
        { error: "Sheet tidak ditemukan", code: "SHEET_NOT_FOUND" },
        { status: 404 }
      )
    }

    if (error.code === 403) {
      return NextResponse.json(
        { error: "Akses ke Google Sheets ditolak", code: "ACCESS_DENIED" },
        { status: 403 }
      )
    }

    if (error.code === 429) {
      return NextResponse.json(
        { error: "Terlalu banyak request", code: "RATE_LIMITED" },
        { status: 429 }
      )
    }

    // Default error
    return NextResponse.json(
      { 
        error: "Gagal mengambil data proposal",
        code: "INTERNAL_ERROR",
        request_id: requestId
      },
      { status: 500 }
    )
  }
}

// Optional: Add PATCH for updating proposal
export async function PATCH(
  req: Request,
  { params }: { params: { proposal_id: string } }
) {
  // Implement if needed
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  )
}
