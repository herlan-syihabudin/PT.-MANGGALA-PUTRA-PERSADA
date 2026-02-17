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

const CRM_SHEET_ID = process.env.GSHEET_CRM_ID!
const SALES_PIPELINE = "SALES_PIPELINE"

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: CRM_SHEET_ID,
      range: `'${SALES_PIPELINE}'!A2:I2000`,
    })

    const rows = res.data.values || []

    const data = rows.map((r) => ({
      pipeline_id: r[0],
      customer_id: r[1],
      project_name: r[2],
      stage: r[3],
      estimated_value: Number(r[4] || 0),
      rab_id: r[5],
      proposal_id: r[6],
      created_at: r[7],
      updated_at: r[8],
    }))

    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: "Error" }, { status: 500 })
  }
}
