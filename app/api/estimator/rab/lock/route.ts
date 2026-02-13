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

export async function POST(req: Request) {
  const { project_id } = await req.json()

  if (!project_id) {
    return NextResponse.json(
      { message: "project_id wajib" },
      { status: 400 }
    )
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_PROJECT}!A2:G`,
  })

  const rows = res.data.values || []
  const idx = rows.findIndex(r => r[1] === project_id)

  if (idx === -1) {
    return NextResponse.json(
      { message: "RAB tidak ditemukan" },
      { status: 404 }
    )
  }

  const row = idx + 2

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${RAB_PROJECT}!G${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [["locked"]],
    },
  })

  return NextResponse.json({
    message: "RAB berhasil di-lock",
  })
}
