import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

function getSheetsClient() {
  if (
    !process.env.GOOGLE_CLIENT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY ||
    !process.env.GOOGLE_SHEET_ID
  ) {
    throw new Error("Missing Google ENV variables")
  }

  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  return {
    sheets: google.sheets({ version: "v4", auth }),
    sheetId: process.env.GOOGLE_SHEET_ID,
  }
}

const ORG_SHEET = "ORGANIZATION"

export async function GET() {
  try {
    const { sheets, sheetId } = getSheetsClient()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${ORG_SHEET}!A1:I`,
    })

    const values = res.data.values || []
    if (values.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const [headers, ...rows] = values

    const orgs = rows.map((r) =>
      Object.fromEntries(
        headers.map((h, i) => [h, r[i] ?? ""])
      )
    )

    const map: Record<string, any> = {}

    orgs.forEach((o) => {
      map[o.employee_id] = { ...o, children: [] }
    })

    const tree: any[] = []

    orgs.forEach((o) => {
      if (o.atasan_id && map[o.atasan_id]) {
        map[o.atasan_id].children.push(map[o.employee_id])
      } else {
        tree.push(map[o.employee_id])
      }
    })

    return NextResponse.json({ data: tree })
  } catch (err) {
    console.error("ORG TREE ERROR:", err)
    return NextResponse.json(
      { error: "Failed load organization" },
      { status: 500 }
    )
  }
}