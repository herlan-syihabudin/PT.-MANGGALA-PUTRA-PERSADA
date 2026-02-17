import { NextResponse } from "next/server"
import { getSheetsClient } from "@/lib/google"

export const dynamic = "force-dynamic"

const SALES_PIPELINE = "SALES_PIPELINE"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { inquiry_id, rab_id, estimated_value } = body

    if (!inquiry_id) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    const { sheets, sheetId } = getSheetsClient()

    // Ambil semua pipeline
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SALES_PIPELINE}!A2:I2000`,
    })

    const rows = res.data.values || []

    // kolom A = pipeline_id
    const index = rows.findIndex((r) => r[0] === inquiry_id)

    if (index === -1) {
      return NextResponse.json(
        { message: "Pipeline tidak ditemukan" },
        { status: 404 }
      )
    }

    const rowNumber = index + 2
    const existingCreatedAt = rows[index]?.[7] || new Date().toISOString()

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${SALES_PIPELINE}!D${rowNumber}:I${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          "PENAWARAN",             // D stage
          estimated_value || 0,    // E estimated_value
          rab_id || "",            // F rab_id
          rows[index]?.[6] || "",  // G proposal_id (jaga kalau sudah ada)
          existingCreatedAt,       // H created_at
          new Date().toISOString() // I updated_at
        ]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("UPDATE PIPELINE ERROR:", error)
    return NextResponse.json(
      { message: "Gagal update pipeline" },
      { status: 500 }
    )
  }
}
