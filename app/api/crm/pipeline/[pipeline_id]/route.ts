import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const SALES_PIPELINE = "SALES_PIPELINE"

function n(x: any) {
  const v = Number(String(x || "").replace(/\./g, ""))
  return Number.isFinite(v) ? v : 0
}

function getSheets() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  return google.sheets({ version: "v4", auth })
}

/* ================= GET ONE PIPELINE ================= */

export async function GET(
  _: Request,
  { params }: { params: { pipeline_id: string } }
) {
  try {
    const sheets = getSheets()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GSHEET_CRM_ID,
      range: `'${SALES_PIPELINE}'!A2:I2000`,
    })

    const rows = res.data.values || []

    const row = rows.find((r) => r[0] === params.pipeline_id)

    if (!row) {
      return NextResponse.json(
        { message: "Pipeline tidak ditemukan" },
        { status: 404 }
      )
    }

    const data = {
      pipeline_id: row[0] || "",
      customer_id: row[1] || "",
      project_name: row[2] || "",
      stage: row[3] || "FOLLOW UP",
      estimated_value: n(row[4]),
      rab_id: row[5] || "",
      proposal_id: row[6] || "",
      created_at: row[7] || "",
      updated_at: row[8] || "",
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error("GET ONE PIPELINE ERROR:", e)
    return NextResponse.json(
      { message: "Gagal ambil detail pipeline" },
      { status: 500 }
    )
  }
}

/* ================= UPDATE STAGE ================= */

export async function PATCH(
  req: Request,
  { params }: { params: { pipeline_id: string } }
) {
  try {
    const body = await req.json()
    const { stage } = body

    if (!stage) {
      return NextResponse.json(
        { message: "Stage wajib diisi" },
        { status: 400 }
      )
    }

    const sheets = getSheets()

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GSHEET_CRM_ID,
      range: `'${SALES_PIPELINE}'!A2:I2000`,
    })

    const rows = res.data.values || []

    const index = rows.findIndex((r) => r[0] === params.pipeline_id)

    if (index === -1) {
      return NextResponse.json(
        { message: "Pipeline tidak ditemukan" },
        { status: 404 }
      )
    }

    const rowNumber = index + 2

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GSHEET_CRM_ID,
      range: `${SALES_PIPELINE}!D${rowNumber}:I${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          stage,                    // D stage
          rows[index]?.[4] || 0,    // E estimated_value
          rows[index]?.[5] || "",   // F rab_id
          rows[index]?.[6] || "",   // G proposal_id
          rows[index]?.[7] || "",   // H created_at
          new Date().toISOString()  // I updated_at
        ]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("PATCH PIPELINE ERROR:", e)
    return NextResponse.json(
      { message: "Gagal update pipeline" },
      { status: 500 }
    )
  }
}
