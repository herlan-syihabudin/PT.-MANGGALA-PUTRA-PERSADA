import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= GOOGLE AUTH ================= */

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CRM_INQUIRY"

/* ================= GET ================= */

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:P`,
    })

    const rows = res.data.values || []

    const data = rows.map((row) => ({
      inquiry_id: row[0],
      tanggal_masuk: row[1],
      customer_id: row[2],
      customer_name: row[3],
      nama_pekerjaan: row[4],
      estimasi_nilai: row[5],
      sumber: row[6],
      assigned_to: row[7],
      status: row[8],
      prioritas: row[9],
      lokasi: row[10],
      catatan: row[11],
      converted_rab_id: row[12],
      converted_project_id: row[13],
      created_at: row[14],
      created_by: row[15],
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET Inquiry Error:", error)
    return NextResponse.json([], { status: 500 })
  }
}

/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const inquiryId = `INQ-${Date.now()}`
    const now = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:P`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          inquiryId,
          body.tanggal_masuk || new Date().toISOString().split("T")[0],
          body.customer_id || "",
          body.customer_name || "",
          body.nama_pekerjaan || "",
          body.estimasi_nilai || "",
          body.sumber || "",
          body.assigned_to || "",
          body.status || "new",
          body.prioritas || "normal",
          body.lokasi || "",
          body.catatan || "",
          "", // converted_rab_id
          "", // converted_project_id
          now,
          body.created_by || "Marketing",
        ]],
      },
    })

    return NextResponse.json({
      success: true,
      inquiry_id: inquiryId,
      created_at: now,
    })
  } catch (error) {
    console.error("POST Inquiry Error:", error)
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}
