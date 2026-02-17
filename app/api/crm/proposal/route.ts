import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const PROPOSAL_SHEET = "PROPOSAL"

function getSheets() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  return google.sheets({ version: "v4", auth })
}

export async function GET() {
  try {
    const sheets = getSheets()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GSHEET_CRM_ID,
      range: `${PROPOSAL_SHEET}!A2:F2000`,
    })

    const rows = res.data.values || []

    const data = rows.map((r) => ({
      proposal_id: r[0],
      pipeline_id: r[1],
      rab_id: r[2],
      total_value: Number(r[3] || 0),
      status: r[4],
      created_at: r[5],
    }))

    return NextResponse.json(data)
  } catch (e) {
    console.error("GET PROPOSAL ERROR:", e)
    return NextResponse.json(
      { message: "Gagal ambil proposal" },
      { status: 500 }
    )
  }
}
