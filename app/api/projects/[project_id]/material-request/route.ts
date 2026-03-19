// app/api/projects/[project_id]/material-request/route.ts
import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

// ========== CONSTANTS ==========
const SHEET_ID = process.env.GSHEET_PROJECT_ID
const PROCUREMENT_SHEET_ID = process.env.GSHEET_PROCUREMENT_ID
const MR_SHEET = "MATERIAL_REQUESTS"      // A:N (14 columns)
const PR_SHEET = "PURCHASE_REQUEST"       // A:O
const PR_ITEM_SHEET = "PR_ITEMS"          // A:I
const PROJECT_SHEET = "PROJECTS"          // minimal kolom A = project_id

if (!SHEET_ID) {
  throw new Error("GSHEET_PROJECT_ID is not defined")
}

if (!PROCUREMENT_SHEET_ID) {
  console.warn("GSHEET_PROCUREMENT_ID is not defined - PR auto-creation will be disabled")
}

const COLUMNS = {
  ID: 0,
  REQUEST_NO: 1,
  PROJECT_ID: 2,
  PROJECT_NAME: 3,
  REQUEST_DATE: 4,
  REQUESTED_BY: 5,
  MATERIAL_NAME: 6,
  QTY: 7,
  UNIT: 8,
  REMARK: 9,
  STATUS: 10,
  CREATED_AT: 11,
  APPROVED_BY: 12,
  APPROVED_AT: 13
} as const

const VALID_STATUSES = ["Pending", "Approved", "Rejected", "Delivered"] as const
type MaterialStatus = typeof VALID_STATUSES[number]

// ========== TYPES ==========
type MaterialItem = {
  material_name: string
  qty: number
  unit: string
  remark?: string
}

type MaterialRequestInput = {
  project_id: string
  project_name: string
  requested_by: string
  items: MaterialItem[]
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
const RATE_LIMIT_MAX = 10

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

  // Cleanup old entries
  if (rateLimit.size > 1000) {
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

function validateProjectName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error("Project name is required")
  }
  
  return name.trim().substring(0, 200)
}

function validateRequestedBy(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error("Requested by is required")
  }
  
  return name.trim().substring(0, 100)
}

function validateMaterialItem(item: any, index: number): MaterialItem {
  if (!item || typeof item !== 'object') {
    throw new Error(`Item #${index + 1} is invalid`)
  }

  if (!item.material_name || typeof item.material_name !== 'string') {
    throw new Error(`Item #${index + 1}: Material name is required`)
  }
  const material_name = item.material_name.trim().substring(0, 200)

  if (item.qty === undefined || item.qty === null) {
    throw new Error(`Item #${index + 1}: Quantity is required`)
  }
  const qty = Number(item.qty)
  if (isNaN(qty) || qty <= 0) {
    throw new Error(`Item #${index + 1}: Quantity must be a positive number`)
  }
  if (qty > 1000000) {
    throw new Error(`Item #${index + 1}: Quantity too large (max 1,000,000)`)
  }

  if (!item.unit || typeof item.unit !== 'string') {
    throw new Error(`Item #${index + 1}: Unit is required`)
  }
  const unit = item.unit.trim().substring(0, 20)

  const remark = item.remark ? item.remark.trim().substring(0, 500) : ""

  return {
    material_name,
    qty,
    unit,
    remark
  }
}

function validateItems(items: any[]): MaterialItem[] {
  if (!Array.isArray(items)) {
    throw new Error("Items must be an array")
  }
  
  if (items.length === 0) {
    throw new Error("At least one item is required")
  }
  
  if (items.length > 100) {
    throw new Error("Maximum 100 items per request")
  }
  
  return items.map((item, index) => validateMaterialItem(item, index))
}

// ========== GENERATE REQUEST NUMBER ==========
function generateRequestNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `MR-${year}${month}${day}-${random}`
}

