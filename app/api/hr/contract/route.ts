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
    const project_code = searchParams.get("project_code")

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:N`,
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
        (d) =>
          String(d.status_kontrak).toUpperCase() === status.toUpperCase()
      )
    }

    if (project_code) {
      data = data.filter(
        (d) => String(d.project_code).trim() === project_code.trim()
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
      nama_lengkap,
      type_karyawan,
      jabatan,
      project_code,
      lokasi_kerja,
      start_date,
      end_date,
      sistem_bayar,
      rate,
      keterangan,
    } = body

    if (
      !employee_id ||
      !nama_lengkap ||
      !type_karyawan ||
      !jabatan ||
      !start_date ||
      !sistem_bayar ||
      !rate
    ) {
      return NextResponse.json(
        { error: "Field wajib belum lengkap" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:N`,
    })

    const values = res.data.values || []

    /* === NONAKTIFKAN KONTRAK AKTIF SEBELUMNYA === */
    for (let i = 1; i < values.length; i++) {
      if (
        String(values[i][1]).trim() === employee_id.trim() &&
        String(values[i][9]).toUpperCase() === "AKTIF"
      ) {
        values[i][9] = "NONAKTIF"
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:N${values.length}`,
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
          nama_lengkap,
          type_karyawan.toUpperCase(),
          jabatan,
          project_code || "",
          lokasi_kerja || "",
          start_date,
          end_date || "",
          "AKTIF",
          sistem_bayar.toUpperCase(),
          rate,
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
