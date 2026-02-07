import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL!,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GOOGLE_SHEET_ID!

function genContractID(employee_id: string) {
  return `CTR-${employee_id}-${Date.now()}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      employee_id,
      start_date,
      end_date,
      sistem_bayar,
      rate,
      project_code,
      lokasi_kerja,
      keterangan,
      jenis_kontrak,
    } = body

    if (!employee_id || !start_date || !rate) {
      return NextResponse.json(
        { error: "Data kontrak tidak lengkap" },
        { status: 400 }
      )
    }

    /* === 1. CEK EMPLOYEE MASTER === */
    const empRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `EMPLOYEE_MASTER!A1:Z`,
    })

    const [empHeaders, ...empRows] = empRes.data.values || []
    const empIndex = empHeaders.indexOf("employee_id")
    const activeIndex = empHeaders.indexOf("is_active")

    const employeeRow = empRows.find(
      (r) => r[empIndex] === employee_id
    )

    if (!employeeRow) {
      return NextResponse.json(
        { error: "Employee belum terdaftar" },
        { status: 404 }
      )
    }

    if (
      String(employeeRow[activeIndex]).toUpperCase() !== "TRUE"
    ) {
      return NextResponse.json(
        { error: "Employee sudah nonaktif" },
        { status: 400 }
      )
    }

    /* === 2. CEK KONTRAK AKTIF === */
    const ctrRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CONTRACT!A1:Z`,
    })

    const [ctrHeaders, ...ctrRows] = ctrRes.data.values || []
    const ctrEmpIdx = ctrHeaders.indexOf("employee_id")
    const statusIdx = ctrHeaders.indexOf("status_kontrak")

    const hasActive = ctrRows.some(
      (r) =>
        r[ctrEmpIdx] === employee_id &&
        r[statusIdx] === "AKTIF"
    )

    if (hasActive) {
      return NextResponse.json(
        { error: "Masih ada kontrak aktif" },
        { status: 400 }
      )
    }

    /* === 3. INSERT CONTRACT === */
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `CONTRACT!A2`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          genContractID(employee_id),
          employee_id,
          employeeRow[empHeaders.indexOf("nama_lengkap")],
          jenis_kontrak,
          employeeRow[empHeaders.indexOf("jabatan")],
          project_code,
          lokasi_kerja,
          start_date,
          end_date || "",
          "AKTIF",
          sistem_bayar,
          rate,
          keterangan || "",
          new Date().toISOString(),
        ]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("CREATE CONTRACT ERROR:", err)
    return NextResponse.json(
      { error: "Gagal membuat kontrak" },
      { status: 500 }
    )
  }
}
