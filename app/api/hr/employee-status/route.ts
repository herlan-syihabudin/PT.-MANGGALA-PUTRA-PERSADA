import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= GOOGLE AUTH ================= */

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL!,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SHEET_NAME = "EMPLOYMENT_STATUS"

/* ================= GET ================= */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")

    if (!employee_id) {
      return NextResponse.json({ data: [] })
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:J`,
    })

    const [headers, ...rows] = res.data.values || []

    const data = rows
      .filter((r) => r[0] === employee_id)
      .map((r) =>
        headers.reduce((obj, h, i) => {
          obj[h] = r[i] ?? ""
          return obj
        }, {} as any)
      )

    return NextResponse.json({ data })
  } catch (err) {
    console.error("EMPLOYMENT STATUS GET ERROR:", err)
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

    if (!employee_id || !status || !jenis_status || !start_date) {
      return NextResponse.json(
        { error: "Field wajib belum lengkap" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:J`,
    })

    const values = res.data.values || []

    /* === TUTUP STATUS LAMA === */
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === employee_id && values[i][6] === "TRUE") {
        values[i][5] = start_date // end_date
        values[i][6] = "FALSE"    // is_current
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:J${values.length}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    })

    /* === STATUS BARU === */
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "USER_ENTERED",
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
    console.error("EMPLOYMENT STATUS POST ERROR:", err)
    return NextResponse.json({ error: "Failed save status" }, { status: 500 })
  }
}
