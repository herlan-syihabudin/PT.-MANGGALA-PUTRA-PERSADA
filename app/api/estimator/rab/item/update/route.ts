import { NextResponse } from "next/server"
import { google } from "googleapis"

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!
const SHEET_NAME = "RAB_ITEM"

export async function POST(req: Request) {
  try {
    const { item_id, field, value } = await req.json()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'${SHEET_NAME}'!A2:P1000`,
    })

    const rows = res.data.values || []
    const index = rows.findIndex((r) => r[0] === item_id)

    if (index === -1) {
      return NextResponse.json({ message: "Item tidak ditemukan" }, { status: 404 })
    }

    const rowNumber = index + 2

    const columnMap: Record<string, string> = {
      scope: "D",
      item_name: "E",
      qty: "G",
      unit: "H",
    }

    const column = columnMap[field]

    if (!column) {
      return NextResponse.json({ message: "Field tidak valid" }, { status: 400 })
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `'${SHEET_NAME}'!${column}${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[value]] },
    })

    return NextResponse.json({ message: "Updated" })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Error" }, { status: 500 })
  }
}
