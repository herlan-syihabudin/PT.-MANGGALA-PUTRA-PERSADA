// app/api/projects/[project_id]/material-request/audit/route.ts
import { NextResponse } from "next/server"
import { google } from "googleapis"

// ========== CONSTANTS ==========
const SHEET_ID = process.env.GSHEET_PROJECT_ID
const AUDIT_SHEET = "MR_AUDIT"

if (!SHEET_ID) {
  throw new Error("GSHEET_PROJECT_ID is not defined")
}

// 🔥 OPTIMIZED: Langsung simpan project_id di audit sheet
const AUDIT_COLUMNS = {
  ID: 0,
  REQUEST_NO: 1,
  PROJECT_ID: 2,        // ✅ Langsung ada project_id
  ACTION: 3,
  PERFORMED_BY: 4,
  PERFORMED_AT: 5,
  NOTES: 6
} as const

// ========== GOOGLE SHEETS AUTH ==========
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

// ========== CACHE (optional) ==========
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 10 * 1000 // 10 detik

// ========== VALIDATION ==========
function validateProjectId(id: string): string {
  if (!id || typeof id !== 'string') {
    throw new Error("Project ID is required")
  }
  
  const sanitized = id.trim().replace(/[^a-zA-Z0-9_-]/g, '')
  if (sanitized !== id) {
    throw new Error("Invalid project ID format")
  }
  
  return sanitized
}

// ========== GET AUDIT LOGS ==========
export async function GET(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    // 🔥 VALIDATION FIRST
    if (!params?.project_id) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      )
    }

    const project_id = validateProjectId(params.project_id)
    const { searchParams } = new URL(req.url)
    const request_no = searchParams.get('request_no')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 🔥 CHECK CACHE
    const cacheKey = `audit_${project_id}_${request_no || 'all'}_${limit}_${offset}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ 
        success: true, 
        data: cached.data,
        cached: true 
      })
    }

    // Get audit logs
    const auditRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${AUDIT_SHEET}!A:G`, // 🔥 Sekarang 7 columns (A-G)
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const rows = (auditRes.data.values || []).slice(1) // Skip header
    
    // 🔥 FILTER by project_id (langsung, tanpa join)
    let filteredRows = rows.filter(r => 
      r[AUDIT_COLUMNS.PROJECT_ID] === project_id
    )
    
    if (request_no) {
      filteredRows = filteredRows.filter(r => 
        r[AUDIT_COLUMNS.REQUEST_NO] === request_no
      )
    }

    // 🔥 SORT by date descending
    const sortedRows = filteredRows.sort((a, b) => {
      const dateA = new Date(a[AUDIT_COLUMNS.PERFORMED_AT] || 0).getTime()
      const dateB = new Date(b[AUDIT_COLUMNS.PERFORMED_AT] || 0).getTime()
      return dateB - dateA
    })

    // 🔥 PAGINATION
    const paginatedRows = sortedRows.slice(offset, offset + limit)

    const logs = paginatedRows.map(row => ({
      id: row[AUDIT_COLUMNS.ID] || "",
      request_no: row[AUDIT_COLUMNS.REQUEST_NO] || "",
      project_id: row[AUDIT_COLUMNS.PROJECT_ID] || "",
      action: row[AUDIT_COLUMNS.ACTION] || "",
      performed_by: row[AUDIT_COLUMNS.PERFORMED_BY] || "",
      performed_at: row[AUDIT_COLUMNS.PERFORMED_AT] || "",
      notes: row[AUDIT_COLUMNS.NOTES] || undefined
    }))

    const response = {
      success: true,
      data: logs,
      pagination: {
        total: filteredRows.length,
        limit,
        offset,
        hasMore: offset + limit < filteredRows.length
      }
    }

    // 🔥 SAVE TO CACHE
    cache.set(cacheKey, { data: response, timestamp: Date.now() })

    return NextResponse.json(response)

  } catch (error) {
    console.error("AUDIT ERROR:", error)
    
    // 🔥 BETTER ERROR HANDLING
    if (error instanceof Error) {
      if (error.message.includes('Google Sheets API')) {
        return NextResponse.json(
          { success: false, error: "Audit service unavailable" },
          { status: 503 }
        )
      }
      
      if (error.message.includes('Project ID')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}

// ========== OPTIONAL: POST untuk nambah audit langsung ==========
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { request_no, project_id, action, performed_by, notes } = body

    // Validation
    if (!request_no || !project_id || !action || !performed_by) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID?.() || Date.now().toString()
    const performed_at = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${AUDIT_SHEET}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          id,
          request_no,
          project_id,
          action,
          performed_by,
          performed_at,
          notes || ""
        ]]
      }
    })

    return NextResponse.json({
      success: true,
      data: { id, request_no, project_id, action, performed_by, performed_at, notes }
    }, { status: 201 })

  } catch (error) {
    console.error("CREATE AUDIT ERROR:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create audit log" },
      { status: 500 }
    )
  }
}
