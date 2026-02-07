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

/* ================= UTIL ================= */

function genContractID(employee_id: string) {
  return `CTR-${employee_id}-${Date.now()}`
}

function idx(headers: string[], name: string) {
  const i = headers.indexOf(name)
  if (i === -1) throw new Error(`Header '${name}' tidak ditemukan`)
  return i
}

/* ======================================================
   GET → CONTRACT MANAGEMENT (LIST + JOIN)
====================================================== */
export async function GET() {
  try {
    /* ===== EMPLOYEE MASTER ===== */
    const empRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "EMPLOYEE_MASTER!A1:Z",
    })

    const [empHeaders, ...empRows] = empRes.data.values || []
    if (!empHeaders) return NextResponse.json({ data: [] })

    const empIdIdx = idx(empHeaders, "employee_id")
    const namaIdx = idx(empHeaders, "nama_lengkap")
    const tipeIdx = idx(empHeaders, "tipe_karyawan")
    const jabatanIdx = idx(empHeaders, "jabatan")

    const employees = empRows.map((r) => ({
      employee_id: r[empIdIdx],
      nama: r[namaIdx],
      type: r[tipeIdx] || "-",
      jabatan: r[jabatanIdx] || "-",
    }))

    /* ===== CONTRACT ===== */
    const ctrRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "CONTRACT!A1:Z",
    })

    const [ctrHeaders, ...ctrRows] = ctrRes.data.values || []

    const ctrEmpIdx = idx(ctrHeaders, "employee_id")
    const statusIdx = idx(ctrHeaders, "status_kontrak")
    const projectIdx = idx(ctrHeaders, "project_code")
    const startIdx = idx(ctrHeaders, "start_date")
    const endIdx = idx(ctrHeaders, "end_date")
    const sistemIdx = idx(ctrHeaders, "sistem_bayar")
    const rateIdx = idx(ctrHeaders, "rate")

    /* ===== JOIN ===== */
    const result = employees.map((e) => {
      const activeContract = ctrRows.find(
        (r) =>
          r[ctrEmpIdx] === e.employee_id &&
          String(r[statusIdx]).trim().toUpperCase() === "AKTIF"
      )

      return {
        employee_id: e.employee_id,
        nama: e.nama,
        type: e.type,
        jabatan: e.jabatan,
        project: activeContract?.[projectIdx] || "-",
        mulai: activeContract?.[startIdx] || "-",
        akhir: activeContract?.[endIdx] || "-",
        sistem: activeContract?.[sistemIdx] || "-",
        rate: activeContract?.[rateIdx] || "-",
        status: activeContract ? "AKTIF" : "BELUM ADA KONTRAK",
      }
    })

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error("GET CONTRACT MANAGEMENT ERROR:", err)
    return NextResponse.json(
      { error: "Gagal load contract management" },
      { status: 500 }
    )
  }
}

/* ======================================================
   POST → CREATE CONTRACT (SUDAH LO BUAT, AMAN)
====================================================== */
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

    /* ===== CEK EMPLOYEE MASTER ===== */
    const empRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "EMPLOYEE_MASTER!A1:Z",
    })

    const [empHeaders, ...empRows] = empRes.data.values || []

    const empIdIdx = idx(empHeaders, "employee_id")
    const activeIdx = idx(empHeaders, "is_active")
    const namaIdx = idx(empHeaders, "nama_lengkap")
    const jabatanIdx = idx(empHeaders, "jabatan")

    const employeeRow = empRows.find(
      (r) => r[empIdIdx] === employee_id
    )

    if (!employeeRow)
      return NextResponse.json(
        { error: "Employee belum terdaftar" },
        { status: 404 }
      )

    if (
      String(employeeRow[activeIdx]).trim().toUpperCase() !== "TRUE"
    )
      return NextResponse.json(
        { error: "Employee sudah nonaktif" },
        { status: 400 }
      )

    /* ===== CEK KONTRAK AKTIF ===== */
    const ctrRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "CONTRACT!A1:Z",
    })

    const [ctrHeaders, ...ctrRows] = ctrRes.data.values || []
    const ctrEmpIdx = idx(ctrHeaders, "employee_id")
    const statusIdx = idx(ctrHeaders, "status_kontrak")

    const hasActive = ctrRows.some(
      (r) =>
        r[ctrEmpIdx] === employee_id &&
        String(r[statusIdx]).trim().toUpperCase() === "AKTIF"
    )

    if (hasActive)
      return NextResponse.json(
        { error: "Masih ada kontrak aktif" },
        { status: 400 }
      )

    /* ===== INSERT CONTRACT ===== */
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "CONTRACT!A2",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          genContractID(employee_id),
          employee_id,
          employeeRow[namaIdx],
          jenis_kontrak,
          employeeRow[jabatanIdx],
          project_code || "",
          lokasi_kerja || "",
          start_date,
          end_date || "",
          "AKTIF",
          sistem_bayar || "",
          rate,
          keterangan || "",
          new Date().toISOString(),
        ]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("CREATE CONTRACT ERROR:", err)
    return NextResponse.json(
      { error: err.message || "Gagal membuat kontrak" },
      { status: 500 }
    )
  }
}
