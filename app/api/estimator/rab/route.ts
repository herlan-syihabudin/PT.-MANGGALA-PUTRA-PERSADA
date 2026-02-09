import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ==============================
   GOOGLE AUTH
================================ */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!
const RAB_SHEET = "RAB PROJECT"

/* ==============================
   GET : RAB BY PROJECT
================================ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const project_id = searchParams.get("project_id")

    if (!project_id) {
      return NextResponse.json(
        { message: "project_id wajib diisi" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_SHEET}!A2:L`,
    })

    const rows = res.data.values || []

    const rabItems = rows
      .filter((r) => r[1] === project_id)
      .map((r) => ({
        rab_id: r[0],
        project_id: r[1],
        scope: r[2],
        item_name: r[3],
        category: r[4],
        volume: Number(r[5] || 0),
        unit: r[6],
        unit_price: Number(r[7] || 0),
        total_price: Number(r[8] || 0),
        status: r[9] || "Draft",
        created_by: r[10],
        created_at: r[11],
      }))

    const summary = {
      total_items: rabItems.length,
      total_value: rabItems.reduce((s, i) => s + i.total_price, 0),
    }

    return NextResponse.json({
      project_id,
      summary,
      items: rabItems,
    })
  } catch (error) {
    console.error("GET RAB ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data RAB" },
      { status: 500 }
    )
  }
}
