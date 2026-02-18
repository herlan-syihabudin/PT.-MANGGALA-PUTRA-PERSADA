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

    const pending = rows
  .filter(row => row[0])
  .filter(row => {
    const status = (row[9] || "").toString().toLowerCase()
    return status.includes("estim")
  })
  .filter(row => {
    const rabId = (row[13] || "").toString().trim()
    return rabId === ""
  })
  .map(row => ({
    inquiry_id: row[0],
    tanggal_masuk: row[1],
    customer_name: row[3],
    nama_pekerjaan: row[4],
    layanan: row[5],
    estimasi_nilai: Number(
      String(row[6] || 0).replace(/[^\d]/g, "")
    ),
  }))
      .sort((a, b) => {
  const tA = a.tanggal_masuk ? new Date(a.tanggal_masuk).getTime() : 0
  const tB = b.tanggal_masuk ? new Date(b.tanggal_masuk).getTime() : 0
  return tB - tA
})

    return NextResponse.json(pending)

  } catch (err) {
    console.error("Pending Inquiry Error:", err)
    return NextResponse.json([], { status: 500 })
  }
}
