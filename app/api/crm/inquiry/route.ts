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
    /* ===== 1. Ambil Inquiry ===== */
    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!A2:Q`,
    })

    const inquiryRows = (inquiryRes.data.values || []).filter(
  (row) => row[0] // skip empty row
)

    /* ===== 2. Ambil Customers ===== */
    const customerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CUSTOMERS!A2:P`,
    })

    const customerRows = customerRes.data.values || []

    /* ===== 3. Buat Map Customer ===== */
    const customerMap: Record<string, any> = {}

    customerRows.forEach((row) => {
      const customer_id = row[0]
      customerMap[customer_id] = {
        company_name: row[1],
        city: row[9],
        phone: row[6],
        pic_name: row[3],
      }
    })

    /* ===== 4. Join Data ===== */
   const data = inquiryRows.map((row, index) => {
  // skip header kalau lo pakai A:Q
  if (index === 0 && row[0] === "inquiry_id") return null

  const customer_id = row[2] || ""
  const customer = customerMap[customer_id] || {}

  return {
    inquiry_id: row[0] || "",
    tanggal_masuk: row[1] || "",
    customer_id,

    customer_name: row[3] || customer.company_name || "-",
    customer_city: customer.city || "-",
    customer_phone: customer.phone || "-",
    pic_name: customer.pic_name || "-",

    nama_pekerjaan: row[4] || "-",
    layanan: row[5] || "-",              // ✅ TAMBAH INI

    estimasi_nilai: row[6] ? Number(row[6]) : 0,  // ✅ FIX INDEX

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
  }
}).filter(Boolean)

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
      range: `${SHEET_NAME}!A:Q`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          inquiryId,
          body.tanggal_masuk || new Date().toISOString().split("T")[0],
          body.customer_id || "",
          body.customer_name || "",
          body.nama_pekerjaan || "",
           body.layanan || "",
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
