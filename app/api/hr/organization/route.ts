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
const ORG_SHEET = "ORGANIZATION"

/* ================= GET ================= */
export async function GET() {
  const empRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${EMPLOYEE_SHEET}!A1:T`,
  })

  const [empHeaders, ...empRows] = empRes.data.values || []
  const employees = empRows.map(r =>
    Object.fromEntries(empHeaders.map((h, i) => [h, r[i] || ""]))
  )

  const orgRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${ORG_SHEET}!A1:I`,
  })

  const [orgHeaders, ...orgRows] = orgRes.data.values || []
  const orgs = orgRows.map(r =>
    Object.fromEntries(orgHeaders.map((h, i) => [h, r[i] || ""]))
  )

  const data = employees.map(emp => {
    const org = orgs.find(o => o.employee_id === emp.employee_id)

    return {
      employee_id: emp.employee_id,
      nama_lengkap: emp.nama_lengkap,
      divisi: org?.divisi || "-",
      jabatan: org?.jabatan || "-",
      atasan: org?.atasan_nama || "-",
      status: org ? "AKTIF" : "BELUM DISET",
    }
  })

  return NextResponse.json({ data })
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  const body = await req.json()

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${ORG_SHEET}!A1:A`,
  })

  const ids = (res.data.values || []).flat()
  const rowIndex = ids.findIndex(id => id === body.employee_id)

  const values = [[
    body.employee_id,
    body.nama_lengkap,
    body.divisi,
    body.jabatan,
    body.atasan_id || "",
    body.atasan_nama || "",
    "TRUE",
    new Date().toISOString(),
    body.updated_by || "HR",
  ]]

  if (rowIndex > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${ORG_SHEET}!A${rowIndex + 1}:I${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values },
    })
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: ORG_SHEET,
      valueInputOption: "RAW",
      requestBody: { values },
    })
  }

  return NextResponse.json({ success: true })
}
