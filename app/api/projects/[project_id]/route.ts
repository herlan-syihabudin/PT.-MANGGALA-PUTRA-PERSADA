import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

/* ==============================
   CONFIG (SATU SPREADSHEET)
================================ */
const SHEET_ID = process.env.GSHEET_PROJECT_ID! // 🔥 SATU ID
const PROJECT_SHEET = "PROJECT MASTER"
const CUSTOMER_SHEET = "CUSTOMERS"

/* ==============================
   GET : PROJECT DETAIL + CUSTOMER
================================ */
export async function GET(
  _: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const [projectRes, customerRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${PROJECT_SHEET}!A2:I`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${CUSTOMER_SHEET}!A2:P`,
      }),
    ])

    const projectRows = projectRes.data.values || []
    const customerRows = customerRes.data.values || []

    const projectRow = projectRows.find(
      (r) => r[0]?.trim() === params.project_id
    )

    if (!projectRow) {
      return NextResponse.json(
        { message: "Project tidak ditemukan" },
        { status: 404 }
      )
    }

    const customerRow = customerRows.find(
      (c) => c[0]?.trim() === projectRow[2] // customer_id
    )

    const customer = customerRow
      ? {
          customer_id: customerRow[0],
          company_name: customerRow[1],
          customer_type: customerRow[2],
          pic_name: customerRow[3],
          pic_position: customerRow[4],
          email: customerRow[5],
          phone: customerRow[6],
          npwp: customerRow[7],
          address: customerRow[8],
          city: customerRow[9],
          province: customerRow[10],
          postal_code: customerRow[11],
          status: customerRow[12],
        }
      : null

    return NextResponse.json({
      project_id: projectRow[0],
      project_name: projectRow[1],

      // legacy (buat UI lama)
      client: customer?.company_name || projectRow[2],

      // relational
      customer_id: projectRow[2],
      customer,

      lokasi: projectRow[3],
      nilai_kontrak: Number(projectRow[4] || 0),
      start_date: projectRow[5],
      end_date: projectRow[6],
      status: projectRow[7],
      created_at: projectRow[8],
    })
  } catch (error) {
    console.error("GET PROJECT DETAIL ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil detail project" },
      { status: 500 }
    )
  }
}