// ========== CHECK DUPLICATE REQUEST ==========
async function checkDuplicateRequest(
  projectId: string, 
  items: MaterialItem[]
): Promise<boolean> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MR_SHEET}!A:N`,
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const rows = res.data.values || []
    
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    
    return rows.some(row => {
      if (row[COLUMNS.PROJECT_ID] !== projectId) return false
      
      const createdAt = new Date(row[COLUMNS.CREATED_AT]).getTime()
      if (createdAt < fiveMinAgo) return false
      
      const existingItems = `${row[COLUMNS.MATERIAL_NAME]}-${row[COLUMNS.QTY]}-${row[COLUMNS.UNIT]}`
      const newItems = items.map(i => `${i.material_name}-${i.qty}-${i.unit}`).join('|')
      
      return existingItems === newItems
    })
  } catch (error) {
    console.error("Error checking duplicate:", error)
    return false
  }
}

// ========== CREATE PR FROM APPROVED MR ==========
async function createPRFromApprovedMR(requestNo: string): Promise<boolean> {
  // Skip if procurement sheet ID not configured
  if (!PROCUREMENT_SHEET_ID) {
    console.log("PR auto-creation skipped: GSHEET_PROCUREMENT_ID not configured")
    return false
  }

  try {
    // Check if PR already exists for this MR
    const existingPR = await sheets.spreadsheets.values.get({
      spreadsheetId: PROCUREMENT_SHEET_ID,
      range: `${PR_SHEET}!A2:O`,
    })

    const existingRows = existingPR.data.values || []
    const prExists = existingRows.some(r => 
      r[7]?.includes(requestNo) // notes column contains MR number
    )

    if (prExists) {
      console.log(`PR already exists for MR: ${requestNo}`)
      return true
    }

    // Get all items for this request_no
    const mrRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MR_SHEET}!A:N`,
    })

    const allRows = (mrRes.data.values || []).slice(1) // skip header
    const items = allRows.filter(r => r[COLUMNS.REQUEST_NO] === requestNo)

    if (items.length === 0) {
      console.log(`No items found for MR: ${requestNo}`)
      return false
    }

    const first = items[0]
    const now = new Date().toISOString()
    
    // Generate PR ID and Code
    const pr_id = "PR-" + nanoid(8).toUpperCase()
    const pr_code = "PR-" + new Date().getFullYear() + 
                    ("0" + (new Date().getMonth() + 1)).slice(-2) + 
                    ("0" + new Date().getDate()).slice(-2) + "-" +
                    Math.floor(Math.random() * 1000).toString().padStart(3, '0')

    // Create PR Header
    await sheets.spreadsheets.values.append({
      spreadsheetId: PROCUREMENT_SHEET_ID,
      range: `${PR_SHEET}!A:O`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          pr_id,                          // A: pr_id
          pr_code,                         // B: pr_code
          first[COLUMNS.PROJECT_ID],       // C: project_id
          first[COLUMNS.REQUESTED_BY],     // D: requested_by
          now,                              // E: request_date
          "",                               // F: needed_date
          "SUBMITTED",                      // G: status
          `Auto from MR: ${requestNo}`,     // H: notes
          "SYSTEM",                         // I: created_by
          "SYSTEM",                         // J: updated_by
          "",                               // K: deleted_by
          now,                              // L: created_at
          now,                              // M: updated_at
          1,                                // N: version
          "",                               // O: deleted_at
        ]]
      }
    })

    // Create PR Items (multiple items)
    const prItemValues = items.map(item => [
      "PRI-" + nanoid(8).toUpperCase(),     // pr_item_id
      pr_id,                                 // pr_id
      "",                                    // material_id
      item[COLUMNS.MATERIAL_NAME],           // description
      Number(item[COLUMNS.QTY]),             // qty
      item[COLUMNS.UNIT],                    // unit
      "",                                    // estimated_price
      "",                                    // subtotal
      now,                                   // created_at
    ])

    await sheets.spreadsheets.values.append({
      spreadsheetId: PROCUREMENT_SHEET_ID,
      range: `${PR_ITEM_SHEET}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: prItemValues
      }
    })

    console.log(`✅ PR created successfully for MR: ${requestNo} with ${items.length} items`)
    return true

  } catch (error) {
    console.error("Error creating PR from MR:", error)
    return false
  }
}

// ========== POST ==========
export async function POST(req: Request) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  
  try {
    const { allowed, ip } = checkRateLimit(req)
    if (!allowed) {
      console.warn(`[${requestId}] Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    let body: any
    try {
      body = await req.json()
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      )
    }

    try {
      const project_id = validateProjectId(body.project_id)
      const project_name = validateProjectName(body.project_name)
      const requested_by = validateRequestedBy(body.requested_by)
      const items = validateItems(body.items)

      const isDuplicate = await checkDuplicateRequest(project_id, items)
      if (isDuplicate) {
        return NextResponse.json(
          { success: false, error: "Duplicate request detected. Please wait a few minutes." },
          { status: 409 }
        )
      }

      const request_no = generateRequestNumber()
      const now = new Date().toISOString()

      const rows = items.map((item) => [
        crypto.randomUUID(),
        request_no,
        project_id,
        project_name,
        now,
        requested_by,
        item.material_name,
        item.qty,
        item.unit,
        item.remark || "",
        "Pending",
        now,
        "",
        "",
      ])

      console.log(`[${requestId}] Creating material request: ${request_no} with ${items.length} items`)

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${MR_SHEET}!A:N`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: rows },
      })

      console.log(`[${requestId}] Material request created: ${request_no}`)
      
      return NextResponse.json({
        success: true,
        data: {
          request_no,
          items_count: items.length,
          created_at: now
        }
      })

    } catch (validationError) {
      if (validationError instanceof Error) {
        return NextResponse.json(
          { success: false, error: validationError.message },
          { status: 400 }
        )
      }
      throw validationError
    }

  } catch (error) {
    console.error(`[${requestId}] MATERIAL REQUEST ERROR:`, error)

    if (error instanceof Error) {
      if (error.message.includes('Google Sheets API')) {
        return NextResponse.json(
          { success: false, error: "Unable to save material request. Please try again later." },
          { status: 503 }
        )
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: "Service is busy. Please try again." },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to create material request" },
      { status: 500 }
    )
  }
}

// ========== GET ==========
export async function GET(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  const project_id = params.project_id

  const { searchParams } = new URL(req.url)
  const request_no = searchParams.get('request_no')

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MR_SHEET}!A:N`,
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const rows = (res.data.values || []).slice(1)
    
    let filteredRows = rows.filter(r => r && r.length >= 12)
    
    if (project_id) {
      filteredRows = filteredRows.filter(r => r[COLUMNS.PROJECT_ID] === project_id)
    }
    
    if (request_no) {
      filteredRows = filteredRows.filter(r => r[COLUMNS.REQUEST_NO] === request_no)
    }

    const requests = filteredRows.map(row => ({
  id: row[COLUMNS.ID] || "",
  request_no: row[COLUMNS.REQUEST_NO] || "",
  project_id: row[COLUMNS.PROJECT_ID] || "",
  project_name: row[COLUMNS.PROJECT_NAME] || "",
  request_date: row[COLUMNS.REQUEST_DATE] || "",
  requested_by: row[COLUMNS.REQUESTED_BY] || "",
  material_name: row[COLUMNS.MATERIAL_NAME] || "",
  qty: Number(row[COLUMNS.QTY]) || 0,
  unit: row[COLUMNS.UNIT] || "",
  remark: row[COLUMNS.REMARK] || "",
  status: (row[COLUMNS.STATUS] || "Pending") as MaterialStatus,
  created_at: row[COLUMNS.CREATED_AT] || "",
  approved_by: row[COLUMNS.APPROVED_BY] || null,
  approved_at: row[COLUMNS.APPROVED_AT] || null,
}))

    return NextResponse.json({
      success: true,
      data: requests
    })

  } catch (error) {
    console.error("GET MATERIAL REQUEST ERROR:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch material requests" },
      { status: 500 }
    )
  }
}

