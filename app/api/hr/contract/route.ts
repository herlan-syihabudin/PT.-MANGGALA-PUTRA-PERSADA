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
const SHEET_NAME = "CONTRACT"

/* ================= GET CONTRACT ================= */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")
    const status = searchParams.get("status")

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:H`,
    })

    const [headers, ...rows] = res.data.values || []

    let data = rows.map((r) =>
      headers.reduce((obj, h, i) => {
        obj[h] = r[i] ?? ""
        return obj
      }, {} as any)
    )

    if (employee_id) {
      data = data.filter(
        (d) => String(d.employee_id).trim() === employee_id.trim()
      )
    }

    if (status) {
      data = data.filter(
        (d) => String(d.status_kontrak).toUpperCase() === status.toUpperCase()
      )
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error("CONTRACT GET ERROR:", err)
    return NextResponse.json(
      { error: "Failed get contract data" },
      { status: 500 }
    )
  }
}

/* ================= POST CONTRACT ================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      employee_id,
      jenis_kontrak,
      start_date,
      end_date,
      keterangan,
    } = body

    if (!employee_id || !jenis_kontrak || !start_date) {
      return NextResponse.json(
        { error: "employee_id, jenis_kontrak, start_date wajib" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:H`,
    })

    const values = res.data.values || []

    /* === NONAKTIFKAN KONTRAK AKTIF SEBELUMNYA === */
    for (let i = 1; i < values.length; i++) {
      if (
        String(values[i][1]).trim() === employee_id.trim() &&
        String(values[i][5]).toUpperCase() === "AKTIF"
      ) {
        values[i][5] = "NONAKTIF"
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:H${values.length}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    })

    /* === CREATE CONTRACT ID === */
    const contract_id = `CTR-${employee_id}-${Date.now()}`

    /* === INSERT NEW CONTRACT === */
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          contract_id,
          employee_id.trim(),
          jenis_kontrak,
          start_date,
          end_date || "",
          "AKTIF",
          keterangan || "",
          new Date().toISOString(),
        ]],
      },
    })

    return NextResponse.json({
      success: true,
      contract_id,
    })
  } catch (err) {
    console.error("CONTRACT POST ERROR:", err)
    return NextResponse.json(
      { error: "Failed save contract" },
      { status: 500 }
    )
  }
}
