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
const PROJECT_SHEET = "PROJECT MASTER"
const PROGRESS_SHEET = "PROJECT_SCOPE_PROGRESS"

/* ==============================
   GET : PROJECT + PROGRESS
================================ */
export async function GET() {
  try {
    const [projectRes, progressRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${PROJECT_SHEET}!A:J`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${PROGRESS_SHEET}!A:F`,
      }),
    ])

    const projectRows = projectRes.data.values?.slice(1) || []
    const progressRows = progressRes.data.values?.slice(1) || []

    const progressMap = Object.fromEntries(
      progressRows.map((r) => [
        r[0], // project_id
        {
          mep: Number(r[1] || 0),
          civil: Number(r[2] || 0),
          steel: Number(r[3] || 0),
          interior: Number(r[4] || 0),
          updated_at: r[5],
        },
      ])
    )

    const result = projectRows.map((p) => {
      const progress = progressMap[p[0]] || {
        mep: 0,
        civil: 0,
        steel: 0,
        interior: 0,
      }

      const overall =
        (progress.mep +
          progress.civil +
          progress.steel +
          progress.interior) /
        4

      return {
        project_id: p[0],
        project_name: p[1],
        start_date: p[5],
        end_date: p[6],
        status: p[7],
        progress: {
          mep: progress.mep,
          civil: progress.civil,
          steel: progress.steel,
          interior: progress.interior,
          overall: Math.round(overall),
        },
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET SCHEDULE ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil schedule & progress" },
      { status: 500 }
    )
  }
}
