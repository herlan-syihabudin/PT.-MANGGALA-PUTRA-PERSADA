import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const SALES_PIPELINE = "SALES_PIPELINE"

function n(x: any) {
  const v = Number(String(x || "").replace(/\./g, ""))
  return Number.isFinite(v) ? v : 0
}

export async function GET() {
  try {
    if (
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GSHEET_CRM_ID
    ) {
      return NextResponse.json(
        { message: "Environment belum diset" },
        { status: 500 }
      )
    }

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    )

    const sheets = google.sheets({ version: "v4", auth })

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GSHEET_CRM_ID,
      range: `'${SALES_PIPELINE}'!A2:I2000`,
    })

    const rows = res.data.values || []

    const data = rows
      .filter((r) => r[0]) // hanya row yang punya pipeline_id
      .map((r) => ({
        pipeline_id: r[0] || "",
        customer_id: r[1] || "",
        project_name: r[2] || "",
        stage: r[3] || "FOLLOW UP",
        estimated_value: n(r[4]),
        rab_id: r[5] || "",
        proposal_id: r[6] || "",
        created_at: r[7] || "",
        updated_at: r[8] || "",
      }))

    return NextResponse.json(data)
  } catch (e) {
    console.error("GET PIPELINE ERROR:", e)
    return NextResponse.json(
      { message: "Gagal ambil pipeline" },
      { status: 500 }
    )
  }
}
