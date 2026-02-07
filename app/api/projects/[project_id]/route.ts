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

const PROJECT_SHEET_ID = process.env.GSHEET_PROJECT_ID!
const PROJECT_SHEET = "PROJECT MASTER"

const CUSTOMER_SHEET_ID = process.env.GSHEET_CRM_ID!
const CUSTOMER_SHEET = "CUSTOMER_MASTER"

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
        spreadsheetId: PROJECT_SHEET_ID,
        range: `${PROJECT_SHEET}!A2:I`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: CUSTOMER_SHEET_ID,
        range: `${CUSTOMER_SHEET}!A2:Z`,
      }),
    ])

    const projectRows = projectRes.data.values || []
    const customerRows = customerRes.data.values || []

    const row = projectRows.find((r) => r[0] === params.project_id)

    if (!row) {
      return NextResponse.json(
        { message: "Project tidak ditemukan" },
        { status: 404 }
      )
    }

    const customerRow = customerRows.find(
      (c) => c[0] === row[2] // customer_id
    )

    const customer = customerRow
      ? {
          customer_id: customerRow[0],
          company_name: customerRow[1],
          customer_type: customerRow[2],
          pic_name: customerRow[3],
          pic_position: customerRow[4],
          phone: customerRow[5],
          email: customerRow[6],
          address: customerRow[7],
          city: customerRow[8],
          province: customerRow[9],
          status: customerRow[10],
        }
      : null

    const project = {
      project_id: row[0],
      project_name: row[1],

      // ⚠️ legacy field (jangan dihapus)
      client: customer?.company_name || row[2],

      // ✅ relational
      customer_id: row[2],
      customer,

      lokasi: row[3],
      nilai_kontrak: Number(row[4] || 0),
      start_date: row[5],
      end_date: row[6],
      status: row[7],
      created_at: row[8],
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("GET PROJECT DETAIL ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil detail project" },
      { status: 500 }
    )
  }
}
