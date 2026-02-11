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

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!A2:Q`,
    })

    const rows = res.data.values || []

    const count = rows.filter(
      (row) => (row[8] || "").toLowerCase() === "new"
    ).length

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Count Error:", error)
    return NextResponse.json({ count: 0 })
  }
}
