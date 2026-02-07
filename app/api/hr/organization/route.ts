// app/api/hr/organization/[employee_id]/route.ts
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

const EMPLOYEE_SHEET = "EMPLOYEE_MASTER"
const ORG_SHEET = "ORGANIZATION"

export async function GET(
  _: Request,
  { params }: { params: { employee_id: string } }
) {
  const employeeId = params.employee_id

  // ===== EMPLOYEE MASTER =====
  const empRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${EMPLOYEE_SHEET}!A1:T`,
  })

  const [empHeaders, ...empRows] = empRes.data.values || []
  const employees = empRows.map(r =>
    Object.fromEntries(empHeaders.map((h, i) => [h, r[i] || ""]))
  )

  const employee = employees.find(e => e.employee_id === employeeId)
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 })
  }

  // ===== ORGANIZATION =====
  const orgRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${ORG_SHEET}!A1:I`,
  })

  const [orgHeaders, ...orgRows] = orgRes.data.values || []
  const orgs = orgRows.map(r =>
    Object.fromEntries(orgHeaders.map((h, i) => [h, r[i] || ""]))
  )

  const org = orgs.find(o => o.employee_id === employeeId)

  return NextResponse.json({
    employee: {
      employee_id: employee.employee_id,
      nama_lengkap: employee.nama_lengkap,
      divisi: org?.divisi || employee.divisi || "",
      jabatan: org?.jabatan || employee.jabatan || "",
      atasan_id: org?.atasan_id || employee.atasan_id || "",
      atasan_nama: org?.atasan_nama || employee.atasan_nama || "",
    },
  })
}
