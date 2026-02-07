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

const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CUSTOMER_MASTER"

export async function GET(
  _: Request,
  { params }: { params: { customer_id: string } }
) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:H`,
    })

    const rows = res.data.values || []

    const row = rows.find(r => r[0] === params.customer_id)
    if (!row) {
      return NextResponse.json(null, { status: 404 })
    }

    return NextResponse.json({
      customer_id: row[0],
      company_name: row[1],
      pic_name: row[2],
      phone: row[3],
      email: row[4],
      address: row[5],
      npwp: row[6],
      created_at: row[7],
    })
  } catch (e) {
    return NextResponse.json({ message: "Error" }, { status: 500 })
  }
}
