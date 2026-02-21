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
  spesifikasi?: string
  category?: string
  material_type?: string
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
  keterangan?: string
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

    // Sesuaikan range dengan 20 kolom (A sampai T)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!A2:S`,
    })

    let rows = res.data.values || []

    if (!includeDeleted) {
      // Kolom deleted_at ada di index 18 (kolom S)
      rows = rows.filter(r => !r[17])
    }

    let materials: Material[] = rows.map(r => ({
      material_id: r[0] || "",
      material_code: r[1] || "",
      material_name: r[2] || "",
      spesifikasi: r[3] || undefined,
      category: r[4] || undefined,
      material_type: r[5] || undefined,
      unit: r[6] || "",
      default_price: n(r[7]),
      last_price: n(r[8]),
      min_stock: n(r[9]),
      location: r[10] || undefined,
      status: r[11] === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      created_by: r[12] || undefined,
      updated_by: r[13] || undefined,
      deleted_by: r[14] || undefined,
      created_at: r[15] || "",
      updated_at: r[16] || "",
      deleted_at: r[17] || null,
      keterangan: r[18] || undefined,
    }))

    if (status === "ACTIVE" || status === "INACTIVE") {
      materials = materials.filter(m => m.status === status)
    }

    if (search) {
      const s = search.toLowerCase()
      materials = materials.filter(m =>
        m.material_name?.toLowerCase().includes(s) ||
        m.material_code?.toLowerCase().includes(s) ||
        m.spesifikasi?.toLowerCase().includes(s) ||
        m.keterangan?.toLowerCase().includes(s)
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
      range: `${MATERIAL_SHEET}!A:S`,
    })

    const rows = checkRes.data.values || []

    // Cek unique berdasarkan material_code dan tidak terhapus (deleted_at)
    const exists = rows.some(r =>
  normalize(r[1]) === normalize(material_code) &&
  (!r[17] || r[17] === "")
)

    if (exists)
      return NextResponse.json({ success: false, error: "material_code must be unique" }, { status: 400 })

    const material_id = "MAT-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    const newMaterial: Material = {
      material_id,
      material_code,
      material_name,
      spesifikasi: sanitize(body.spesifikasi),
      category: sanitize(body.category),
      material_type: sanitize(body.material_type),
      unit,
      default_price: n(body.default_price),
      last_price: n(body.default_price), // Default sama dengan default_price
      min_stock: n(body.min_stock),
      location: sanitize(body.location),
      status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      created_by: body.created_by || "SYSTEM",
      updated_by: body.created_by || "SYSTEM",
      created_at: now,
      updated_at: now,
      deleted_at: null,
      keterangan: sanitize(body.keterangan),
    }

    // Append dengan 20 kolom
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!A:S`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
  newMaterial.material_id,      // A
  newMaterial.material_code,    // B
  newMaterial.material_name,    // C
  newMaterial.spesifikasi || "",// D
  newMaterial.category || "",   // E
  newMaterial.material_type || "", // F
  newMaterial.unit,             // G
  newMaterial.default_price || 0,// H
  newMaterial.last_price || 0,  // I
  newMaterial.min_stock || 0,   // J
  newMaterial.location || "",   // K
  newMaterial.status,           // L
  newMaterial.created_by,       // M
  newMaterial.updated_by,       // N
  "",                           // O deleted_by
  now,                          // P created_at
  now,                          // Q updated_at
  "",                           // R deleted_at
  newMaterial.keterangan || "", // S keterangan
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
