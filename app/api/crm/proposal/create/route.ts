import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

const PROPOSAL_SHEET = "PROPOSAL"
const SALES_PIPELINE = "SALES_PIPELINE"

function getSheets() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  return google.sheets({ version: "v4", auth })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { pipeline_id, rab_id, total_value } = body

    if (!pipeline_id) {
      return NextResponse.json(
        { message: "pipeline_id wajib" },
        { status: 400 }
      )
    }

    const sheets = getSheets()

    const proposal_id = "PRP-" + nanoid(6).toUpperCase()
    const created_at = new Date().toISOString()

    /* ================= CREATE PROPOSAL ================= */

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GSHEET_CRM_ID,
      range: `${PROPOSAL_SHEET}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          proposal_id,
          pipeline_id,
          rab_id || "",
          total_value || 0,
          "Draft",
          created_at
        ]]
      }
    })

    /* ================= UPDATE PIPELINE → NEGOSIASI ================= */

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GSHEET_CRM_ID,
      range: `${SALES_PIPELINE}!A2:I2000`,
    })

    const rows = res.data.values || []
    const index = rows.findIndex((r) => r[0] === pipeline_id)

    if (index !== -1) {
      const rowNumber = index + 2

      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GSHEET_CRM_ID,
        range: `${SALES_PIPELINE}!D${rowNumber}:I${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            "NEGOSIASI",                // stage
            rows[index]?.[4] || 0,      // estimated_value
            rows[index]?.[5] || "",     // rab_id
            proposal_id,                // proposal_id
            rows[index]?.[7] || "",     // created_at
            new Date().toISOString()    // updated_at
          ]]
        }
      })
    }

    return NextResponse.json({
      success: true,
      proposal_id,
    })
  } catch (e) {
    console.error("CREATE PROPOSAL ERROR:", e)
    return NextResponse.json(
      { message: "Gagal buat proposal" },
      { status: 500 }
    )
  }
}
