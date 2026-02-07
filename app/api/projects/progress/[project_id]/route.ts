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
const PROGRESS_SHEET = "PROJECT_SCOPE_PROGRESS"

/* ==============================
   PATCH : UPDATE PROJECT PROGRESS
================================ */
export async function PATCH(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const project_id = params.project_id
    if (!project_id) {
      return NextResponse.json(
        { message: "project_id tidak valid" },
        { status: 400 }
      )
    }

    const body = await req.json()

    /* ==============================
       SAFE VALUE & CLAMP
    ================================ */
    const clamp = (v: any) =>
      Math.min(100, Math.max(0, Number(v || 0)))

    const mep = clamp(body.mep)
    const civil = clamp(body.civil)
    const steel = clamp(body.steel)
    const interior = clamp(body.interior)

    /* ==============================
       LOAD PROGRESS SHEET
    ================================ */
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PROGRESS_SHEET}!A:F`,
    })

    // ⚠️ POTONG HEADER BIAR INDEX AMAN
    const rows = res.data.values?.slice(1) || []

    const rowIndex = rows.findIndex(
      (r) => r[0] === project_id
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Progress project tidak ditemukan" },
        { status: 404 }
      )
    }

    // +2 karena:
    // +1 header
    // +1 index array (0-based)
    const sheetRow = rowIndex + 2

    /* ==============================
       UPDATE PROGRESS
    ================================ */
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${PROGRESS_SHEET}!B${sheetRow}:F${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          mep,
          civil,
          steel,
          interior,
          new Date().toISOString(),
        ]],
      },
    })

    return NextResponse.json({
      message: "Progress berhasil diupdate",
      project_id,
      progress: { mep, civil, steel, interior },
    })
  } catch (error) {
    console.error("UPDATE PROGRESS ERROR:", error)
    return NextResponse.json(
      { message: "Gagal update progress" },
      { status: 500 }
    )
  }
}
