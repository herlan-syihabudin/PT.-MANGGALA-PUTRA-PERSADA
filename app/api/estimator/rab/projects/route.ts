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
      range: `${RAB_PROJECT}!A2:H`,
    })

    const rows = res.data.values || []

    const data = rows
      .filter(r => r[0]) // minimal harus ada rab_id
      .map((r) => {
        const totalMaterial = Number(r[4] || 0)
        const totalJasa = Number(r[5] || 0)

        return {
          rab_id: r[0],
          inquiry_id: r[1],
          project_name: r[2],
          customer_name: r[3],
          total_items: 0, // nanti kita hitung dari RAB_ITEM
          total_value: totalMaterial + totalJasa,
          status: r[6] || "Draft",
        }
      })
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
