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

/* =====================================================
   HELPER : GET ALL ROWS
===================================================== */
async function getAllRows() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:P`,
  })

  return res.data.values || []
}

/* =====================================================
   GET : CUSTOMER DETAIL
===================================================== */
export async function GET(
  _: Request,
  { params }: { params: { customer_id: string } }
) {
  try {
    const rows = await getAllRows()

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

/* =====================================================
   PUT : UPDATE CUSTOMER
===================================================== */
export async function PUT(
  req: Request,
  { params }: { params: { customer_id: string } }
) {
  try {
    const body = await req.json()

    if (!body.company_name || !body.pic_name || !body.phone) {
      return NextResponse.json(
        { message: "Field wajib tidak lengkap" },
        { status: 400 }
      )
    }

    const rows = await getAllRows()

    const rowIndex = rows.findIndex(
      (r) => r[0] === params.customer_id
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Customer tidak ditemukan" },
        { status: 404 }
      )
    }

    const sheetRowNumber = rowIndex + 2

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${sheetRowNumber}:P${sheetRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          params.customer_id,
          body.company_name,
          body.customer_type,
          body.pic_name,
          body.pic_position,
          body.email,
          body.phone,
          body.npwp,
          body.address,
          body.city,
          body.province,
          body.postal_code,
          body.status || "Active",
          body.notes || "",
          rows[rowIndex][14], // keep created_at
          rows[rowIndex][15], // keep created_by
        ]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("UPDATE CUSTOMER ERROR:", error)
    return NextResponse.json(
      { message: "Gagal update customer" },
      { status: 500 }
    )
  }
}

/* =====================================================
   DELETE : SOFT DELETE (OPTIONAL)
===================================================== */
export async function DELETE(
  _: Request,
  { params }: { params: { customer_id: string } }
) {
  try {
    const rows = await getAllRows()

    const rowIndex = rows.findIndex(
      (r) => r[0] === params.customer_id
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Customer tidak ditemukan" },
        { status: 404 }
      )
    }

    const sheetRowNumber = rowIndex + 2

    // ubah status jadi Inactive
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!M${sheetRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["Inactive"]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE CUSTOMER ERROR:", error)
    return NextResponse.json(
      { message: "Gagal menghapus customer" },
      { status: 500 }
    )
  }
}
