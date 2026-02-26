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
const SHEET_NAME = "WORK_LIBRARY"

/* ================= CONSTANTS ================= */
const COLUMNS = {
  PACKAGE_ID: 0,
  PACKAGE_NAME: 1,
  CATEGORY_ID: 2,
  CATEGORY: 3,
  SCOPE_ID: 4,
  SCOPE: 5,
  JOB_NAME_ID: 6,
  JOB_NAME: 7,
  UNIT: 8,
  MATERIAL_PRICE: 9,
  LABOUR_PRICE: 10,
  TOTAL_PRICE: 11,
  STATUS: 12,
  CREATED_AT: 13,
  CREATED_BY: 14,
  UPDATED_AT: 15,
  UPDATED_BY: 16,
  NOTES: 17,
} as const

const RETRYABLE_CODES: number[] = [408, 429, 502, 503]
const REQUIRED_COLUMNS = Object.keys(COLUMNS).length

/* ================= TYPES ================= */
export type WorkLibraryItem = {
  package_id: string
  package_name: string
  category_id: string
  category: string
  scope_id: string
  scope: string
  job_name_id: string
  job_name: string
  unit: string
  material_price: number
  labour_price: number
  total_price: number
  status: string
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  notes: string
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
  metadata?: {
    total_packages: number
    total_items: number
  }
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
    if (retries > 0 && RETRYABLE_CODES.includes(Number(error.code))) { // ✅ FIXED
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
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('category_id')
    const status = searchParams.get('status') || 'active'

    logger.info('Fetching work library data', { categoryId, status })

    const res = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:R`,
      })
    )

    const rows = res.data.values || []
    
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        metadata: { total_packages: 0, total_items: 0 }
      })
    }

    const packageMap = new Map<string, WorkLibraryPackage>()
    let totalItems = 0

    for (const row of rows) {
      // Skip incomplete rows
      if (row.length < REQUIRED_COLUMNS) continue

      const packageId = row[COLUMNS.PACKAGE_ID]?.trim()
      const itemStatus = row[COLUMNS.STATUS]?.trim() || 'active'
      
      if (!packageId) continue

      // Filter by status
      if (status !== 'all' && itemStatus !== status) continue

      // Filter by category
      if (categoryId && row[COLUMNS.CATEGORY_ID]?.trim() !== categoryId) continue

      const materialPrice = safeParseNumber(row[COLUMNS.MATERIAL_PRICE])
      const labourPrice = safeParseNumber(row[COLUMNS.LABOUR_PRICE])
      const totalPrice = safeParseNumber(row[COLUMNS.TOTAL_PRICE]) || (materialPrice + labourPrice)

      const item: WorkLibraryItem = {
        package_id: packageId,
        package_name: row[COLUMNS.PACKAGE_NAME]?.trim() || '',
        category_id: row[COLUMNS.CATEGORY_ID]?.trim() || '',
        category: row[COLUMNS.CATEGORY]?.trim() || '',
        scope_id: row[COLUMNS.SCOPE_ID]?.trim() || '',
        scope: row[COLUMNS.SCOPE]?.trim() || '',
        job_name_id: row[COLUMNS.JOB_NAME_ID]?.trim() || '',
        job_name: row[COLUMNS.JOB_NAME]?.trim() || '',
        unit: row[COLUMNS.UNIT]?.trim() || '',
        material_price: materialPrice,
        labour_price: labourPrice,
        total_price: totalPrice,
        status: itemStatus,
        created_at: row[COLUMNS.CREATED_AT] || '',
        created_by: row[COLUMNS.CREATED_BY] || '',
        updated_at: row[COLUMNS.UPDATED_AT] || '',
        updated_by: row[COLUMNS.UPDATED_BY] || '',
        notes: row[COLUMNS.NOTES] || '',
      }

      if (!packageMap.has(packageId)) {
        packageMap.set(packageId, {
          package_id: packageId,
          package_name: item.package_name,
          category: item.category,
          items: []
        })
      }

      packageMap.get(packageId)!.items.push(item)
      totalItems++
    }

    const packages = Array.from(packageMap.values())
    packages.sort((a, b) => a.package_id.localeCompare(b.package_id))

    logger.info('Work library fetched successfully', { 
      total_packages: packages.length,
      total_items: totalItems,
      filters: { categoryId, status }
    })

    return NextResponse.json({
      success: true,
      data: packages,
      metadata: {
        total_packages: packages.length,
        total_items: totalItems
      }
    })

  } catch (error: any) {
    logger.error('GET Work Library Error', error)

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet WORK_LIBRARY tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
    }

    const errorResponse = errorMap[Number(error.code)]
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
