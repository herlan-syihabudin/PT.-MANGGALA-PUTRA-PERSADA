// app/api/projects/[project_id]/material-request/route.ts
import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

// ========== CONSTANTS ==========
const SHEET_ID = process.env.GSHEET_PROJECT_ID
const PROCUREMENT_SHEET_ID = process.env.GSHEET_PROCUREMENT_ID
const MR_SHEET = "MATERIAL_REQUESTS"      // FIXED: typo
const PR_SHEET = "PURCHASE_REQUEST"       // A:O
const PR_ITEM_SHEET = "PR_ITEMS"          // A:I
const PROJECT_SHEET = "PROJECTS"          // minimal kolom A = project_id
const AUDIT_SHEET = "MR_AUDIT"            // 🔥 NEW: Audit trail sheet

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

const AUDIT_COLUMNS = {
  ID: 0,
  REQUEST_NO: 1,
  ACTION: 2,
  PERFORMED_BY: 3,
  PERFORMED_AT: 4,
  NOTES: 5
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

type AuditLog = {
  id: string
  request_no: string
  action: "Approved" | "Rejected" | "Delivered"
  performed_by: string
  performed_at: string
  notes?: string
}

// ========== GOOGLE SHEETS AUTH ==========
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

// ========== CACHE ==========
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30 * 1000 // 30 detik

// ========== RATE LIMITING with Redis-like cleanup ==========
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 20 // Increased for bulk operations

function checkRateLimit(req: Request): { allowed: boolean; retryAfter?: number } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
             req.headers.get("x-real-ip") ||
             "unknown"
  const now = Date.now()
  
  const record = rateLimit.get(ip)
  
  // Cleanup expired
  if (record && record.resetAt < now) {
    rateLimit.delete(ip)
  }
  
  const current = rateLimit.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW }
  
  if (current.count >= RATE_LIMIT_MAX) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((current.resetAt - now) / 1000) 
    }
  }
  
  current.count++
  rateLimit.set(ip, current)
  
  // Periodic cleanup (every 100 requests)
  if (rateLimit.size > 1000) {
    const now = Date.now()
    for (const [key, value] of rateLimit.entries()) {
      if (value.resetAt < now) {
        rateLimit.delete(key)
      }
    }
  }

  return { allowed: true }
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
  const sequence = Date.now().toString().slice(-4)
  
  return `MR-${year}${month}${day}-${random}${sequence}`
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
      
      // 🔥 FIX: Compare by request_no, not per item
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
async function createPRFromApprovedMR(requestNo: string): Promise<{ success: boolean; error?: string }> {
  if (!PROCUREMENT_SHEET_ID) {
    return { success: false, error: "Procurement sheet not configured" }
  }

  try {
    // Check if PR already exists
    const existingPR = await sheets.spreadsheets.values.get({
      spreadsheetId: PROCUREMENT_SHEET_ID,
      range: `${PR_SHEET}!A2:O`,
    })

    const existingRows = existingPR.data.values || []
    const prExists = existingRows.some(r => r[7]?.includes(requestNo))

    if (prExists) {
      return { success: true } // Already exists, consider it success
    }

    // Get MR items
    const mrRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MR_SHEET}!A:N`,
    })

    const allRows = (mrRes.data.values || []).slice(1)
    const items = allRows.filter(r => r[COLUMNS.REQUEST_NO] === requestNo)

    if (items.length === 0) {
      return { success: false, error: "No items found" }
    }

    const first = items[0]
    const now = new Date().toISOString()
    
    const pr_id = "PR-" + nanoid(8).toUpperCase()
    const pr_code = "PR-" + new Date().getFullYear() + 
                    ("0" + (new Date().getMonth() + 1)).slice(-2) + 
                    ("0" + new Date().getDate()).slice(-2) + "-" +
                    Math.floor(Math.random() * 1000).toString().padStart(3, '0')

    // 🔥 BATCH OPERATION: Create PR header and items in one go
    const batchData = [
      // Header
      {
        range: `${PR_SHEET}!A:O`,
        values: [[
          pr_id, pr_code, first[COLUMNS.PROJECT_ID], first[COLUMNS.REQUESTED_BY],
          now, "", "SUBMITTED", `Auto from MR: ${requestNo}`,
          "SYSTEM", "SYSTEM", "", now, now, 1, ""
        ]]
      },
      // Items (multiple rows)
      ...items.map((item, idx) => ({
        range: `${PR_ITEM_SHEET}!A${idx + 2}:I${idx + 2}`,
        values: [[
          "PRI-" + nanoid(8).toUpperCase(),
          pr_id,
          "",
          item[COLUMNS.MATERIAL_NAME],
          Number(item[COLUMNS.QTY]),
          item[COLUMNS.UNIT],
          "",
          "",
          now
        ]]
      }))
    ]

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: PROCUREMENT_SHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: batchData
      }
    })

    console.log(`✅ PR created for MR: ${requestNo} with ${items.length} items`)
    return { success: true }

  } catch (error) {
    console.error("Error creating PR from MR:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ========== WRITE AUDIT LOG ==========
async function writeAuditLog(log: Omit<AuditLog, "id">): Promise<void> {
  try {
    const id = nanoid()
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${AUDIT_SHEET}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          id,
          log.request_no,
          log.action,
          log.performed_by,
          log.performed_at,
          log.notes || ""
        ]]
      }
    })
  } catch (error) {
    console.error("Error writing audit log:", error)
    // Non-critical, don't throw
  }
}

// ========== POST ==========
export async function POST(req: Request) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  
  try {
    const rateLimitResult = checkRateLimit(req)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests", retryAfter: rateLimitResult.retryAfter },
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

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${MR_SHEET}!A:N`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: rows },
      })

      // Clear cache
      cache.delete(`mr_${project_id}`)

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

  // 🔥 Check cache
  const cacheKey = `mr_${project_id}_${request_no || 'all'}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ success: true, data: cached.data })
  }

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MR_SHEET}!A:N`,
      valueRenderOption: "UNFORMATTED_VALUE",
    })
    
    const rows = (res.data.values || []).slice(1)
    
    let filteredRows = rows
    
    if (project_id) {
      filteredRows = filteredRows.filter(r => r[COLUMNS.PROJECT_ID]?.trim() === project_id)
    }
    
    if (request_no) {
      filteredRows = filteredRows.filter(r => r[COLUMNS.REQUEST_NO]?.trim() === request_no)
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

    // 🔥 Save to cache
    cache.set(cacheKey, { data: requests, timestamp: Date.now() })

    return NextResponse.json({ success: true, data: requests })

  } catch (error) {
    console.error("GET MATERIAL REQUEST ERROR:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch material requests" },
      { status: 500 }
    )
  }
}

