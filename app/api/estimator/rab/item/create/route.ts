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

async function recalcHeader(rab_id: string) {
  // read all items then sum (anti selisih)
  const itemRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${RAB_ITEM}'!A2:P`,
  })
  const rows = itemRes.data.values || []
  const items = rows.filter((r) => r[1] === rab_id)

  const total_items = items.length
  const total_value = items.reduce((s, r) => s + n(r[11]), 0) // L = total_price (index 11)

  // find header row
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${RAB_PROJECT}'!A2:K`,
  })
  const headerRows = headerRes.data.values || []
  const idx = headerRows.findIndex((r) => r[0] === rab_id)
  if (idx === -1) return { total_items, total_value }

  const row = idx + 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'${RAB_PROJECT}'!F${row}:G${row}`, // F total_item, G total_nilai_rab
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[total_items, total_value]] },
  })

  return { total_items, total_value }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const rab_id = String(body.rab_id || "")
    const project_id = String(body.project_id || "")
    const scope = String(body.scope || "")
    const item_name = String(body.item_name || "")
    const category = String(body.category || "")
    const qty = n(body.qty)
    const unit = String(body.unit || "")
    const material_price = n(body.material_price)
    const labour_price = n(body.labour_price)
    const created_by = String(body.created_by || "System")

    if (!rab_id) return NextResponse.json({ message: "rab_id wajib" }, { status: 400 })
    if (!project_id) return NextResponse.json({ message: "project_id wajib" }, { status: 400 })
    if (!item_name.trim()) return NextResponse.json({ message: "item_name wajib" }, { status: 400 })
    if (qty < 0 || material_price < 0 || labour_price < 0) {
      return NextResponse.json({ message: "angka tidak boleh negatif" }, { status: 400 })
    }

    const item_id = "ITEM-" + nanoid(8).toUpperCase()
    const created_at = new Date().toISOString()
    const updated_at = created_at

    const unit_price = material_price + labour_price
    const total_price = qty * unit_price

    // ✅ 16 kolom => A:P
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `'${RAB_ITEM}'!A:P`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          item_id,        // A
          rab_id,         // B
          project_id,     // C
          scope,          // D
          item_name,      // E
          category,       // F
          qty,            // G
          unit,           // H
          material_price, // I
          labour_price,   // J
          unit_price,     // K
          total_price,    // L
          "Draft",        // M
          created_by,     // N
          created_at,     // O
          updated_at,     // P
        ]],
      },
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
        created_at,
        updated_at,
      },
      summary,
    })
  } catch (e) {
    console.error("CREATE RAB ITEM ERROR:", e)
    return NextResponse.json({ message: "Gagal tambah item" }, { status: 500 })
  }
}
