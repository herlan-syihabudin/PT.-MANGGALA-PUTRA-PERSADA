import { NextResponse } from "next/server"
import { google } from "googleapis"

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_PROJECT_ID!
const PROJECT_SHEET = "PROJECTS"

export async function PATCH(req: Request) {
  const { project_ids, status } = await req.json()

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PROJECT_SHEET}!A:Z`,
  })

  const rows = res.data.values || []

  const updates = rows.map((row, i) => {
    if (project_ids.includes(row[0])) {
      row[8] = status // asumsi kolom STATUS
    }
    return row
  })

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${PROJECT_SHEET}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: updates },
  })

  return NextResponse.json({ success: true })
}
