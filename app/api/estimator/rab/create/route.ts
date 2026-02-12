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

const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!
const RAB_PROJECT = "RAB_PROJECT"

export async function POST(req: Request) {
  try {
    const { project_id, created_by } = await req.json()

    if (!project_id) {
      return NextResponse.json({ message: "project_id wajib" }, { status: 400 })
    }

    // 🔍 CEK APAKAH SUDAH ADA RAB UNTUK PROJECT INI
    const checkRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:B`,
    })

    const rows = checkRes.data.values || []

    const existing = rows.find(r => r[1] === project_id)

    if (existing) {
      return NextResponse.json({
        message: "RAB sudah ada untuk project ini",
        rab_id: existing[0],
        project_id
      })
    }

    // ✅ BUAT BARU
    const rab_id = `RAB-${Date.now()}`
    const created_at = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rab_id,
          project_id,
          0,
          0,
          "Draft",
          created_by || "Estimator",
          created_at,
        ]],
      },
    })

    return NextResponse.json({ rab_id, project_id })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: "Gagal create RAB" }, { status: 500 })
  }
}