// ========== PATCH (Update Status + Auto PR) ==========
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { status } = body
    const approvedBy = body.approved_by || ""
    const approvedAt = new Date().toISOString()

    if (!status || !VALID_STATUSES.includes(status as any)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      )
    }

    // Find the row
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MR_SHEET}!A:N`,
    })

    const rows = (res.data.values || []).slice(1)

// cari index dulu
const rowIndex = rows.findIndex(r => r[COLUMNS.ID] === id)

if (rowIndex === -1) {
  return NextResponse.json(
    { success: false, error: "Request not found" },
    { status: 404 }
  )
}

// ambil request_no
const currentRow = rows[rowIndex]
const requestNo = currentRow[COLUMNS.REQUEST_NO]

// cari semua row dengan request_no sama
const allIndexes = rows
  .map((r, i) => ({ r, i }))
  .filter(x => x.r[COLUMNS.REQUEST_NO] === requestNo)
  .map(x => x.i)

// update semua row
for (const idx of allIndexes) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${MR_SHEET}!K${idx + 2}:M${idx + 2}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[status, approvedBy, approvedAt]]
    }
  })
}

    // ===== 🔥 AUTO CREATE PR IF APPROVED =====
    let prCreated = false
    if (status === "Approved") {
      console.log(`🚀 MR Approved: ${requestNo}. Creating PR with all items...`)
      prCreated = await createPRFromApprovedMR(requestNo)
    }

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      data: {
        id,
        status,
        approved_by: approvedBy,
        approved_at: approvedAt,
        pr_created: prCreated
      }
    })

  } catch (error) {
    console.error("PATCH MATERIAL REQUEST ERROR:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 }
    )
  }
}
