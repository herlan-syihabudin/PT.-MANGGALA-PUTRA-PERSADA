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
    const { rab_id, project_id, created_by, items } = await req.json()
    if (!rab_id) return NextResponse.json({ message: "rab_id wajib" }, { status: 400 })
    if (!project_id) return NextResponse.json({ message: "project_id wajib" }, { status: 400 })
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "items wajib array" }, { status: 400 })
    }

    const now = new Date().toISOString()
    const by = String(created_by || "System")

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
      return NextResponse.json({ message: "Tidak ada item valid" }, { status: 400 })
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `'${RAB_ITEM}'!A:P`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    })

    const summary = await recalcHeader(rab_id)

    return NextResponse.json({ message: "Bulk create sukses", inserted: values.length, summary })
  } catch (e) {
    console.error("BULK CREATE ERROR:", e)
    return NextResponse.json({ message: "Gagal bulk create" }, { status: 500 })
  }
}
