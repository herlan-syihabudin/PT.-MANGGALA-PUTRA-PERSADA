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

const SHEET_ID = process.env.GSHEET_PROJECT_ID!
const PROGRESS_SHEET = "PROJECT_SCOPE_PROGRESS"

export async function PATCH(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const body = await req.json()
    const { mep, civil, steel, interior } = body

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PROGRESS_SHEET}!A:F`,
    })

    const rows = res.data.values || []
    const rowIndex = rows.findIndex(
      (r) => r[0] === params.project_id
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Progress project tidak ditemukan" },
        { status: 404 }
      )
    }

    const sheetRow = rowIndex + 1 // + header

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

    return NextResponse.json({ message: "Progress berhasil diupdate" })
  } catch (error) {
    console.error("UPDATE PROGRESS ERROR:", error)
    return NextResponse.json(
      { message: "Gagal update progress" },
      { status: 500 }
    )
  }
}
