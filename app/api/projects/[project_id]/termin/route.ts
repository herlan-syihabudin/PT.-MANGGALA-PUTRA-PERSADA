// app/api/projects/[project_id]/termin/route.ts
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
const SHEET_NAME = "PROJECT_TERMIN"

/* ==============================
   GET : TERMIN KONTRAK
================================ */
export async function GET(
  _req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:H`,
    })

    const rows = res.data.values || []

    const termins = rows
      .filter((r) => r[0] === params.project_id)
      .map((r) => ({
        project_id: r[0],
        termin_no: Number(r[1] || 0),
        description: r[2] || "",
        percent: Number(r[3] || 0),
        value: Number(r[4] || 0),
        status: r[5] || "Planned",
        due_date: r[6] || "",
        paid_date: r[7] || "",
      }))
      // urutkan berdasarkan termin_no
      .sort((a, b) => a.termin_no - b.termin_no)

    return NextResponse.json(termins)
  } catch (error) {
    console.error("GET PROJECT TERMIN ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data termin" },
      { status: 500 }
    )
  }
}
