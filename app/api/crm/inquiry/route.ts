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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const filterCustomerId = searchParams.get("customer_id")

    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!A2:Q`,
    })

    const inquiryRows = (inquiryRes.data.values || []).filter(
      (row) => row[0]
    )

    const normalize = (val: any) =>
  String(val || "").replace(/\s+/g, "").trim()

const data = inquiryRows
  .filter((row) => {
    if (!filterCustomerId) return true
    return normalize(row[2]) === normalize(filterCustomerId)
  })
      .map((row) => ({
        inquiry_id: row[0] || "",
        tanggal_masuk: row[1] || "",
        customer_id: row[2] || "",
        customer_name: row[3] || "",
        nama_pekerjaan: row[4] || "",
        layanan: row[5] || "",
        estimasi_nilai: row[6]
  ? Number(String(row[6]).replace(/[^\d]/g, ""))
  : 0,
        sumber: row[7] || "",
        assigned_to: row[8] || "",
        status: row[9] || "new",
        prioritas: row[10] || "normal",
        lokasi: row[11] || "",
        catatan: row[12] || "",
        converted_rab_id: row[13] || "",
        converted_project_id: row[14] || "",
        created_at: row[15] || "",
        created_by: row[16] || "",
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

    if (!body.customer_id || !body.nama_pekerjaan) {
      return NextResponse.json(
        { message: "Customer & Nama Pekerjaan wajib diisi" },
        { status: 400 }
      )
    }

    const inquiryId = `INQ-${Date.now()}`
    const now = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:Q`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
  inquiryId,
  body.tanggal_masuk || new Date().toISOString().split("T")[0],
  String(body.customer_id).trim(),
  String(body.customer_name || "").trim(),
  String(body.nama_pekerjaan).trim(),
  body.layanan || "",
  body.estimasi_nilai || "",
  body.sumber || "",
  body.assigned_to || "",
  "new",
  body.prioritas || "normal",
  body.lokasi || "",
  body.catatan || "",
  "",
  "",
  now,
  body.created_by || "Marketing",
]],
      },
    })

    return NextResponse.json({
      success: true,
      inquiry_id: inquiryId,
    })

  } catch (error) {
    console.error("POST Inquiry Error:", error)
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}
