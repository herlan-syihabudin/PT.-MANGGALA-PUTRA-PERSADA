import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
const requiredEnv = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_CRM_ID'] as const
for (const env of requiredEnv) {
  if (!process.env[env]) {
    throw new Error(`Missing environment variable: ${env}`)
  }
}

/* ================= CONSTANTS ================= */
const RETRYABLE_CODES = [408, 429, 502, 503] as const
const ACTIVITY_COLUMNS = {
  ID: 0,          // A
  PIPELINE_ID: 1, // B
  TYPE: 2,        // C
  DESCRIPTION: 3, // D
  USER: 4,        // E
  TIMESTAMP: 5,   // F
} as const

/* ================= GOOGLE AUTH ================= */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CRM_ACTIVITY"

/* ================= HELPERS ================= */
const logger = {
  info: (message: string, data: any = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...data
    }))
  },
  error: (message: string, error: any, data: any = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: {
        message: error?.message,
        code: error?.code
      },
      ...data
    }))
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    const code = error.code || error.response?.status
    if (retries > 0 && RETRYABLE_CODES.includes(code)) {
      const delay = 1000 * Math.pow(2, 3 - retries) // exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

function normalizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
}

/* ================= GET ACTIVITIES ================= */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const normalizedId = normalizeId(id)

    if (!id) {
      return NextResponse.json(
        { message: "ID wajib diisi" },
        { status: 400 }
      )
    }

    logger.info('Fetching activities', { pipelineId: id })

    const res = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:F`,
    }))

    const rows = res.data.values || []

    const activities = rows
      .filter((r) => {
  const pipelineId = r[ACTIVITY_COLUMNS.PIPELINE_ID]
  if (!pipelineId) return false
  return normalizeId(pipelineId) === normalizedId
})
      .map((r) => ({
        id: r[ACTIVITY_COLUMNS.ID] || "",
        type: r[ACTIVITY_COLUMNS.TYPE] || "note",
        description: r[ACTIVITY_COLUMNS.DESCRIPTION] || "",
        user: r[ACTIVITY_COLUMNS.USER] || "System",
        timestamp: r[ACTIVITY_COLUMNS.TIMESTAMP] || new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    logger.info('Activities fetched', { 
      inquiryId: id, 
      count: activities.length 
    })

    return NextResponse.json(activities)

  } catch (error: any) {
    logger.error('Failed to fetch activities', error)

    const status = error.code || error.response?.status
    if ([404, 403, 429, 503].includes(status)) {
      return NextResponse.json(
        { message: error.message },
        { status }
      )
    }

    return NextResponse.json(
      { message: "Gagal mengambil activities" },
      { status: 500 }
    )
  }
}

/* ================= ADD ACTIVITY ================= */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Validasi input
    if (!id) {
      return NextResponse.json(
        { message: "ID wajib diisi" },
        { status: 400 }
      )
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { message: "Deskripsi wajib diisi" },
        { status: 400 }
      )
    }

    const validTypes = ["call", "email", "meeting", "note", "status_change", "system"]
    const type = body.type && validTypes.includes(body.type) ? body.type : "note"

    const activityId = `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const timestamp = new Date().toISOString()
    const user = body.user?.trim() || "System"

    const activity = [
      activityId,
      id,
      type,
      body.description.trim(),
      user,
      timestamp,
    ]

    logger.info('Adding activity', { 
      inquiryId: id, 
      type,
      user 
    })

    await withRetry(() => sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [activity],
      },
    }))

    const response = {
      id: activityId,
      type,
      description: body.description.trim(),
      user,
      timestamp,
    }

    logger.info('Activity added successfully', { 
      inquiryId: id, 
      activityId 
    })

    return NextResponse.json(response, { status: 201 })

  } catch (error: any) {
    logger.error('Failed to add activity', error)

    const status = error.code || error.response?.status
    if ([404, 403, 429, 503].includes(status)) {
      return NextResponse.json(
        { message: error.message },
        { status }
      )
    }

    return NextResponse.json(
      { message: "Gagal menyimpan activity" },
      { status: 500 }
    )
  }
}
