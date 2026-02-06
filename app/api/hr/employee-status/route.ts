import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= GOOGLE AUTH ================= */

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SHEET_NAME = "EMPLOYEE_STATUS"
const RANGE = `${SHEET_NAME}!A1:J`

/* ================= GET ================= */
/*
  GET /api/hr/employee-status?employee_id=MPP-ENG-2026-573
*/
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")

    if (!employee_id) {
      return NextResponse.json(
        { error: "employee_id required" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    })

    const [headers, ...rows] = res.data.values || []

    const data = rows
      .filter(r => r[0] === employee_id)
      .map(r => {
        const obj: any = {}
        headers.forEach((h, i) => {
          obj[h] = r[i] ?? ""
        })
        return obj
      })

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("EMPLOYEE STATUS GET ERROR:", err)
    return NextResponse.json(
      { error: "Failed get status" },
      { status: 500 }
    )
  }
}

/* ================= POST ================= */
/*
  POST /api/hr/employee-status
*/
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

    if (!employee_id || !status || !jenis_status || !start_date) {
      return NextResponse.json(
        { error: "Field wajib belum lengkap" },
        { status: 400 }
      )
    }

    // ambil data existing
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    })

    const values = res.data.values || []

    // ===== TUTUP STATUS AKTIF SEBELUMNYA =====
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === employee_id && values[i][6] === "TRUE") {
        values[i][5] = new Date().toISOString().slice(0, 10) // end_date
        values[i][6] = "FALSE" // is_current
      }
    }

    // overwrite update (AMAN karena range fix)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: "RAW",
      requestBody: { values },
    })

    // ===== TAMBAH STATUS BARU =====
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
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
        ]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("EMPLOYEE STATUS POST ERROR:", err)
    return NextResponse.json(
      { error: "Failed save status" },
      { status: 500 }
    )
  }
}
