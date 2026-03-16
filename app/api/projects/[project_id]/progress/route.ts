import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

// Types
type SheetRow = [
  string, // project_id
  string, // mep
  string, // civil
  string, // steel
  string, // interior
  string  // updated_at
]

type ProgressData = {
  project_id: string
  mep_progress: number
  civil_progress: number
  steel_progress: number
  interior_progress: number
  updated_at: string | null
  is_new?: boolean
}

// Constants
const SHEET_ID = process.env.GSHEET_PROJECT_ID
const SHEET_NAME = "PROJECT_SCOPE_PROGRESS"
const CACHE_TTL = 5000 // 5 seconds
const REQUEST_TIMEOUT = 10000 // 10 seconds

// Validate environment
if (!SHEET_ID) {
  throw new Error("GSHEET_PROJECT_ID is not defined")
}

// Google Auth
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

// Simple cache
const cache = new Map<string, { data: ProgressData; timestamp: number }>()
const rowIndexCache = new Map<string, number>()

// Rate limiting
const rateLimit = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 30

/**
 * GET /api/projects/[project_id]/progress
 * Fetch scope progress for a specific project
 */
export async function GET(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  
  try {
    // ========== VALIDATION ==========
    const { project_id } = params
    
    if (!project_id || typeof project_id !== 'string') {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedId = project_id.trim().replace(/[^a-zA-Z0-9_-]/g, '')
    if (sanitizedId !== project_id) {
      return NextResponse.json(
        { message: "Invalid project ID format" },
        { status: 400 }
      )
    }

    // ========== RATE LIMITING ==========
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
               req.headers.get("x-real-ip") ||
               "unknown"
    const now = Date.now()
    
    const requests = rateLimit.get(ip) || []
    const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
    
    if (recentRequests.length >= RATE_LIMIT_MAX) {
      console.warn(`[${requestId}] Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }
    
    recentRequests.push(now)
    rateLimit.set(ip, recentRequests.slice(-RATE_LIMIT_MAX))
    if (rateLimit.size > 500) {
  for (const [key, times] of rateLimit.entries()) {
    if (now - times[times.length - 1] > RATE_LIMIT_WINDOW) {
      rateLimit.delete(key)
    }
  }
}

    // ========== CHECK CACHE ==========
    const cached = cache.get(sanitizedId)
    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log(`[${requestId}] Cache hit for project: ${sanitizedId}`)
      return NextResponse.json(cached.data)
    }

    // ========== FETCH FROM SHEETS ==========
    console.log(`[${requestId}] Fetching from sheets for project: ${sanitizedId}`)
    
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:F`,
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const rows = (res.data.values || []) as SheetRow[]
    
    // Find project by ID (case-insensitive)
    const rowIndex = rows.findIndex(
      (r) => r[0]?.toLowerCase() === sanitizedId.toLowerCase()
    )

    const row = rowIndex !== -1 ? rows[rowIndex] : undefined

    if (rowIndex !== -1) {
      rowIndexCache.set(sanitizedId, rowIndex)
    }

    // Prepare response
    let responseData: ProgressData

    if (!row) {
      // New project - return zeros
      responseData = {
        project_id: sanitizedId,
        mep_progress: 0,
        civil_progress: 0,
        steel_progress: 0,
        interior_progress: 0,
        updated_at: null,
        is_new: true,
      }
    } else {
      // Existing project - parse values
      const [_, mep, civil, steel, interior, updated_at] = row
      
      responseData = {
        project_id: sanitizedId,
        mep_progress: Number(mep) || 0,
        civil_progress: Number(civil) || 0,
        steel_progress: Number(steel) || 0,
        interior_progress: Number(interior) || 0,
        updated_at: updated_at || null,
      }
    }

    // ========== UPDATE CACHE ==========
    cache.set(sanitizedId, {
      data: responseData,
      timestamp: now,
    })

    // Cleanup old cache entries
    if (cache.size > 100) {
      const oldest = now - CACHE_TTL * 2
      for (const [key, value] of cache.entries()) {
        if (value.timestamp < oldest) {
          cache.delete(key)
        }
      }
    }

    console.log(`[${requestId}] Success for project: ${sanitizedId}`)
    return NextResponse.json(responseData)

  } catch (error) {
    // ========== ERROR HANDLING ==========
    console.error(`[${requestId}] Error:`, error)
    
    if (error instanceof Error) {
      if (error.message.includes('Google Sheets API')) {
        return NextResponse.json(
          { 
            message: "Unable to access progress data. Please try again later.",
            code: "SHEETS_API_ERROR"
          },
          { status: 503 }
        )
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { message: "Service is busy. Please try again later." },
          { status: 429 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        message: "Failed to fetch project progress",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/projects/[project_id]/progress
 * Update scope progress for a specific project
 */
export async function PATCH(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  
  try {
    // ========== VALIDATION ==========
    const sanitizedId = params.project_id.trim().replace(/[^a-zA-Z0-9_-]/g, '')

if (!sanitizedId) {
  return NextResponse.json(
    { message: "Project ID is required" },
    { status: 400 }
  )
}

    const body = await req.json()
    const {
      mep_progress,
      civil_progress,
      steel_progress,
      interior_progress,
    } = body

    // Validate progress values (0-100)
    const values = [mep_progress, civil_progress, steel_progress, interior_progress]
    for (const val of values) {
      if (typeof val !== 'number' || val < 0 || val > 100) {
        return NextResponse.json(
          { message: "Progress values must be numbers between 0 and 100" },
          { status: 400 }
        )
      }
    }

    const updatedAt = new Date().toISOString()
    const rowValues = [
     sanitizedId,
      mep_progress,
      civil_progress,
      steel_progress,
      interior_progress,
      updatedAt,
    ]

    // ========== UPDATE SHEETS ==========
    console.log(`[${requestId}] Updating progress for project: ${sanitizedId}`)
    
    const rowIndex = rowIndexCache.get(sanitizedId)
    let updateResult

    // Setup timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      if (rowIndex !== undefined) {
        // Update existing row
        updateResult = await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${SHEET_NAME}!A${rowIndex + 2}:F${rowIndex + 2}`,
          valueInputOption: "RAW",
          requestBody: { values: [rowValues] },
        }, {
          signal: controller.signal
        })
      } else {
        // Append new row
        updateResult = await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: `${SHEET_NAME}!A:F`,
          valueInputOption: "RAW",
          requestBody: { values: [rowValues] },
        }, {
          signal: controller.signal
        })

        // If append successful, update rowIndexCache with new index
        if (updateResult.data.updates?.updatedRange) {
          const match = updateResult.data.updates.updatedRange.match(/A(\d+)/)
          if (match) {
            const newIndex = parseInt(match[1]) - 2 // Convert to 0-based index from row 2
            rowIndexCache.set(sanitizedId, newIndex)
          }
        }
      }

      clearTimeout(timeoutId)
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("Request timeout")
      }
      throw error
    }

    // ========== CLEAR CACHE ==========
    cache.delete(sanitizedId)

   console.log(`[${requestId}] Success updating progress for project: ${sanitizedId}`)
    return NextResponse.json({ 
      success: true,
      updated_at: updatedAt 
    })

  } catch (error) {
    console.error(`[${requestId}] Error:`, error)
    
    if (error instanceof Error) {
      if (error.message === "Request timeout") {
        return NextResponse.json(
          { message: "Request timeout. Please try again." },
          { status: 504 }
        )
      }
      
      if (error.message.includes('Google Sheets API')) {
        return NextResponse.json(
          { message: "Sheets service unavailable" },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { message: "Failed to update progress" },
      { status: 500 }
    )
  }
}
