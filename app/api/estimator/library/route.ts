import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
function validateEnvironment() {
  const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_ESTIMATOR_ID'] as const
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
const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!
const SHEET_NAME = "WORK_LIBRARY" // Nama sheet sesuai dengan yang kamu buat

/* ================= CONSTANTS ================= */
const COLUMNS = {
  PACKAGE_ID: 0,
  PACKAGE_NAME: 1,
  CATEGORY: 2,
  SCOPE: 3,
  JOB_NAME: 4,
  UNIT: 5,
  MATERIAL_PRICE: 6,
  LABOUR_PRICE: 7,
} as const

const RETRYABLE_CODES = [408, 429, 502, 503] as const

/* ================= TYPES ================= */
export type WorkLibraryItem = {
  package_id: string
  package_name: string
  category: string
  scope: string
  job_name: string
  unit: string
  material_price: number
  labour_price: number
}

export type WorkLibraryPackage = {
  package_id: string
  package_name: string
  category: string
  items: WorkLibraryItem[]
}

export type WorkLibraryResponse = {
  success: boolean
  data: WorkLibraryPackage[]
  error?: string
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

function safeParseNumber(value: any): number {
  if (value === null || value === undefined) return 0
  const cleaned = String(value).replace(/[^\d-]/g, '')
  const num = Number(cleaned)
  return isNaN(num) ? 0 : num
}

/* ================= MAIN API ================= */
export async function GET() {
  try {
    logger.info('Fetching work library data')

    // Fetch data dari Google Sheets
    const res = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:H`, // Ambil dari baris 2 sampai H
      })
    )

    const rows = res.data.values || []
    
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Group by package_id
    const packageMap = new Map<string, WorkLibraryPackage>()

    for (const row of rows) {
      // Skip baris yang tidak lengkap
      if (row.length < 8) continue

      const packageId = row[COLUMNS.PACKAGE_ID]?.trim()
      if (!packageId) continue

      // Buat item
      const item: WorkLibraryItem = {
        package_id: packageId,
        package_name: row[COLUMNS.PACKAGE_NAME]?.trim() || '',
        category: row[COLUMNS.CATEGORY]?.trim() || '',
        scope: row[COLUMNS.SCOPE]?.trim() || '',
        job_name: row[COLUMNS.JOB_NAME]?.trim() || '',
        unit: row[COLUMNS.UNIT]?.trim() || '',
        material_price: safeParseNumber(row[COLUMNS.MATERIAL_PRICE]),
        labour_price: safeParseNumber(row[COLUMNS.LABOUR_PRICE]),
      }

      // Cek atau buat package
      if (!packageMap.has(packageId)) {
        packageMap.set(packageId, {
          package_id: packageId,
          package_name: item.package_name,
          category: item.category,
          items: []
        })
      }

      // Tambah item ke package
      packageMap.get(packageId)!.items.push(item)
    }

    // Convert Map ke Array
    const packages = Array.from(packageMap.values())

    // Sort packages by package_id
    packages.sort((a, b) => a.package_id.localeCompare(b.package_id))

    logger.info('Work library fetched successfully', { 
      total_packages: packages.length,
      total_items: rows.length 
    })

    return NextResponse.json({
      success: true,
      data: packages
    })

  } catch (error: any) {
    logger.error('GET Work Library Error', error)

    // Map error codes
    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet WORK_LIBRARY tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { success: false, error: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { success: false, error: "Gagal mengambil data Work Library" },
      { status: 500 }
    )
  }
}
