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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rab_id = searchParams.get("rab_id") || ""
    if (!rab_id) return NextResponse.json({ message: "rab_id wajib" }, { status: 400 })

    // ===== header =====
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'${RAB_PROJECT}'!A2:K`,
    })
    const headerRows = headerRes.data.values || []
    const headerRow = headerRows.find((r) => r[0] === rab_id) || null

    const project_id = headerRow?.[2] || ""

    // ===== items =====
    const itemRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'${RAB_ITEM}'!A2:P`,
    })
    const rows = itemRes.data.values || []

    const items = rows
      .filter((r) => r[1] === rab_id) // B = rab_id
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

    const total_value = items.reduce((s, i) => s + n(i.total_price), 0)

    return NextResponse.json({
      rab_id,
      project_id: project_id || items?.[0]?.project_id || "",
      header: headerRow,
      summary: { total_items: items.length, total_value },
      items,
    })
  } catch (e) {
    console.error("GET RAB ERROR:", e)
    return NextResponse.json({ message: "Gagal fetch RAB" }, { status: 500 })
  }
}
