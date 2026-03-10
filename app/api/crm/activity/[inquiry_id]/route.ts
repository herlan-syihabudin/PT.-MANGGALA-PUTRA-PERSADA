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
  LOG_ID: 0,
  INQUIRY_ID: 1,
  TYPE: 2,
  DESCRIPTION: 3,
  OLD_VALUE: 4,
  NEW_VALUE: 5,
  CREATED_AT: 6,
  CREATED_BY: 7,
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
const SHEET_NAME = "CRM_ACTIVITY_LOG"

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
    if (retries > 0 && (RETRYABLE_CODES as readonly number[]).includes(Number(code))) {
      const delay = 1000 * (4 - retries)
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

/* ================= GET ACTIVITIES ================= */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ inquiry_id: string }> }
) {
  let inquiry_id = ""

  try {
    const p = await params
    inquiry_id = p.inquiry_id

    if (!inquiry_id) {
      return NextResponse.json(
        { message: "Inquiry ID wajib" },
        { status: 400 }
      )
    }

    logger.info('Fetching activities', { inquiry_id })
    const normalize = (val: any) => String(val || "").trim()

    const res = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:H`,
    }))

    const rows = res.data.values || []

    const activities = rows
      .filter(row =>
  normalize(row[ACTIVITY_COLUMNS.INQUIRY_ID]) === normalize(inquiry_id)
)
      .map(row => ({
  log_id: row[ACTIVITY_COLUMNS.LOG_ID] || "",
  inquiry_id: row[ACTIVITY_COLUMNS.INQUIRY_ID] || "",
  type: row[ACTIVITY_COLUMNS.TYPE] || "",
  description: row[ACTIVITY_COLUMNS.DESCRIPTION] || "",
  old_value: row[ACTIVITY_COLUMNS.OLD_VALUE] || "",
  new_value: row[ACTIVITY_COLUMNS.NEW_VALUE] || "",
  created_at: row[ACTIVITY_COLUMNS.CREATED_AT] || "",
  created_by: row[ACTIVITY_COLUMNS.CREATED_BY] || "",
}))
      .reverse() // Latest first

    logger.info('Activities fetched', { 
      inquiry_id, 
      count: activities.length 
    })

    return NextResponse.json(activities)

  } catch (error: any) {
  logger.error('Failed to fetch activities', error, { inquiry_id })

    const status = error.code || error.response?.status
    if ([404, 403, 429, 503].includes(status)) {
      return NextResponse.json(
        { message: error.message },
        { status }
      )
    }

    return NextResponse.json(
      { message: "Gagal mengambil activity" },
      { status: 500 }
    )
  }
}
