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
      range: `${RAB_PROJECT}!A2:G`,
    })

    const rows = res.data.values || []

    const data = rows.map((r) => ({
      rab_id: r[0],
      project_id: r[1],
      total_items: Number(r[2] || 0),
      total_value: Number(r[3] || 0),
      status: r[4] || "Draft",
      created_by: r[5],
      created_at: r[6],
      project_name: r[1], // sementara (nanti join project)
    }))

    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: "Gagal load RAB" }, { status: 500 })
  }
}
