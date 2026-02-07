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
const ORG_SHEET = "ORGANIZATION"

export async function GET() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${ORG_SHEET}!A1:I`,
  })

  const [headers, ...rows] = res.data.values || []
  const orgs = rows.map(r =>
    Object.fromEntries(headers.map((h, i) => [h, r[i] || ""]))
  )

  const map: any = {}
  orgs.forEach(o => {
    map[o.employee_id] = { ...o, children: [] }
  })

  const tree: any[] = []

  orgs.forEach(o => {
    if (o.atasan_id && map[o.atasan_id]) {
      map[o.atasan_id].children.push(map[o.employee_id])
    } else {
      tree.push(map[o.employee_id])
    }
  })

  return NextResponse.json({ data: tree })
}
