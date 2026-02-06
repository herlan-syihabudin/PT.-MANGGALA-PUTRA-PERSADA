import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

const SHEET_NAME = "EMPLOYEE_STATUS"

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

/* ================= GET ================= */
// ?employee_id=MPP-ENG-2026-001
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")

    if (!employee_id)
      return NextResponse.json({ error: "employee_id required" }, { status: 400 })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: SHEET_NAME,
    })

    const [headers, ...rows] = res.data.values || []

    const data = rows
      .filter(r => r[0] === employee_id)
      .map(r =>
        headers.reduce((obj, h, i) => {
          obj[h] = r[i] || ""
          return obj
        }, {} as any)
      )

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed get status" }, { status: 500 })
  }
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      employee_id,
      status,
      jenis_status,
      lokasi_kerja,
      start_date,
      updated_by,
      keterangan,
    } = body

    if (!employee_id || !status || !jenis_status || !start_date)
      return NextResponse.json({ error: "Field wajib belum lengkap" }, { status: 400 })

    // ambil data lama
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: SHEET_NAME,
    })

    const values = res.data.values || []

    // tutup status lama
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === employee_id && values[i][6] === "TRUE") {
        values[i][5] = new Date().toISOString().slice(0, 10)
        values[i][6] = "FALSE"
      }
    }

    // overwrite update lama
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: SHEET_NAME,
      valueInputOption: "RAW",
      requestBody: { values },
    })

    // append status baru
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: SHEET_NAME,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          employee_id,
          status,
          jenis_status,
          lokasi_kerja || "",
          start_date,
          "",
          "TRUE",
          new Date().toISOString(),
          updated_by || "system",
          keterangan || "",
        ]]
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed save status" }, { status: 500 })
  }
}
