import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

// ========== CONSTANTS ==========
const SHEET_ID = process.env.GSHEET_PROJECT_ID
const TERMIN_SHEET = "PROJECT_TERMIN"

if (!SHEET_ID) {
  throw new Error("GSHEET_PROJECT_ID is not defined")
}

const COLUMNS = {
  PROJECT_ID: 0,
  TERMIN_NO: 1,
  DESCRIPTION: 2,
  PERCENT: 3,
  VALUE: 4,
  STATUS: 5,
  DUE_DATE: 6,
  PAID_DATE: 7,
  CREATED_AT: 8
} as const

const VALID_STATUSES = ["Draft", "Submitted", "Paid", "Overdue"] as const
type TerminStatus = typeof VALID_STATUSES[number]

// ========== TYPES ==========
type Termin = {
  project_id: string
  termin_no: number
  description: string
  percent: number
  value: number
  status: TerminStatus
  due_date: string | null
  paid_date: string | null
  created_at: string
}

type CreateTerminInput = {
  termin_no: number
  description?: string
  percent: number
  value: number
  due_date?: string
}

// ========== GOOGLE SHEETS AUTH ==========
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

// ========== RATE LIMITING ==========
const rateLimit = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 30

function checkRateLimit(req: Request): { ip: string; allowed: boolean } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
             req.headers.get("x-real-ip") ||
             "unknown"
  const now = Date.now()
  
  const requests = rateLimit.get(ip) || []
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW)
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return { ip, allowed: false }
  }
  
  recentRequests.push(now)
  rateLimit.set(ip, recentRequests)

  // ✅ cleanup old IP entries
  if (rateLimit.size > 500) {
    for (const [key, times] of rateLimit.entries()) {
      if (Date.now() - times[times.length - 1] > RATE_LIMIT_WINDOW) {
        rateLimit.delete(key)
      }
    }
  }

  return { ip, allowed: true }
}

// ========== VALIDATION FUNCTIONS ==========
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

function validateTerminInput(input: any): CreateTerminInput {
  const { termin_no, percent, value, description, due_date } = input
  
  // Validate termin_no
  if (termin_no === undefined || termin_no === null) {
    throw new Error("Termin number is required")
  }
  
  const terminNum = Number(termin_no)
  if (isNaN(terminNum) || terminNum < 1) {
    throw new Error("Termin number must be a positive number")
  }
  
  // Validate percent (0-100)
  if (percent === undefined || percent === null) {
    throw new Error("Percent is required")
  }
  
  const percentNum = Number(percent)
  if (isNaN(percentNum) || percentNum < 0 || percentNum > 100) {
    throw new Error("Percent must be between 0 and 100")
  }
  
  // Validate value (positive number)
  if (value === undefined || value === null) {
    throw new Error("Value is required")
  }
  
  const valueNum = Number(value)
  if (isNaN(valueNum) || valueNum < 0) {
    throw new Error("Value must be a positive number")
  }
  
  // Validate due_date if provided
  if (due_date && isNaN(Date.parse(due_date))) {
    throw new Error("Invalid due date format. Use YYYY-MM-DD")
  }
  
  return {
    termin_no: terminNum,
    percent: percentNum,
    value: valueNum,
    description: description?.toString() || "",
    due_date: due_date || ""
  }
}

