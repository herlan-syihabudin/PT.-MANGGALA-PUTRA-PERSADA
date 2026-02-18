import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

// ===== GOOGLE AUTH =====
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)
const sheets = google.sheets({ version: "v4", auth })

const SHEET_ID = process.env.GSHEET_PROCUREMENT_ID!
const PR_SHEET = "PURCHASE_REQUEST" // A:O
const PR_ITEM_SHEET = "PR_ITEMS" // A:I
const PROJECT_SHEET = "PROJECTS" // minimal kolom A = project_id

// ===== TYPES =====
type PRStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ORDERED"
const allowedStatus: PRStatus[] = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ORDERED"]

type PRRow = {
  pr_id: string
  pr_code: string
  project_id: string
  requested_by: string
  request_date: string
  needed_date?: string
  status: PRStatus
  notes?: string
  created_by?: string
  updated_by?: string
  deleted_by?: string
  created_at: string
  updated_at: string
  version: number
  deleted_at?: string | null
}

type PRItem = {
  pr_item_id: string
  pr_id: string
  material_id?: string
  description: string
  qty: number
  unit: string
  estimated_price?: number
  subtotal?: number
  created_at: string
}

// ===== HELPERS =====
const nowISO = () => new Date().toISOString()

function s(v: any, max = 500): string | undefined {
  if (v === undefined || v === null) return undefined
  const t = String(v).trim()
  if (!t) return undefined
  return t.length > max ? t.slice(0, max) : t
}
function n(v: any): number {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}
function norm(v: any) {
  return String(v || "").trim().toLowerCase()
}

async function getPRRows() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PR_SHEET}!A2:O`,
  })
  return res.data.values || []
}

async function getPRItemRows() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PR_ITEM_SHEET}!A2:I`,
  })
  return res.data.values || []
}

