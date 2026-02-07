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

const EMPLOYEE_SHEET = "EMPLOYEE_MASTER"
const ORG_SHEET = "ORGANIZATION"

/* ================= GET ================= */
export async function GET() {
  try {
    /* ===== EMPLOYEE MASTER ===== */
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

    /* ===== ORGANIZATION ===== */
    const orgRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${ORG_SHEET}!A1:K`,
    })

    const [orgHeaders, ...orgRows] = orgRes.data.values || []
    const orgs = orgRows.map((r) => {
      const o: any = {}
      orgHeaders.forEach((h, i) => (o[h] = r[i] ?? ""))
      return o
    })

    /* ===== JOIN ===== */
    const data = employees.map((e) => {
      const currentOrg = orgs.find(
        (o) =>
          o.employee_id === e.employee_id &&
          o.is_current === "TRUE"
      )

      return {
        employee_id: e.employee_id,
        nama_lengkap: e.nama_lengkap,
        divisi: currentOrg?.divisi_code || "-",
        jabatan: currentOrg?.position_code || "-",
        atasan: currentOrg?.atasan_employee_id || "-",
        lokasi_kerja: currentOrg?.lokasi_kerja || e.lokasi_kerja,
        is_assigned: Boolean(currentOrg),
      }
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error("ORG GET ERROR:", err)
    return NextResponse.json(
      { error: "Failed load organization" },
      { status: 500 }
    )
  }
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${ORG_SHEET}!A1:K`,
    })

    const [, ...rows] = res.data.values || []

    /* ===== NONAKTIFKAN STRUKTUR LAMA ===== */
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === body.employee_id && rows[i][7] === "TRUE") {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${ORG_SHEET}!H${i + 2}`,
          valueInputOption: "RAW",
          requestBody: { values: [["FALSE"]] },
        })
      }
    }

    /* ===== TAMBAH STRUKTUR BARU ===== */
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: ORG_SHEET,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          body.employee_id,
          body.divisi_code,
          body.position_code,
          body.atasan_employee_id || "",
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
    console.error("ORG POST ERROR:", err)
    return NextResponse.json(
      { error: "Failed save organization" },
      { status: 500 }
    )
  }
}
