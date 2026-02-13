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

export async function POST(req: Request) {
  const { row } = await req.json()

  if (!row) {
    return NextResponse.json(
      { message: "row wajib" },
      { status: 400 }
    )
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!L${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [["Draft"]],
    },
  })

  return NextResponse.json({
    message: "Item berhasil direstore",
  })
}
