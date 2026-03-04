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
  SCOPE: 2,
  CATEGORY: 3,
  JOB_NAME: 4,
  UNIT: 5,
  STATUS: 6,
  CREATED_AT: 7,
  CREATED_BY: 8,
  UPDATED_AT: 9,
  UPDATED_BY: 10,
  NOTES: 11,
} as const

const RETRYABLE_CODES: number[] = [408, 429, 502, 503]
const REQUIRED_COLUMNS = 6 
const VALID_STATUS = ['active', 'inactive', 'archived', 'all'] as const
type StatusType = typeof VALID_STATUS[number]

/* ================= TYPES ================= */
export type WorkLibraryItem = {
  package_id: string
  package_name: string
  scope: string
  category: string
  job_name: string
  unit: string
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
    filters?: {
      category?: string | null
      status?: string
    }
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

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && RETRYABLE_CODES.includes(Number(error.code))) {
      const delay = 1000 * (4 - retries)
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

function isEmptyRow(row: any[]): boolean {
  return row.every(cell => !cell || cell.toString().trim() === '')
}

/* ================= MAIN API ================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('category_id')
    const requestedStatus = (searchParams.get('status') || 'active').toLowerCase() as StatusType

    // ✅ Validasi status
    if (!VALID_STATUS.includes(requestedStatus as any)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Status tidak valid. Gunakan: active, inactive, archived, atau all" 
        },
        { status: 400 }
      )
    }

    logger.info('Fetching work library data', { 
      categoryId, 
      status: requestedStatus
    })

    const res = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:L`,
      })
    )

    const rows = res.data.values || []
    
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        metadata: { 
          total_packages: 0, 
          total_items: 0,
          filters: { category: categoryId, status: requestedStatus }
        }
      })
    }

    const packageMap = new Map<string, WorkLibraryPackage>()
    let totalItems = 0
    let skippedRows = 0

    for (const row of rows) {
      // ✅ Skip baris kosong
      if (isEmptyRow(row)) {
        skippedRows++
        continue
      }

      // ✅ Validasi panjang row
      if (row.length < REQUIRED_COLUMNS) {
        logger.warn('Row has insufficient columns', { 
          length: row.length, 
          required: REQUIRED_COLUMNS,
          row: row.slice(0, 3) // Log first 3 cells for debugging
        })
        continue
      }

      const packageId = row[COLUMNS.PACKAGE_ID]?.toString().trim()
      const itemStatus = (row[COLUMNS.STATUS] || 'ACTIVE').toString().trim().toLowerCase()
      
      if (!packageId) continue

      // Filter by status
      if (requestedStatus !== 'all' && itemStatus !== requestedStatus) continue

      // ✅ Filter by category (case-insensitive)
      if (categoryId && row[COLUMNS.CATEGORY]?.toString().trim().toLowerCase() !== categoryId.toLowerCase()) continue

      const item: WorkLibraryItem = {
        package_id: packageId,
        package_name: row[COLUMNS.PACKAGE_NAME]?.trim() || '',
        scope: row[COLUMNS.SCOPE]?.trim() || '',
        category: row[COLUMNS.CATEGORY]?.trim() || '',
        job_name: row[COLUMNS.JOB_NAME]?.trim() || '',
        unit: row[COLUMNS.UNIT]?.trim() || '',
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
      } else {
        // ✅ Opsional: validasi konsistensi package_name
        const existing = packageMap.get(packageId)!
        if (existing.package_name !== item.package_name) {
          logger.warn('Inconsistent package_name', { 
            packageId, 
            existing: existing.package_name, 
            new: item.package_name 
          })
        }
      }

      packageMap.get(packageId)!.items.push(item)
      totalItems++
    }

    const packages = Array.from(packageMap.values())
    packages.sort((a, b) => a.package_id.localeCompare(b.package_id))

    logger.info('Work library fetched successfully', { 
      total_packages: packages.length,
      total_items: totalItems,
      skipped_rows: skippedRows,
      filters: { 
        categoryId, 
        status: requestedStatus
      }
    })

    return NextResponse.json({
      success: true,
      data: packages,
      metadata: {
        total_packages: packages.length,
        total_items: totalItems,
        filters: {
          category: categoryId,
          status: requestedStatus
        }
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
