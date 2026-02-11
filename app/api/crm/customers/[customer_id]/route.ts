import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ==============================
   GOOGLE AUTH
================================ */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

/* ==============================
   CONFIG
================================ */
const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CUSTOMERS"

/* ==============================
   GET : CUSTOMER DETAIL
================================ */
export async function GET(
  _: Request,
  { params }: { params: { customer_id: string } }
) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:P`,
    })

    const rows = res.data.values || []

    const row = rows.find(
      (r) => r[0] && r[0] === params.customer_id
    )

    if (!row) {
      return NextResponse.json(
        { message: "Customer tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      customer_id: row[0],
      company_name: row[1],
      customer_type: row[2],
      pic_name: row[3],
      pic_position: row[4],
      email: row[5],
      phone: row[6],
      npwp: row[7],
      address: row[8],
      city: row[9],
      province: row[10],
      postal_code: row[11],
      status: row[12],
      notes: row[13],
      created_at: row[14],
      created_by: row[15],
    })
  } catch (error) {
    console.error("GET CUSTOMER DETAIL ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data customer" },
      { status: 500 }
    )
  }
}
