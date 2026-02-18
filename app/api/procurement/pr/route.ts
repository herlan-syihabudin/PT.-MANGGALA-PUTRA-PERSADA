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
const PR_SHEET = "PURCHASE_REQUEST"
const PR_ITEM_SHEET = "PR_ITEMS"
const PROJECT_SHEET = "PROJECTS"

// ================= TYPES =================

type PRStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "ORDERED"

type PR = {
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
}

// ================= HELPERS =================

function sanitize(str: any): string | undefined {
  if (!str) return undefined
  return String(str).trim()
}

function normalize(str: any): string {
  return String(str || "").trim().toLowerCase()
}

const allowedStatus: PRStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "ORDERED",
]

async function validateProject(project_id: string): Promise<boolean> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PROJECT_SHEET}!A2:A`,
  })
  const projects = (res.data.values || []).map(r => r[0])
  return projects.includes(project_id)
}

// ================= GET =================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const project_id = searchParams.get("project_id")
    const includeDeleted = searchParams.get("include_deleted") === "true"

    const prRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PR_SHEET}!A2:O`,
    })

    let prRows = prRes.data.values || []

    if (!includeDeleted) {
      prRows = prRows.filter(r => !r[14])
    }

    const prs: PR[] = prRows.map(r => ({
      pr_id: r[0] || "",
      pr_code: r[1] || "",
      project_id: r[2] || "",
      requested_by: r[3] || "",
      request_date: r[4] || "",
      needed_date: r[5] || undefined,
      status: allowedStatus.includes(r[6]) ? r[6] : "DRAFT",
      notes: r[7] || undefined,
      created_by: r[8] || undefined,
      updated_by: r[9] || undefined,
      deleted_by: r[10] || undefined,
      created_at: r[11] || "",
      updated_at: r[12] || "",
      deleted_at: r[14] || null,
    }))

    let filtered = prs

    if (allowedStatus.includes(status as PRStatus)) {
      filtered = filtered.filter(p => p.status === status)
    }

    if (project_id) {
      filtered = filtered.filter(p => p.project_id === project_id)
    }

    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )

    // Fetch items
    const itemRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PR_ITEM_SHEET}!A2:I`,
    })

    const itemRows = itemRes.data.values || []

    const itemsByPR = itemRows.reduce((acc, r) => {
      const pr_id = r[1]
      if (!acc[pr_id]) acc[pr_id] = []

      acc[pr_id].push({
        pr_item_id: r[0] || "",
        pr_id,
        material_id: r[2] || undefined,
        description: r[3] || "",
        qty: Number(r[4] || 0),
        unit: r[5] || "",
        estimated_price: r[6] ? Number(r[6]) : undefined,
        subtotal: r[7] ? Number(r[7]) : undefined,
      })

      return acc
    }, {} as Record<string, PRItem[]>)

    const result = filtered.map(pr => ({
      ...pr,
      items: itemsByPR[pr.pr_id] || [],
    }))

    return NextResponse.json({
      success: true,
      data: result,
      error: null,
    })

  } catch (error) {
    console.error("GET PR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to fetch PR",
    }, { status: 500 })
  }
}

// ================= CREATE =================

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const pr_code = sanitize(body.pr_code)
    const project_id = sanitize(body.project_id)
    const requested_by = sanitize(body.requested_by)

    if (!pr_code)
      return NextResponse.json({ success: false, data: null, error: "pr_code is required" }, { status: 400 })

    if (!project_id)
      return NextResponse.json({ success: false, data: null, error: "project_id is required" }, { status: 400 })

    if (!requested_by)
      return NextResponse.json({ success: false, data: null, error: "requested_by is required" }, { status: 400 })

    const projectExists = await validateProject(project_id)
    if (!projectExists)
      return NextResponse.json({ success: false, data: null, error: "Project not found" }, { status: 400 })

    // Duplicate check (soft delete aware)
    const checkRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PR_SHEET}!A2:O`,
    })

    const rows = checkRes.data.values || []
    const exists = rows.some(
      r => normalize(r[1]) === normalize(pr_code) && !r[14]
    )

    if (exists)
      return NextResponse.json({ success: false, data: null, error: "pr_code must be unique" }, { status: 400 })

    const status: PRStatus = allowedStatus.includes(body.status)
      ? body.status
      : "DRAFT"

    const pr_id = "PR-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

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
          body.notes || "",
          body.created_by || "SYSTEM",
          body.created_by || "SYSTEM",
          "",
          now,
          now,
          "",
          "",
        ]],
      },
    })

    const items = body.items || []
    const createdItems: PRItem[] = []

    for (const item of items) {
      const description = sanitize(item.description)
      if (!description) continue

      const qty = Number(item.qty)
      const estimated_price = Number(item.estimated_price || 0)

      if (isNaN(qty) || qty <= 0) continue
      if (isNaN(estimated_price) || estimated_price < 0) continue

      const subtotal = qty * estimated_price
      const pr_item_id = "PRI-" + nanoid(8).toUpperCase()

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${PR_ITEM_SHEET}!A:I`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            pr_item_id,
            pr_id,
            item.material_id || "",
            description,
            qty,
            item.unit || "",
            estimated_price || "",
            subtotal,
            now,
          ]],
        },
      })

      createdItems.push({
        pr_item_id,
        pr_id,
        material_id: item.material_id,
        description,
        qty,
        unit: item.unit || "",
        estimated_price,
        subtotal,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        pr_id,
        pr_code,
        project_id,
        requested_by,
        request_date: body.request_date || now,
        needed_date: body.needed_date,
        status,
        notes: body.notes,
        created_by: body.created_by || "SYSTEM",
        updated_by: body.created_by || "SYSTEM",
        created_at: now,
        updated_at: now,
        items: createdItems,
      },
      error: null,
    }, { status: 201 })

  } catch (error) {
    console.error("CREATE PR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to create PR",
    }, { status: 500 })
  }
}
