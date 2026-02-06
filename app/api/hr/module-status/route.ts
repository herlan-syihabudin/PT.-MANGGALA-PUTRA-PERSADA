import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GOOGLE_SHEET_ID!

async function getSheet(name: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${name}!A2:Z`,
  })
  return res.data.values || []
}

export async function GET() {
  try {
    const employees = await getSheet("EMPLOYEE_MASTER")
    const contracts = await getSheet("CONTRACT")
    const payroll = await getSheet("PAYROLL")

    const hasEmployee = employees.length > 0

    const hasOrganization = employees.some(
      (r) => r[10] && r[11] // divisi & jabatan
    )

    const hasContract = contracts.length > 0

    const hasPayroll = payroll.some((r) => r[2]) // gaji pokok
    const hasBPJS = payroll.some((r) => r[5] || r[6]) // bpjs kes / tk

    return NextResponse.json({
      master: hasEmployee,
      employment: hasEmployee,
      organization: hasOrganization,
      contract: hasContract,
      payroll: hasPayroll,
      bpjs: hasBPJS,
      attendance: true,   // nanti
      performance: true,  // nanti
      exit: true,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: true }, { status: 500 })
  }
}
