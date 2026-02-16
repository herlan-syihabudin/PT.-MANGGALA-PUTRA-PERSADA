import { NextResponse } from "next/server"
import { google } from "googleapis"

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
  const itemRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${RAB_ITEM}'!A2:P`,
  })
  const rows = itemRes.data.values || []
  const items = rows.filter((r) => r[1] === rab_id)
  const total_items = items.length
  const total_value = items.reduce((s, r) => s + n(r[11]), 0)

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
    range: `'${RAB_PROJECT}'!F${row}:G${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[total_items, total_value]] },
  })

  return { total_items, total_value }
}

export async function POST(req: Request) {
  try {
    const { rab_id, item_id, patch } = await req.json()

    if (!rab_id) return NextResponse.json({ message: "rab_id wajib" }, { status: 400 })
    if (!item_id) return NextResponse.json({ message: "item_id wajib" }, { status: 400 })
    if (!patch || typeof patch !== "object") {
      return NextResponse.json({ message: "patch wajib object" }, { status: 400 })
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'${RAB_ITEM}'!A2:P`,
    })
    const rows = res.data.values || []
    const idx = rows.findIndex((r) => r[0] === item_id)
    if (idx === -1) return NextResponse.json({ message: "Item tidak ditemukan" }, { status: 404 })

    const rowNumber = idx + 2
    const row = rows[idx]

    // mapping columns
    let scope = patch.scope ?? row[3]
    let item_name = patch.item_name ?? row[4]
    let category = patch.category ?? row[5]
    let qty = patch.qty ?? row[6]
    let unit = patch.unit ?? row[7]
    let material_price = patch.material_price ?? row[8]
    let labour_price = patch.labour_price ?? row[9]

    qty = n(qty)
    material_price = n(material_price)
    labour_price = n(labour_price)

    if (qty < 0 || material_price < 0 || labour_price < 0) {
      return NextResponse.json({ message: "angka tidak boleh negatif" }, { status: 400 })
    }

    const unit_price = material_price + labour_price
    const total_price = qty * unit_price
    const updated_at = new Date().toISOString()

    // update D..P (scope..updated_at) biar sekali tembak
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `'${RAB_ITEM}'!D${rowNumber}:P${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          scope,
          item_name,
          category,
          qty,
          unit,
          material_price,
          labour_price,
          unit_price,
          total_price,
          row[12] || "Draft",
          row[13] || "",
          row[14] || "",
          updated_at,
        ]],
      },
    })

    const summary = await recalcHeader(rab_id)

    return NextResponse.json({
      message: "Item updated",
      summary,
    })
  } catch (e) {
    console.error("UPDATE ITEM ERROR:", e)
    return NextResponse.json({ message: "Gagal update item" }, { status: 500 })
  }
}
