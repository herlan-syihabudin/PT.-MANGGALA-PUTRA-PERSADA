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

const SHEET_ID = process.env.GSHEET_PROJECT_ID!
const SHEET_NAME = "CUSTOMERS"

/* ==============================
   GET : LIST CUSTOMER
================================ */
export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:P`,
    })

    const rows = res.data.values || []

    const customers = rows
      .filter((r) => r[0]) // ⛔ skip empty row
      .map((r) => ({
        customer_id: r[0],
        company_name: r[1],
        customer_type: r[2],
        pic_name: r[3],
        pic_position: r[4],
        email: r[5],
        phone: r[6],
        npwp: r[7],
        address: r[8],
        city: r[9],
        province: r[10],
        postal_code: r[11],
        status: r[12] || "Active",
        notes: r[13],
        created_at: r[14],
        created_by: r[15],
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )

    return NextResponse.json(customers)
  } catch (error) {
    console.error("GET CUSTOMER ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data customer" },
      { status: 500 }
    )
  }
}

/* ==============================
   POST : CREATE CUSTOMER
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      company_name,
      customer_type = "Owner",
      pic_name,
      pic_position = "",
      email = "",
      phone,
      npwp = "",
      address = "",
      city = "",
      province = "",
      postal_code = "",
      status = "Active",
      notes = "",
    } = body

    // VALIDATION
    if (!company_name || !pic_name || !phone) {
      return NextResponse.json(
        { message: "Nama perusahaan, PIC, dan telepon wajib diisi" },
        { status: 400 }
      )
    }

    const customer_id = `CUST-${Date.now()}`
    const created_at = new Date().toISOString()
    const created_by = "admin"

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:P`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          customer_id,
          company_name.trim(),
          customer_type,
          pic_name.trim(),
          pic_position,
          email.trim(),
          phone.trim(),
          npwp,
          address,
          city,
          province,
          postal_code,
          status,
          notes,
          created_at,
          created_by,
        ]],
      },
    })

    return NextResponse.json(
      {
        customer_id,
        message: "Customer berhasil ditambahkan",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error)
    return NextResponse.json(
      { message: "Gagal menyimpan customer" },
      { status: 500 }
    )
  }
}
