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
const RAB_ITEM = "RAB_ITEM"

/* ================= GET : RAB DETAIL ================= */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const project_id = searchParams.get("project_id")

  if (!project_id) {
    return NextResponse.json({ message: "project_id wajib" }, { status: 400 })
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!A2:N`,
  })

  const rows = res.data.values || []

  const items = rows
    .filter((r) => r[1] === project_id)
    .map((r) => ({
      rab_id: r[0],
      project_id: r[1],
      scope: r[2],
      item_name: r[3],
      category: r[4],
      volume: Number(r[5]),
      unit: r[6],
      material_price: Number(r[7]),
      labour_price: Number(r[8]),
      unit_price: Number(r[9]),
      total_price: Number(r[10]),
      status: r[11],
      created_by: r[12],
      created_at: r[13],
    }))

  return NextResponse.json({
    project_id,
    summary: {
      total_items: items.length,
      total_value: items.reduce((s, i) => s + i.total_price, 0),
    },
    items,
  })
}

/* ================= POST : ADD ITEM ================= */
export async function POST(req: Request) {
  const body = await req.json()

  const {
    rab_id,
    project_id,
    scope,
    item_name,
    category,
    volume,
    unit,
    material_price,
    labour_price,
    created_by,
  } = body

  const unit_price = Number(material_price) + Number(labour_price)
  const total_price = Number(volume) * unit_price

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!A:N`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        rab_id,
        project_id,
        scope,
        item_name,
        category,
        volume,
        unit,
        material_price,
        labour_price,
        unit_price,
        total_price,
        "Draft",
        created_by || "Estimator",
        new Date().toISOString(),
      ]],
    },
  })

  return NextResponse.json({ message: "Item RAB ditambahkan" })
}
