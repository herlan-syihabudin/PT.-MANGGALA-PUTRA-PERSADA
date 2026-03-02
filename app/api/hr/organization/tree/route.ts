import { NextResponse } from "next/server"
import { getHRClient } from "@/lib/google"

export const dynamic = "force-dynamic"

const ORG_SHEET = "ORGANIZATION"

export async function GET() {
  try {
    const { sheets, sheetId } = getHRClient()

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