async function validateProject(project_id: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PROJECT_SHEET}!A2:A`,
  })
  const ids = (res.data.values || []).map(r => r[0])
  return ids.includes(project_id)
}

function mapPRRow(r: any[]): PRRow {
  const statusRaw = r[6]
  const status: PRStatus = allowedStatus.includes(statusRaw) ? statusRaw : "DRAFT"

  return {
    pr_id: r[0] || "",
    pr_code: r[1] || "",
    project_id: r[2] || "",
    requested_by: r[3] || "",
    request_date: r[4] || "",
    needed_date: r[5] || "",
    status,
    notes: r[7] || "",
    created_by: r[8] || "",
    updated_by: r[9] || "",
    deleted_by: r[10] || "",
    created_at: r[11] || "",
    updated_at: r[12] || "",
    version: n(r[13] || 1) || 1,
    deleted_at: r[14] || null,
  }
}

function mapItemRow(r: any[]): PRItem {
  const qty = n(r[4])
  const estimated_price = r[6] === "" || r[6] === undefined ? undefined : n(r[6])
  const subtotal = r[7] === "" || r[7] === undefined ? undefined : n(r[7])

  return {
    pr_item_id: r[0] || "",
    pr_id: r[1] || "",
    material_id: r[2] || undefined,
    description: r[3] || "",
    qty,
    unit: r[5] || "",
    estimated_price,
    subtotal,
    created_at: r[8] || "",
  }
}

// ===== GET LIST =====
// GET /api/procurement/pr?status=&project_id=&search=&include_deleted=true&include_items=true
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") as PRStatus | null
    const project_id = searchParams.get("project_id")
    const search = searchParams.get("search")
    const includeDeleted = searchParams.get("include_deleted") === "true"
    const includeItems = searchParams.get("include_items") === "true"

    let rows = await getPRRows()
    if (!includeDeleted) rows = rows.filter(r => !r[14]) // deleted_at

    let prs = rows.map(mapPRRow)

    if (status && allowedStatus.includes(status)) {
      prs = prs.filter(p => p.status === status)
    }
    if (project_id) {
      prs = prs.filter(p => p.project_id === project_id)
    }
    if (search) {
      const q = norm(search)
      prs = prs.filter(p =>
        norm(p.pr_code).includes(q) ||
        norm(p.requested_by).includes(q) ||
        norm(p.project_id).includes(q)
      )
    }

    prs.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())

    if (!includeItems) {
      return NextResponse.json({ success: true, data: prs, error: null })
    }

    const itemRows = await getPRItemRows()
    const items = itemRows.map(mapItemRow)

    const itemsByPR = items.reduce((acc, it) => {
      if (!acc[it.pr_id]) acc[it.pr_id] = []
      acc[it.pr_id].push(it)
      return acc
    }, {} as Record<string, PRItem[]>)

    const result = prs.map(pr => ({ ...pr, items: itemsByPR[pr.pr_id] || [] }))

    return NextResponse.json({ success: true, data: result, error: null })
  } catch (err) {
    console.error("GET PR LIST ERROR:", err)
    return NextResponse.json({ success: false, data: null, error: "Failed to fetch PR list" }, { status: 500 })
  }
}

// ===== CREATE =====
// POST /api/procurement/pr
// body: { pr_code, project_id, requested_by, request_date?, needed_date?, notes?, status?, created_by?, items?:[{description,qty,unit,estimated_price?,material_id?}] }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, data: null, error: "Invalid JSON body" }, { status: 400 })
    }

    const pr_code = s(body.pr_code, 60)
    const project_id = s(body.project_id, 60)
    const requested_by = s(body.requested_by, 120)
    const notes = s(body.notes, 2000)

    if (!pr_code || !project_id || !requested_by) {
      return NextResponse.json({ success: false, data: null, error: "pr_code, project_id, requested_by required" }, { status: 400 })
    }

    const projectOk = await validateProject(project_id)
    if (!projectOk) {
      return NextResponse.json({ success: false, data: null, error: "Project not found" }, { status: 400 })
    }

    // Unique pr_code (soft delete aware)
    const rows = await getPRRows()
    const dup = rows.some(r => norm(r[1]) === norm(pr_code) && !r[14])
    if (dup) {
      return NextResponse.json({ success: false, data: null, error: "pr_code must be unique" }, { status: 409 })
    }

    const status: PRStatus = allowedStatus.includes(body.status) ? body.status : "DRAFT"
    const pr_id = "PR-" + nanoid(8).toUpperCase()
    const now = nowISO()
    const version = 1

    // Create header
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PR_SHEET}!A:O`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          pr_id,
          pr_code,
          project_id,
          requested_by,
          body.request_date || now,
          body.needed_date || "",
          status,
          notes || "",
          body.created_by || "SYSTEM",
          body.created_by || "SYSTEM",
          "",
          now,
          now,
          version,
          "",
        ]]
      }
    })

    // Create items (optional)
    const itemsIn = Array.isArray(body.items) ? body.items : []
    const createdItems: PRItem[] = []

    for (const it of itemsIn) {
      const description = s(it?.description, 300)
      const unit = s(it?.unit, 30) || ""
      const qty = n(it?.qty)
      const estimated_price = it?.estimated_price === undefined || it?.estimated_price === "" ? undefined : n(it?.estimated_price)

      if (!description) continue
      if (!qty || qty <= 0) continue

      const subtotal = estimated_price !== undefined ? qty * estimated_price : undefined
      const pr_item_id = "PRI-" + nanoid(8).toUpperCase()

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${PR_ITEM_SHEET}!A:I`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            pr_item_id,
            pr_id,
            it?.material_id || "",
            description,
            qty,
            unit,
            estimated_price ?? "",
            subtotal ?? "",
            now,
          ]]
        }
      })

      createdItems.push({
        pr_item_id,
        pr_id,
        material_id: it?.material_id,
        description,
        qty,
        unit,
        estimated_price,
        subtotal,
        created_at: now,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        pr_id,
        pr_code,
        project_id,
        requested_by,
        status,
        notes,
        version,
        created_at: now,
        updated_at: now,
        items: createdItems,
      },
      error: null,
    }, { status: 201 })
  } catch (err) {
    console.error("CREATE PR ERROR:", err)
    return NextResponse.json({ success: false, data: null, error: "Failed to create PR" }, { status: 500 })
  }
}
