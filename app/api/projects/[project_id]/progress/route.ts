// app/api/projects/[project_id]/progress/route.ts
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
const SHEET_NAME = "PROJECT_SCOPE_PROGRESS"

/* ==============================
   GET : SCOPE PROGRESS (MEP/CIVIL/STEEL/INTERIOR)
================================ */
export async function GET(
  _req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:F`,
    })

    const rows = res.data.values || []

    const row = rows.find((r) => r[0] === params.project_id)

    // kalau belum ada datanya, balikkan default 0 biar UI tetap jalan
    if (!row) {
      return NextResponse.json({
        project_id: params.project_id,
        mep: 0,
        civil: 0,
        steel: 0,
        interior: 0,
        updated_at: null,
      })
    }

    const [_, mep, civil, steel, interior, updated_at] = row

    return NextResponse.json({
      project_id: params.project_id,
      mep: Number(mep || 0),
      civil: Number(civil || 0),
      steel: Number(steel || 0),
      interior: Number(interior || 0),
      updated_at: updated_at || null,
    })
  } catch (error) {
    console.error("GET PROJECT SCOPE PROGRESS ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil progress project" },
      { status: 500 }
    )
  }
}
