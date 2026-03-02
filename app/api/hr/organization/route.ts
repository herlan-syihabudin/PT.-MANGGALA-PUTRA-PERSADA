import { NextResponse } from "next/server"
import { getHRClient } from "@/lib/google"

export const dynamic = "force-dynamic"

const EMPLOYEE_SHEET = "EMPLOYEE_MASTER"
const ORG_SHEET = "ORGANIZATION"

export async function GET(
  _: Request,
  { params }: { params: { employee_id: string } }
) {
  try {
    const { sheets, sheetId } = getSheetsClient()
    const employeeId = params.employee_id

    /* ===== LOAD EMPLOYEE MASTER ===== */
    const empRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${EMPLOYEE_SHEET}!A1:T`,
    })

    const values = empRes.data.values || []
    const empHeaders = values[0] || []
    const empRows = values.slice(1)

    const employees = empRows.map((r) =>
      Object.fromEntries(empHeaders.map((h, i) => [h, r[i] ?? ""]))
    ) as any[]

    const employee = employees.find(
      (e) => e.employee_id === employeeId
    )

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    /* ===== LOAD ORGANIZATION ===== */
    const orgRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${ORG_SHEET}!A1:I`,
    })

    const orgValues = orgRes.data.values || []
    const orgHeaders = orgValues[0] || []
    const orgRows = orgValues.slice(1)

    const orgs = orgRows.map((r) =>
      Object.fromEntries(orgHeaders.map((h, i) => [h, r[i] ?? ""]))
    ) as any[]

    const org = orgs.find(
      (o) => o.employee_id === employeeId
    )

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
  } catch (err) {
    console.error("ORG DETAIL ERROR:", err)
    return NextResponse.json(
      { error: "Failed load organization detail" },
      { status: 500 }
    )
  }
}
