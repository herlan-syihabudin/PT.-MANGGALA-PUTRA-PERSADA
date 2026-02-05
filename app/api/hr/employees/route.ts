import { NextResponse } from "next/server"
import { google } from "googleapis"

export const runtime = "nodejs"

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY, // ✅ TANPA replace
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.HR_SHEET_ID,
      range: "EMPLOYEE_MASTER!A1:T",
    })

    const [headers, ...rows] = res.data.values || []
    if (!headers) return NextResponse.json([])

    const data = rows.map((row) => {
      const obj: any = {}
      headers.forEach((h: string, i: number) => {
        obj[h] = row[i] || ""
      })
      return obj
    })

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("HR API ERROR:", err)
    return NextResponse.json(
      { error: err.message || "HR API error" },
      { status: 500 }
    )
  }
}