// ========== 🔥 NEW: BULK UPDATE ==========
export async function PUT(req: Request) {
  try {
    const rateLimitResult = checkRateLimit(req)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests", retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { request_nos, status, approved_by, approved_at } = body

    if (!request_nos || !Array.isArray(request_nos) || request_nos.length === 0) {
      return NextResponse.json(
        { success: false, error: "request_nos array is required" },
        { status: 400 }
      )
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      )
    }

    if (!approved_by) {
      return NextResponse.json(
        { success: false, error: "approved_by is required" },
        { status: 400 }
      )
    }

    // Get all rows
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MR_SHEET}!A:N`,
    })

    const rows = (res.data.values || []).slice(1)
    
    // Find all indexes to update
    const indexesToUpdate = rows
      .map((row, idx) => ({ row, idx }))
      .filter(({ row }) => request_nos.includes(row[COLUMNS.REQUEST_NO]))
      .map(({ idx }) => idx)

    if (indexesToUpdate.length === 0) {
      return NextResponse.json(
        { success: false, error: "No matching requests found" },
        { status: 404 }
      )
    }

    const now = approved_at || new Date().toISOString()

    // 🔥 BATCH UPDATE using batchUpdate
    const updateData = indexesToUpdate.map(idx => ({
      range: `${MR_SHEET}!K${idx + 2}:M${idx + 2}`,
      values: [[status, approved_by, now]]
    }))

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updateData
      }
    })

    // 🔥 Write audit logs
    const auditPromises = request_nos.map(requestNo =>
      writeAuditLog({
        request_no: requestNo,
        action: status,
        performed_by: approved_by,
        performed_at: now,
        notes: `Bulk ${status}`
      })
    )
    await Promise.all(auditPromises)

    // 🔥 Create PRs for approved requests (with retry)
    if (status === "Approved") {
      const prPromises = request_nos.map(async (requestNo) => {
        const result = await createPRFromApprovedMR(requestNo)
        if (!result.success) {
          console.error(`Failed to create PR for ${requestNo}:`, result.error)
          // Write failed PR to audit
          await writeAuditLog({
            request_no: requestNo,
            action: status,
            performed_by: "SYSTEM",
            performed_at: new Date().toISOString(),
            notes: `PR creation failed: ${result.error}`
          })
        }
        return result
      })
      
      await Promise.all(prPromises)
    }

    // Clear cache
    cache.clear()

    return NextResponse.json({
      success: true,
      data: {
        processed: indexesToUpdate.length,
        status,
        approved_by,
        approved_at: now
      }
    })

  } catch (error) {
    console.error("BULK UPDATE ERROR:", error)
    return NextResponse.json(
      { success: false, error: "Failed to bulk update" },
      { status: 500 }
    )
  }
}

// ========== 🔥 NEW: AUDIT ENDPOINT ==========
export async function audit(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const request_no = searchParams.get('request_no')
    const limit = parseInt(searchParams.get('limit') || '50')

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${AUDIT_SHEET}!A:F`,
      valueRenderOption: "UNFORMATTED_VALUE",
    })

    const rows = (res.data.values || []).slice(1)
    
    let filteredRows = rows
    
    if (params.project_id) {
      // Filter by project_id by joining with MR sheet
      const mrRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${MR_SHEET}!A:B`,
      })
      const mrRows = (mrRes.data.values || []).slice(1)
      const projectRequestNos = mrRows
        .filter(r => r[COLUMNS.PROJECT_ID] === params.project_id)
        .map(r => r[COLUMNS.REQUEST_NO])
      
      filteredRows = filteredRows.filter(r => projectRequestNos.includes(r[AUDIT_COLUMNS.REQUEST_NO]))
    }
    
    if (request_no) {
      filteredRows = filteredRows.filter(r => r[AUDIT_COLUMNS.REQUEST_NO] === request_no)
    }

    const logs = filteredRows
      .slice(0, limit)
      .map(row => ({
        id: row[AUDIT_COLUMNS.ID],
        request_no: row[AUDIT_COLUMNS.REQUEST_NO],
        action: row[AUDIT_COLUMNS.ACTION],
        performed_by: row[AUDIT_COLUMNS.PERFORMED_BY],
        performed_at: row[AUDIT_COLUMNS.PERFORMED_AT],
        notes: row[AUDIT_COLUMNS.NOTES] || undefined
      }))
      .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime())

    return NextResponse.json({ success: true, data: logs })

  } catch (error) {
    console.error("AUDIT ERROR:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}

// ========== PATCH (Legacy - keep for backward compatibility) ==========
export async function PATCH(req: Request) {
  return PUT(req) // 🔥 Redirect to bulk endpoint
}
