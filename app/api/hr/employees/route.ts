import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  )

  const sheets = google.sheets({ version: "v4", auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.HR_SHEET_ID,
    range: "EMPLOYEE_MASTER!A1:T",
  })

  const [headers, ...rows] = res.data.values || []

  const data =
    rows?.map((row) => {
      const obj: any = {}
      headers.forEach((h: string, i: number) => {
        obj[h] = row[i] || ""
      })
      return obj
    }) || []

  return NextResponse.json(data)
}
