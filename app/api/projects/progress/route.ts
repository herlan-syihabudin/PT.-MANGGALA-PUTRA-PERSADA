// app/api/projects/progress/route.ts
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
   GET : SCHEDULE & PROGRESS
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

    const projectRows = projectRes.data.values?.slice(1) ?? []
    const progressRows = progressRes.data.values?.slice(1) ?? []

    // peta: project_id -> progress
    const progressMap: Record<
      string,
      {
        mep: number
        civil: number
        steel: number
        interior: number
        updated_at: string | null
      }
    > = {}

    for (const r of progressRows) {
      if (!r[0]) continue
      progressMap[r[0]] = {
        mep: Number(r[1] || 0),
        civil: Number(r[2] || 0),
        steel: Number(r[3] || 0),
        interior: Number(r[4] || 0),
        updated_at: r[5] || null,
      }
    }

    const result = projectRows
      .filter((r) => r[0]) // skip baris kosong
      .map((r) => {
        const project_id = r[0] as string
        const prog =
          progressMap[project_id] || {
            mep: 0,
            civil: 0,
            steel: 0,
            interior: 0,
            updated_at: null,
          }

        // 💡 overall auto % dari 4 scope
        const overall = Math.round(
          (prog.mep + prog.civil + prog.steel + prog.interior) / 4
        )

        return {
          project_id,
          project_name: (r[1] as string) || "",
          start_date: (r[5] as string) || "",
          end_date: (r[6] as string) || "",
          status: (r[7] as string) || "",
          updated_at: prog.updated_at,
          progress: {
            mep: prog.mep,
            civil: prog.civil,
            steel: prog.steel,
            interior: prog.interior,
            overall,
          },
        }
      })

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET PROJECT PROGRESS LIST ERROR:", error)

    // ⛑️ Jangan bikin app crash, balikin array kosong aja
    return NextResponse.json([])
  }
}
