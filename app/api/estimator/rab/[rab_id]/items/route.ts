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
const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

const RAB_PROJECT = "RAB_PROJECT"
const RAB_ITEM = "RAB_ITEM"

function n(x: any) {
  const v = Number(x)
  return Number.isFinite(v) ? v : 0
}

// ===================== HELPER: Recalculate Header =====================
async function recalcHeader(rab_id: string) {
  const itemRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!A2:P`,
  })
  const rows = itemRes.data.values || []
  const items = rows.filter((r) => r[1] === rab_id)

  const total_items = items.length
  const total_value = items.reduce((s, r) => s + n(r[11]), 0)

  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_PROJECT}!A2:K`,
  })
  const headerRows = headerRes.data.values || []
  const idx = headerRows.findIndex((r) => r[0] === rab_id)
  
  if (idx === -1) return { total_items, total_value }

  const row = idx + 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${RAB_PROJECT}!F${row}:G${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[total_items, total_value]] },
  })

  return { total_items, total_value }
}

// ===================== GET ALL ITEMS =====================
export async function GET(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id

    const itemRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A2:P`,
    })
    const rows = itemRes.data.values || []

    const items = rows
      .filter((r) => r[1] === rab_id)
      .map((r) => ({
        item_id: r[0] || "",
        rab_id: r[1] || "",
        project_id: r[2] || "",
        scope: r[3] || "",
        item_name: r[4] || "",
        category: r[5] || "",
        qty: n(r[6]),
        unit: r[7] || "",
        material_price: n(r[8]),
        labour_price: n(r[9]),
        unit_price: n(r[10]),
        total_price: n(r[11]),
        status: r[12] || "Draft",
        created_by: r[13] || "",
        created_at: r[14] || "",
        updated_at: r[15] || "",
      }))
      .sort((a, b) => a.created_at.localeCompare(b.created_at))

    return NextResponse.json(items)

  } catch (e) {
    console.error("GET ITEMS ERROR:", e)
    return NextResponse.json(
      { message: "Gagal fetch items" },
      { status: 500 }
    )
  }
}

// ===================== CREATE ITEM =====================
export async function POST(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id
    const body = await req.json()

    const {
      project_id,
      scope = "",
      item_name,
      category = "",
      qty = 0,
      unit = "",
      material_price = 0,
      labour_price = 0,
      created_by = "System"
    } = body

    if (!project_id) {
      return NextResponse.json(
        { message: "project_id wajib" },
        { status: 400 }
      )
    }

    if (!item_name?.trim()) {
      return NextResponse.json(
        { message: "item_name wajib" },
        { status: 400 }
      )
    }

    if (qty < 0 || material_price < 0 || labour_price < 0) {
      return NextResponse.json(
        { message: "angka tidak boleh negatif" },
        { status: 400 }
      )
    }

    const item_id = "ITEM-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    const unit_price = material_price + labour_price
    const total_price = qty * unit_price

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A:P`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          item_id,
          rab_id,
          project_id,
          scope,
          item_name,
          category,
          qty,
          unit,
          material_price,
          labour_price,
          unit_price,
          total_price,
          "Draft",
          created_by,
          now,
          now,
        ]]
      }
    })

    const summary = await recalcHeader(rab_id)

    return NextResponse.json({
      message: "Item berhasil dibuat",
      item: {
        item_id,
        rab_id,
        project_id,
        scope,
        item_name,
        category,
        qty,
        unit,
        material_price,
        labour_price,
        unit_price,
        total_price,
        status: "Draft",
        created_by,
        created_at: now,
        updated_at: now,
      },
      summary
    })

  } catch (e) {
    console.error("CREATE ITEM ERROR:", e)
    return NextResponse.json(
      { message: "Gagal tambah item" },
      { status: 500 }
    )
  }
}

// ===================== BULK CREATE ITEMS =====================
export async function PUT(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id
    const { project_id, created_by = "System", items } = await req.json()

    if (!project_id) {
      return NextResponse.json(
        { message: "project_id wajib" },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "items wajib array" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const by = String(created_by)

    const values = items
      .map((it: any) => {
        const scope = String(it.scope || "")
        const item_name = String(it.item_name || "")
        if (!item_name.trim()) return null

        const category = String(it.category || "")
        const qty = n(it.qty)
        const unit = String(it.unit || "")
        const material_price = n(it.material_price)
        const labour_price = n(it.labour_price)

        const unit_price = material_price + labour_price
        const total_price = qty * unit_price

        return [
          "ITEM-" + nanoid(8).toUpperCase(),
          rab_id,
          project_id,
          scope,
          item_name,
          category,
          qty,
          unit,
          material_price,
          labour_price,
          unit_price,
          total_price,
          "Draft",
          by,
          now,
          now,
        ]
      })
      .filter(Boolean)

    if (values.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada item valid" },
        { status: 400 }
      )
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A:P`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    })

    const summary = await recalcHeader(rab_id)

    return NextResponse.json({
      message: "Bulk create sukses",
      inserted: values.length,
      summary
    })

  } catch (e) {
    console.error("BULK CREATE ERROR:", e)
    return NextResponse.json(
      { message: "Gagal bulk create" },
      { status: 500 }
    )
  }
}
