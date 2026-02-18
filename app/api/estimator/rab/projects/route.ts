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

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:K`,
    })

    const rows = res.data.values || []

    const data = rows
      .filter(r => r[0]) // minimal harus ada rab_id
      .map((r) => ({
  rab_id: r[0],
  inquiry_id: r[1],
  project_id: r[2],
  project_name: r[3],
  customer_name: r[4],
  total_items: Number(r[5] || 0),
  total_value: Number(r[6] || 0),
  status: r[7] || "Draft",
  created_by: r[8] || "",
  created_at: r[9] || "",
}))
      .sort((a, b) => b.rab_id.localeCompare(a.rab_id))

    return NextResponse.json(data)

  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { message: "Gagal load RAB" },
      { status: 500 }
    )
  }
}
