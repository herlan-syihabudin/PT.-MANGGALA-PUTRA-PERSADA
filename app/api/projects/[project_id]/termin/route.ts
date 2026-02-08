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

const SHEET_ID = process.env.GSHEET_PROJECT_ID!
const TERMIN_SHEET = "PROJECT_TERMIN"

export async function GET(
  _: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TERMIN_SHEET}!A2:I`,
    })

    const rows = res.data.values || []

    const termins = rows
      .filter((r) => r[0] === params.project_id)
      .map((r) => ({
        project_id: r[0],
        termin_no: Number(r[1]),
        description: r[2],
        percent: Number(r[3]),
        value: Number(r[4]),
        status: r[5],
        due_date: r[6],
        paid_date: r[7],
        created_at: r[8],
      }))

    return NextResponse.json(termins)
  } catch (err) {
    console.error("GET TERMIN ERROR:", err)
    return NextResponse.json(
      { message: "Gagal mengambil termin" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const body = await req.json()
    const {
      termin_no,
      description,
      percent,
      value,
      due_date,
    } = body

    if (!termin_no || !percent || !value) {
      return NextResponse.json(
        { message: "Field wajib belum lengkap" },
        { status: 400 }
      )
    }

    const created_at = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${TERMIN_SHEET}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          params.project_id,
          termin_no,
          description || "",
          percent,
          value,
          "Draft",
          due_date || "",
          "",
          created_at,
        ]],
      },
    })

    return NextResponse.json(
      { message: "Termin berhasil dibuat" },
      { status: 201 }
    )
  } catch (err) {
    console.error("CREATE TERMIN ERROR:", err)
    return NextResponse.json(
      { message: "Gagal membuat termin" },
      { status: 500 }
    )
  }
}

