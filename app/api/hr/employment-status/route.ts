import { NextResponse } from "next/server"
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

const EMPLOYEE_SHEET = "EMPLOYEE_MASTER"
const STATUS_SHEET = "EMPLOYMENT_STATUS"

/* ================= GET (JOIN MASTER + STATUS) ================= */

export async function GET() {
  try {
    /* ===== AMBIL EMPLOYEE MASTER ===== */
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

    /* ===== AMBIL EMPLOYMENT STATUS ===== */
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

    /* ===== JOIN ===== */
    const data = employees.map((e) => {
      const current = statuses.find(
        (s) =>
          s.employee_id === e.employee_id &&
          s.is_current === "TRUE"
      )

      return {
        employee_id: e.employee_id,
        nama: e.nama_lengkap,
        divisi: e.divisi,
        jabatan: e.jabatan,
        tipe_karyawan: e.tipe_karyawan,
        lokasi_master: e.lokasi_kerja,

        status_aktif: current?.status || "Belum diset",
        jenis_status: current?.jenis_status || "-",
        lokasi_kerja: current?.lokasi_kerja || e.lokasi_kerja,
        sejak: current?.start_date || "-",
        sampai: current?.end_date || "",
        is_current: current ? true : false,
      }
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error("EMPLOYMENT STATUS JOIN ERROR:", err)
    return NextResponse.json(
      { error: "Failed load employment status" },
      { status: 500 }
    )
  }
}
