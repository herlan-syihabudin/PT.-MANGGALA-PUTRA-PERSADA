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
const SHEET_NAME = "CUSTOMERS"
const RETRYABLE = [408, 429, 502, 503]

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

// ==================== GET STATS ====================
export async function GET() {
  try {
    // Get all customers
    const res = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:P`,
    }))

    const rows = res.data.values || []
    
    // Calculate stats
    let total = 0
    let active = 0
    let inactive = 0
    let withProjects = 0
    let totalValue = 0

    for (const row of rows) {
      if (!row[0]) continue // skip empty rows
      
      total++
      
      const status = row[12] || "Active"
      if (status === "Active") {
        active++
      } else {
        inactive++
      }
      
      // Note: Projects count & total value would come from separate API
      // For now, we return 0 for those
    }

    logger.info('GET Stats Success', { total, active, inactive })

    return NextResponse.json({
      total,
      active,
      inactive,
      withProjects, // Will be populated from projects API
      totalValue,   // Will be populated from RAB API
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    })

  } catch (error: any) {
    logger.error('GET Stats Failed', error)

    const status = error.code || error.response?.status
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ message: error.message }, { status })
    }

    return NextResponse.json(
      { message: "Gagal mengambil statistik" },
      { status: 500 }
    )
  }
}
