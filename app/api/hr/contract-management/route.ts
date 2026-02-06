import { NextResponse } from "next/server"
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

export async function GET() {
  try {
    // === EMPLOYEE MASTER ===
    const empRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `EMPLOYEE_MASTER!A1:Z`,
    })

    const [empHeaders, ...empRows] = empRes.data.values || []

    const employees = empRows.map((r) => {
      const o: any = {}
      empHeaders.forEach((h: string, i: number) => {
        o[h] = r[i] ?? ""
      })
      return o
    })

    // === CONTRACT ===
    const ctrRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CONTRACT!A1:Z`,
    })

    const [ctrHeaders, ...ctrRows] = ctrRes.data.values || []

    const contracts = ctrRows.map((r) => {
      const o: any = {}
      ctrHeaders.forEach((h: string, i: number) => {
        o[h] = r[i] ?? ""
      })
      return o
    })

    // === JOIN ===
    const result = employees.map((e) => {
      const activeContract = contracts.find(
        (c) =>
          c.employee_id === e.employee_id &&
          c.status_kontrak === "AKTIF"
      )

      return {
        employee_id: e.employee_id,
        nama: e.nama_lengkap,
        type: e.type_karyawan,
        jabatan: e.jabatan,

        project: activeContract?.project_code || "-",
        mulai: activeContract?.start_date || "-",
        akhir: activeContract?.end_date || "-",
        sistem: activeContract?.sistem_bayar || "-",
        rate: activeContract?.rate || "-",
        status: activeContract ? "AKTIF" : "BELUM ADA KONTRAK",
      }
    })

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed load contract data" }, { status: 500 })
  }
}
