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

const EMPLOYEE_SHEET = "EMPLOYEE_MASTER"
const STATUS_SHEET = "EMPLOYMENT_STATUS"

/* ================= GET ================= */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")

    /* ===== LOAD STATUS ===== */
    const statRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${STATUS_SHEET}!A1:J`,
    })

    const [statHeaders, ...statRows] = statRes.data.values || []

    const statuses = statRows.map((r) => {
      const o: any = {}
      statHeaders.forEach((h, i) => (o[h] = r[i] ?? ""))
      return o
    })

    /* ===== DETAIL MODE (STATUS + MASTER) ===== */
    if (employee_id) {
      // ambil master
      const empRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${EMPLOYEE_SHEET}!A1:T`,
      })

      const [empHeaders, ...empRows] = empRes.data.values || []

      const employees = empRows.map((r) => {
        const o: any = {}
        empHeaders.forEach((h, i) => (o[h] = r[i] ?? ""))
        return o
      })

      const employee = employees.find(
        (e) => e.employee_id === employee_id
      )

      if (!employee) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        employee: {
          employee_id: employee.employee_id,
          nama_lengkap: employee.nama_lengkap,
          divisi: employee.divisi,
          jabatan: employee.jabatan,
          lokasi_kerja: employee.lokasi_kerja,
        },
        statuses: statuses.filter(
          (s) => s.employee_id === employee_id
        ),
      })
    }

    /* ===== LIST / JOIN MODE ===== */
    const empRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${EMPLOYEE_SHEET}!A1:T`,
    })

    const [empHeaders, ...empRows] = empRes.data.values || []

    const employees = empRows.map((r) => {
      const o: any = {}
      empHeaders.forEach((h, i) => (o[h] = r[i] ?? ""))
      return o
    })

    const data = employees.map((e) => {
      const current = statuses.find(
        (s) =>
          s.employee_id === e.employee_id &&
          s.is_current === "TRUE"
      )

      return {
        employee_id: e.employee_id,
        nama_lengkap: e.nama_lengkap,
        divisi: e.divisi,
        jabatan: e.jabatan,
        tipe_karyawan: e.tipe_karyawan,
        status_aktif: current?.status || "Belum diset",
        sejak: current?.start_date || "-",
        is_current: Boolean(current),
      }
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error("EMP STATUS ERROR:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${STATUS_SHEET}!A1:J`,
    })

    const [, ...rows] = res.data.values || []

    // nonaktif status lama
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === body.employee_id && rows[i][6] === "TRUE") {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${STATUS_SHEET}!G${i + 2}`,
          valueInputOption: "RAW",
          requestBody: { values: [["FALSE"]] },
        })
      }
    }

    // add status baru
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: STATUS_SHEET,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          body.employee_id,
          body.status,
          body.jenis_status,
          body.lokasi_kerja || "",
          body.start_date,
          "",
          "TRUE",
          new Date().toISOString(),
          body.updated_by || "SYSTEM",
          body.keterangan || "",
        ]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("POST STATUS ERROR:", err)
    return NextResponse.json({ error: "Failed save" }, { status: 500 })
  }
}
