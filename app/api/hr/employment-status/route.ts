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

type StatusRow = {
  employee_id: string
  status: string
  jenis_status: string
  lokasi_kerja: string
  start_date: string
  end_date: string
  is_current: string
  created_at: string
  updated_by: string
  keterangan: string
}

/* ================= GET ================= */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:J`,
    })

    const [headers, ...rows] = res.data.values || []

    let filteredRows = rows

    // Jika ada employee_id → filter per karyawan
    if (employee_id) {
      filteredRows = rows.filter((r) => r[0] === employee_id)
    }

    const data: StatusRow[] = filteredRows.map((r) =>
      headers.reduce((obj, h, i) => {
        obj[h as keyof StatusRow] = (r[i] ?? "") as any
        return obj
      }, {} as StatusRow)
    )

    return NextResponse.json({ data })
  } catch (err) {
    console.error("EMPLOYMENT STATUS GET ERROR:", err)
    return NextResponse.json(
      { error: "Failed get status" },
      { status: 500 }
    )
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

    // Ambil seluruh sheet untuk menutup status lama
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:J`,
    })

    const values = res.data.values || []

    // === TUTUP STATUS LAMA (is_current = TRUE) ===
    for (let i = 1; i < values.length; i++) {
      const row = values[i]
      if (row[0] === employee_id && row[6] === "TRUE") {
        // end_date = start_date baru
        row[5] = start_date
        row[6] = "FALSE"
      }
    }

    // Update block lama (jika ada perubahan)
    if (values.length > 1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1:J${values.length}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      })
    }

    // === TAMBAH STATUS BARU (CURRENT) ===
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
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
          ],
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("EMPLOYMENT STATUS POST ERROR:", err)
    return NextResponse.json(
      { error: "Failed save status" },
      { status: 500 }
    )
  }
}
