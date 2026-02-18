import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

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
const PROJECT_SHEET = "PROJECTS"

type PRStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ORDERED"
const allowedStatus: PRStatus[] = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "ORDERED"]

// Strict transitions
const STATUS_TRANSITIONS: Record<PRStatus, PRStatus[]> = {
  DRAFT: ["SUBMITTED", "REJECTED"],
  SUBMITTED: ["APPROVED", "REJECTED"],
  APPROVED: ["ORDERED"],
  REJECTED: ["DRAFT"],
  ORDERED: [],
}

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

async function getItemRows() {
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

function isValidTransition(oldStatus: PRStatus, newStatus: PRStatus) {
  if (oldStatus === newStatus) return true
  return STATUS_TRANSITIONS[oldStatus]?.includes(newStatus)
}

async function findPRRow(pr_id: string) {
  const rows = await getPRRows()
  const idx = rows.findIndex(r => r[0] === pr_id && !r[14])
  if (idx === -1) return null
  return { idx, rowNumber: idx + 2, row: rows[idx], allRows: rows }
}

async function getItemsByPR(pr_id: string) {
  const rows = await getItemRows()
  return rows.filter(r => r[1] === pr_id).map(mapItemRow)
}

// Replace items safely by rewriting PR_ITEMS (A2:I)
async function replaceItems(pr_id: string, items: any[]) {
  const all = await getItemRows()
  const now = nowISO()

  const kept = all.filter(r => r[1] !== pr_id)

  const newRows: any[] = []
  for (const it of items) {
    const description = s(it?.description, 300)
    const unit = s(it?.unit, 30) || ""
    const qty = n(it?.qty)
    const estimated_price = it?.estimated_price === undefined || it?.estimated_price === "" ? undefined : n(it?.estimated_price)
    if (!description) continue
    if (!qty || qty <= 0) continue

    const subtotal = estimated_price !== undefined ? qty * estimated_price : ""
    newRows.push([
      "PRI-" + nanoid(8).toUpperCase(),
      pr_id,
      it?.material_id || "",
      description,
      qty,
      unit,
      estimated_price ?? "",
      subtotal ?? "",
      now,
    ])
  }

  const final = [...kept, ...newRows]

  // Clear range A2:I then write back
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${PR_ITEM_SHEET}!A2:I`,
  })

  if (final.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${PR_ITEM_SHEET}!A2:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: final },
    })
  }

  return getItemsByPR(pr_id)
}

// ================= GET DETAIL =================
// GET /api/procurement/pr/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const pr_id = params.id
    const found = await findPRRow(pr_id)
    if (!found) {
      return NextResponse.json({ success: false, data: null, error: "PR not found" }, { status: 404 })
    }

    const pr = mapPRRow(found.row)
    const items = await getItemsByPR(pr_id)

    return NextResponse.json({ success: true, data: { ...pr, items }, error: null })
  } catch (err) {
    console.error("GET PR DETAIL ERROR:", err)
    return NextResponse.json({ success: false, data: null, error: "Failed to fetch PR" }, { status: 500 })
  }
}

// ================= PATCH (ENTERPRISE) =================
// PATCH /api/procurement/pr/:id
// body supports:
// - if_match_version (required)  -> optimistic locking
// - pr_code?, project_id?, requested_by?, request_date?, needed_date?, notes?, status?, updated_by?
// - replace_items?: true + items?: [...]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const pr_id = params.id
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, data: null, error: "Invalid JSON body" }, { status: 400 })
    }

    const found = await findPRRow(pr_id)
    if (!found) {
      return NextResponse.json({ success: false, data: null, error: "PR not found" }, { status: 404 })
    }

    const current = mapPRRow(found.row)

    // optimistic lock
    const ifMatch = n(body.if_match_version)
    if (!ifMatch) {
      return NextResponse.json({ success: false, data: null, error: "if_match_version is required" }, { status: 400 })
    }
    if (ifMatch !== current.version) {
      return NextResponse.json({
        success: false,
        data: null,
        error: `Version conflict. Current=${current.version}, Provided=${ifMatch}`
      }, { status: 409 })
    }

    // lock rule
    if (current.status === "ORDERED") {
      return NextResponse.json({ success: false, data: null, error: "PR already ORDERED (locked)" }, { status: 409 })
    }

    const pr_code = s(body.pr_code, 60)
    const project_id = s(body.project_id, 60)
    const requested_by = s(body.requested_by, 120)
    const notes = s(body.notes, 2000)

    // validate project if changed
    if (project_id && project_id !== current.project_id) {
      const ok = await validateProject(project_id)
      if (!ok) {
        return NextResponse.json({ success: false, data: null, error: "Project not found" }, { status: 400 })
      }
    }

    // unique pr_code if changed
    if (pr_code && norm(pr_code) !== norm(current.pr_code)) {
      const all = await getPRRows()
      const dup = all.some(r => norm(r[1]) === norm(pr_code) && !r[14] && r[0] !== pr_id)
      if (dup) {
        return NextResponse.json({ success: false, data: null, error: "pr_code must be unique" }, { status: 409 })
      }
    }

    // status transition
    let nextStatus: PRStatus = current.status
    if (body.status && allowedStatus.includes(body.status)) {
      if (!isValidTransition(current.status, body.status)) {
        return NextResponse.json({
          success: false,
          data: null,
          error: `Invalid status transition from ${current.status} to ${body.status}`
        }, { status: 400 })
      }
      nextStatus = body.status
    }

    const now = nowISO()
    const nextVersion = current.version + 1

    const updated: PRRow = {
      ...current,
      pr_code: pr_code ?? current.pr_code,
      project_id: project_id ?? current.project_id,
      requested_by: requested_by ?? current.requested_by,
      request_date: body.request_date ?? current.request_date,
      needed_date: body.needed_date ?? current.needed_date,
      status: nextStatus,
      notes: notes ?? current.notes,
      updated_by: body.updated_by || "SYSTEM",
      updated_at: now,
      version: nextVersion,
    }

    // Update row B:O (kolom 2..15) -> range B..O
    // A=pr_id fixed
    const rowNumber = found.rowNumber
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${PR_SHEET}!B${rowNumber}:O${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          updated.pr_code,
          updated.project_id,
          updated.requested_by,
          updated.request_date,
          updated.needed_date || "",
          updated.status,
          updated.notes || "",
          updated.created_by || "",
          updated.updated_by || "",
          updated.deleted_by || "",
          updated.created_at || "",
          updated.updated_at || "",
          updated.version,
          updated.deleted_at || "",
        ]]
      }
    })

    let items = await getItemsByPR(pr_id)

    if (body.replace_items === true) {
      const itemsIn = Array.isArray(body.items) ? body.items : []
      items = await replaceItems(pr_id, itemsIn)
    }

    return NextResponse.json({ success: true, data: { ...updated, items }, error: null })
  } catch (err) {
    console.error("PATCH PR ERROR:", err)
    return NextResponse.json({ success: false, data: null, error: "Failed to update PR" }, { status: 500 })
  }
}

// ================= DELETE (SOFT) =================
// DELETE /api/procurement/pr/:id?deleted_by=NAME
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const pr_id = params.id
    const { searchParams } = new URL(req.url)
    const deleted_by = searchParams.get("deleted_by") || "SYSTEM"

    const found = await findPRRow(pr_id)
    if (!found) {
      return NextResponse.json({ success: false, data: null, error: "PR not found" }, { status: 404 })
    }

    const current = mapPRRow(found.row)
    const now = nowISO()
    const nextVersion = current.version + 1

    const rowNumber = found.rowNumber

    // Update deleted_at + deleted_by + updated_at + version
    // Column K = deleted_by, M = updated_at, N = version, O = deleted_at
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${PR_SHEET}!K${rowNumber}:O${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          deleted_by,
          current.created_at || "",
          now,
          nextVersion,
          now,
        ]]
      }
    })

    return NextResponse.json({
      success: true,
      data: { deleted: true, pr_id, deleted_at: now, deleted_by, version: nextVersion },
      error: null,
    })
  } catch (err) {
    console.error("DELETE PR ERROR:", err)
    return NextResponse.json({ success: false, data: null, error: "Failed to delete PR" }, { status: 500 })
  }
}
