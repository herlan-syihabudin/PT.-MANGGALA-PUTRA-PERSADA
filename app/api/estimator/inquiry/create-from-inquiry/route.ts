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
const SHEET_ID = process.env.GSHEET_CRM_ID!

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { inquiry_id } = body

    if (!inquiry_id) {
      return NextResponse.json({ error: "No inquiry_id" }, { status: 400 })
    }

    const rabId = `RAB-${Date.now()}`
    const now = new Date().toISOString()

    /* ===== 1. Insert ke RAB_PROJECT ===== */
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `RAB_PROJECT!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rabId,
          inquiry_id,
          "Draft",
          now,
          "",
          "",
        ]],
      },
    })

    /* ===== 2. Update Status Inquiry ===== */
    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!A2:A`,
    })

    const rows = inquiryRes.data.values || []

    const rowIndex = rows.findIndex(r => r[0] === inquiry_id)

    if (rowIndex !== -1) {
      const actualRow = rowIndex + 2

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `CRM_INQUIRY!I${actualRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["estimating"]],
        },
      })
    }

    return NextResponse.json({
      success: true,
      rab_id: rabId,
    })

  } catch (err) {
    console.error("Create RAB Error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
