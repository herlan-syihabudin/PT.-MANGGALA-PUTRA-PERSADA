// app/api/projects/[project_id]/logs/route.ts
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
const SHEET_NAME = "PROJECT_LOG"

/* ==============================
   GET : ACTIVITY LOG
================================ */
export async function GET(
  _req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:G`,
    })

    const rows = res.data.values || []

    const logs = rows
      .filter((r) => r[0] === params.project_id)
      .map((r) => ({
        project_id: r[0],
        log_date: r[1] || "",
        category: r[2] || "",
        activity: r[3] || "",
        created_by: r[4] || "",
        created_at: r[5] || "",
        note: r[6] || "",
      }))
      // sort terbaru di atas (kalau log_date ada)
      .sort((a, b) => (a.log_date < b.log_date ? 1 : -1))

    return NextResponse.json(logs)
  } catch (error) {
    console.error("GET PROJECT LOG ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil activity log" },
      { status: 500 }
    )
  }
}
