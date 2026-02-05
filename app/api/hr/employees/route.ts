import { NextResponse } from "next/server"
import { google } from "googleapis"

export const runtime = "nodejs"

export async function GET() {
  try {
    const email = process.env.GOOGLE_CLIENT_EMAIL
    const key = process.env.GOOGLE_PRIVATE_KEY
    const sheetId = process.env.HR_SHEET_ID

    if (!email || !key || !sheetId) {
      throw new Error("ENV_NOT_SET")
    }

    const auth = new google.auth.JWT(
      email,
      undefined,
      key.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    )

    const sheets = google.sheets({ version: "v4", auth })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
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
    console.error("HR API ERROR:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch employee data" },
      { status: 500 }
    )
  }
}
