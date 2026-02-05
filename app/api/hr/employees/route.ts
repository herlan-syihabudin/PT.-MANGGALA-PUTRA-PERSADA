import { NextResponse } from "next/server"
import { google } from "googleapis"

export const runtime = "nodejs"

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.HR_SHEET_ID!,
      range: "EMPLOYEE_MASTER!A1:T",
    })

    const values = res.data.values || []
    if (values.length === 0) return NextResponse.json([])

    const [headers, ...rows] = values

    const data = rows.map((row) => {
      const obj: any = {}
      headers.forEach((h, i) => (obj[h] = row[i] || ""))
      return obj
    })

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("HR API ERROR FULL:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
