import { NextResponse } from "next/server"
import { google } from "googleapis"

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
const SHEET_NAME = "CRM_INQUIRY"
const RETRYABLE = [408, 429, 502, 503]

// ==================== CONSTANTS ====================
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

const STAGE_MAPPING = {
  new: "FOLLOW UP",
  survey: "FOLLOW UP",
  estimating: "PENAWARAN",
  boq_created: "PENAWARAN",
  proposal: "PENAWARAN",
  negotiation: "NEGOSIASI",
  won: "DEAL",
  lost: "LOST",
} as const

const PROBABILITY_MAPPING = {
  "FOLLOW UP": 0.2,
  "PENAWARAN": 0.5,
  "NEGOSIASI": 0.75,
  "DEAL": 1,
  "LOST": 0,
} as const

// ==================== HELPERS ====================
const logger = {
  error: (context: string, error: any, meta = {}) => 
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', context, error: { message: error?.message, code: error?.code }, ...meta })),
  info: (context: string, meta = {}) => 
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', context, ...meta }))
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    const code = Number(error.code || error.response?.status)
    if (retries > 0 && RETRYABLE.includes(code)) {
      await new Promise(r => setTimeout(r, 1000 * (4 - retries)))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

function getStage(status: string, rabId?: string): string {
  if (status === "lost") return "LOST"
  if (status === "won") return "DEAL"
  
  const stage = STAGE_MAPPING[status as keyof typeof STAGE_MAPPING] || "FOLLOW UP"
  
  // Override jika sudah punya RAB
  if (rabId && stage === "FOLLOW UP") return "PENAWARAN"
  
  return stage
}

function getProbability(stage: string): number {
  return PROBABILITY_MAPPING[stage as keyof typeof PROBABILITY_MAPPING] || 0
}

// ==================== GET PIPELINE ====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
    const status = searchParams.get("status")
    const assigned = searchParams.get("assigned")

    const res = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:S`,
    }))

    const rows = res.data.values || []

    let deals = rows
      .filter((row) => row[COLUMNS.INQUIRY_ID])
      .map((row) => {
        const status = row[COLUMNS.STATUS] || "new"
        const rabId = row[COLUMNS.CONVERTED_RAB_ID] || ""
        const stage = getStage(status, rabId)

        return {
          pipeline_id: row[COLUMNS.INQUIRY_ID],
          inquiry_id: row[COLUMNS.INQUIRY_ID],
          customer_name: row[COLUMNS.CUSTOMER_NAME] || "-",
          project_name: row[COLUMNS.NAMA_PEKERJAAN] || "Untitled",
          project_location: row[COLUMNS.LOKASI] || "",
          estimated_value: Number(row[COLUMNS.ESTIMASI_NILAI] || 0),
          stage,
          probability: getProbability(stage),
          status,
          assigned_to: row[COLUMNS.ASSIGNED_TO] || "",
          priority: row[COLUMNS.PRIORITAS] || "normal",
          source: row[COLUMNS.SUMBER] || "",
          created_at: row[COLUMNS.CREATED_AT] || row[COLUMNS.TANGGAL_MASUK] || "",
        }
      })

    // Apply filters
    if (status) {
      deals = deals.filter(d => d.status === status)
    }

    if (assigned) {
      deals = deals.filter(d => d.assigned_to === assigned)
    }

    // Sort by created_at desc
    deals.sort((a, b) => {
      if (!a.created_at) return 1
      if (!b.created_at) return -1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Apply limit
    if (limit && limit > 0) {
      deals = deals.slice(0, limit)
    }

    // Hitung summary
    const summary = {
      total: deals.length,
      total_value: deals.reduce((sum, d) => sum + d.estimated_value, 0),
      weighted_value: deals.reduce((sum, d) => sum + (d.estimated_value * d.probability), 0),
      by_stage: Object.fromEntries(
        Object.keys(PROBABILITY_MAPPING).map(stage => [
          stage,
          deals.filter(d => d.stage === stage).length
        ])
      ),
    }

    logger.info('Pipeline fetched', { count: deals.length })

    return NextResponse.json({
      data: deals,
      summary,
    })

  } catch (error: any) {
    logger.error('Pipeline failed', error)

    const status = error.code || error.response?.status
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ message: error.message }, { status })
    }

    return NextResponse.json(
      { message: "Gagal load pipeline" },
      { status: 500 }
    )
  }
}