// ========== GET /api/projects/[project_id]/termin ==========
export async function GET(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  
  try {
    // Rate limiting
    const { allowed, ip } = checkRateLimit(req)
    if (!allowed) {
      console.warn(`[${requestId}] Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Validate project_id
    const projectId = validateProjectId(params.project_id)
    
    console.log(`[${requestId}] Fetching termins for project: ${projectId}`)
    
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TERMIN_SHEET}!A2:I`,
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const rows = res.data.values || []
    
    const termins: Termin[] = rows
      .filter((r) => r[COLUMNS.PROJECT_ID] === projectId)
      .map((r) => ({
        project_id: r[COLUMNS.PROJECT_ID],
        termin_no: Number(r[COLUMNS.TERMIN_NO]) || 0,
        description: r[COLUMNS.DESCRIPTION] || "",
        percent: Number(r[COLUMNS.PERCENT]) || 0,
        value: Number(r[COLUMNS.VALUE]) || 0,
        status: (r[COLUMNS.STATUS] as TerminStatus) || "Draft",
        due_date: r[COLUMNS.DUE_DATE] || null,
        paid_date: r[COLUMNS.PAID_DATE] || null,
        created_at: r[COLUMNS.CREATED_AT] || new Date().toISOString(),
      }))
      .sort((a, b) => a.termin_no - b.termin_no)

    console.log(`[${requestId}] Found ${termins.length} termins`)
    return NextResponse.json(termins)
    
  } catch (err) {
    console.error(`[${requestId}] GET TERMIN ERROR:`, err)
    
    if (err instanceof Error) {
      if (err.message.includes("Project ID")) {
        return NextResponse.json(
          { message: err.message },
          { status: 400 }
        )
      }
      
      if (err.message.includes("Google Sheets API")) {
        return NextResponse.json(
          { message: "Unable to access termin data" },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { message: "Failed to fetch termins" },
      { status: 500 }
    )
  }
}

// ========== POST /api/projects/[project_id]/termin ==========
export async function POST(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  
  try {
    // Rate limiting
    const { allowed, ip } = checkRateLimit(req)
    if (!allowed) {
      console.warn(`[${requestId}] Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Validate project_id
    const projectId = validateProjectId(params.project_id)
    
    // Parse and validate body
    const body = await req.json()
    const validatedInput = validateTerminInput(body)
    
    console.log(`[${requestId}] Creating termin #${validatedInput.termin_no} for project: ${projectId}`)
    
    const created_at = new Date().toISOString()
    const status: TerminStatus = "Draft"
    
    // Check if termin_no already exists for this project
    const existingRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TERMIN_SHEET}!A:I`,
    })
    
    const existingRows = existingRes.data.values || []
    
    // ===== check total termin percent =====
const projectTermins = existingRows.filter(
  (r) => r[COLUMNS.PROJECT_ID] === projectId
)

const totalPercent = projectTermins.reduce(
  (sum, r) => sum + Number(r[COLUMNS.PERCENT] || 0),
  0
)

if (totalPercent + validatedInput.percent > 100) {
  return NextResponse.json(
    { message: "Total termin percent cannot exceed 100%" },
    { status: 400 }
  )
}
    const terminExists = projectTermins.some(
  (r) => Number(r[COLUMNS.TERMIN_NO]) === validatedInput.termin_no
)
    
    if (terminExists) {
      return NextResponse.json(
        { message: `Termin #${validatedInput.termin_no} already exists for this project` },
        { status: 409 }
      )
    }
    
    // Create new termin
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${TERMIN_SHEET}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          projectId,
          validatedInput.termin_no,
          validatedInput.description,
          validatedInput.percent,
          validatedInput.value,
          status,
          validatedInput.due_date,
          "", // paid_date (empty)
          created_at,
        ]],
      },
    })

    console.log(`[${requestId}] Termin #${validatedInput.termin_no} created successfully`)
    
    return NextResponse.json(
      { 
        message: "Termin created successfully",
        termin_no: validatedInput.termin_no 
      },
      { status: 201 }
    )
    
  } catch (err) {
    console.error(`[${requestId}] CREATE TERMIN ERROR:`, err)
    
    if (err instanceof Error) {
      // Validation errors
      if (err.message.includes("Project ID") || 
          err.message.includes("Termin number") ||
          err.message.includes("Percent") ||
          err.message.includes("Value") ||
          err.message.includes("due date")) {
        return NextResponse.json(
          { message: err.message },
          { status: 400 }
        )
      }
      
      // Google Sheets API errors
      if (err.message.includes("Google Sheets API")) {
        return NextResponse.json(
          { message: "Unable to create termin. Please try again later." },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { message: "Failed to create termin" },
      { status: 500 }
    )
  }
}

// Optional: Revalidation
export const revalidate = 5
