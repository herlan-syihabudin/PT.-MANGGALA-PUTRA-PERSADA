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
const SHEET_ID = process.env.GOOGLE_SHEET_ID
const SHEET_NAME = "PROJECT MASTER"

export async function POST(req: Request) {
  const body = await req.json()

  const {
    project_name,
    client,
    lokasi,
    nilai_kontrak,
    start_date,
    end_date,
    status,
  } = body

  if (!project_name || !client || !nilai_kontrak || !start_date || !status) {
    return NextResponse.json({ message: "Field wajib belum lengkap" }, { status: 400 })
  }

  const project_id = `PRJ-${Date.now()}`
  const created_at = new Date().toISOString()

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:I`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        project_id,
        project_name,
        client,
        lokasi,
        nilai_kontrak,
        start_date,
        end_date,
        status,
        created_at,
      ]],
    },
  })

  return NextResponse.json({ project_id }, { status: 201 })
}
