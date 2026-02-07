import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ==============================
   GOOGLE AUTH
================================ */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

const SHEET_ID = process.env.GSHEET_PROJECT_ID!
const SHEET_NAME = "PROJECT MASTER"

/* ==============================
   GET : PROJECT DETAIL
================================ */
export async function GET(
  _: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:I`,
    })

    const rows = res.data.values || []

    const row = rows.find((r) => r[0] === params.project_id)

    if (!row) {
      return NextResponse.json(
        { message: "Project tidak ditemukan" },
        { status: 404 }
      )
    }

    const project = {
      project_id: row[0],
      project_name: row[1],
      client: row[2],
      lokasi: row[3],
      nilai_kontrak: Number(row[4] || 0),
      start_date: row[5],
      end_date: row[6],
      status: row[7],
      created_at: row[8],
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("GET PROJECT DETAIL ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil detail project" },
      { status: 500 }
    )
  }
}
