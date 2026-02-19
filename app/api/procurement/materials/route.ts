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
const MATERIAL_SHEET = "MATERIAL_MASTER"

type MaterialStatus = "ACTIVE" | "INACTIVE"

type Material = {
  material_id: string
  material_code: string
  material_name: string
  category?: string
  unit: string
  default_price?: number
  last_price?: number
  min_stock?: number
  location?: string
  status: MaterialStatus
  created_by?: string
  updated_by?: string
  deleted_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// ================= HELPERS =================

function n(v: any) {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

function normalize(str: any): string {
  return String(str || "").trim().toLowerCase()
}

function sanitize(str: any): string | undefined {
  if (!str) return undefined
  return String(str).trim()
}

// ================= GET =================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const includeDeleted = searchParams.get("include_deleted") === "true"

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!A2:Q`,
    })

    let rows = res.data.values || []

    if (!includeDeleted) {
      rows = rows.filter(r => !r[16])
    }

    let materials: Material[] = rows.map(r => ({
      material_id: r[0] || "",
      material_code: r[1] || "",
      material_name: r[2] || "",
      category: r[3] || undefined,
      unit: r[4] || "",
      default_price: n(r[5]),
      last_price: n(r[6]),
      min_stock: n(r[7]),
      location: r[8] || undefined,
      status: r[9] === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      created_by: r[10] || undefined,
      updated_by: r[11] || undefined,
      deleted_by: r[12] || undefined,
      created_at: r[13] || "",
      updated_at: r[14] || "",
      deleted_at: r[15] || null,
    }))

    if (status === "ACTIVE" || status === "INACTIVE") {
      materials = materials.filter(m => m.status === status)
    }

    if (search) {
      const s = search.toLowerCase()
      materials = materials.filter(m =>
        m.material_name?.toLowerCase().includes(s) ||
        m.material_code?.toLowerCase().includes(s)
      )
    }

    materials.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      data: materials,
      error: null,
    })

  } catch (err) {
    console.error("GET MATERIAL ERROR:", err)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to fetch materials",
    }, { status: 500 })
  }
}

// ================= CREATE =================

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const material_code = sanitize(body.material_code)
    const material_name = sanitize(body.material_name)
    const unit = sanitize(body.unit)

    if (!material_code)
      return NextResponse.json({ success: false, error: "material_code is required" }, { status: 400 })

    if (!material_name)
      return NextResponse.json({ success: false, error: "material_name is required" }, { status: 400 })

    if (!unit)
      return NextResponse.json({ success: false, error: "unit is required" }, { status: 400 })

    const checkRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!A2:B`,
    })

    const rows = checkRes.data.values || []

    const exists = rows.some(r =>
      normalize(r[1]) === normalize(material_code) && !r[15]
    )

    if (exists)
      return NextResponse.json({ success: false, error: "material_code must be unique" }, { status: 400 })

    const material_id = "MAT-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    const newMaterial: Material = {
      material_id,
      material_code,
      material_name,
      category: sanitize(body.category),
      unit,
      default_price: n(body.default_price),
      last_price: n(body.default_price),
      min_stock: n(body.min_stock),
      location: sanitize(body.location),
      status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      created_by: body.created_by || "SYSTEM",
      updated_by: body.created_by || "SYSTEM",
      created_at: now,
      updated_at: now,
      deleted_at: null,
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!A:Q`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          newMaterial.material_id,
          newMaterial.material_code,
          newMaterial.material_name,
          newMaterial.category || "",
          newMaterial.unit,
          newMaterial.default_price || 0,
          newMaterial.last_price || 0,
          newMaterial.min_stock || 0,
          newMaterial.location || "",
          newMaterial.status,
          newMaterial.created_by,
          newMaterial.updated_by,
          "",
          now,
          now,
          "",
        ]]
      }
    })

    return NextResponse.json({
      success: true,
      data: newMaterial,
      error: null,
    }, { status: 201 })

  } catch (err) {
    console.error("CREATE MATERIAL ERROR:", err)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to create material",
    }, { status: 500 })
  }
}
