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
const SHEET_ID = process.env.GSHEET_CRM_ID!

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!A2:Q`,
    })

    const rows = res.data.values || []

    // hanya ambil yang status = new
    const pending = rows
      .filter(row => row[8] === "new")
      .map(row => ({
        inquiry_id: row[0],
        tanggal_masuk: row[1],
        customer_name: row[3],
        nama_pekerjaan: row[4],
        layanan: row[5],
        estimasi_nilai: row[6],
      }))

    return NextResponse.json(pending)

  } catch (err) {
    console.error("Pending Inquiry Error:", err)
    return NextResponse.json([], { status: 500 })
  }
}
