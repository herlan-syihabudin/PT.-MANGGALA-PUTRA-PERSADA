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
const SHEET_NAME = "PROJECT MASTER"

/* ==============================
   GET : PROJECT LIST
================================ */
export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:I`,
    })

    const rows = res.data.values || []

    // 🔥 skip header (row 1)
    const dataRows = rows.slice(1)

    const projects = dataRows.map((r) => ({
      project_id: r[0] ?? "",
      project_name: r[1] ?? "",
      client: r[2] ?? "",
      lokasi: r[3] ?? "",
      nilai_kontrak: Number(r[4] ?? 0),
      start_date: r[5] ?? "",
      end_date: r[6] ?? "",
      status: r[7] ?? "",
      created_at: r[8] ?? "",
    }))

    return NextResponse.json(projects)
  } catch (error) {
    console.error("GET PROJECT ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data project" },
      { status: 500 }
    )
  }
}

/* ==============================
   POST : CREATE PROJECT
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      project_name,
      client,
      lokasi,
      nilai_kontrak,
      start_date,
      end_date,
      status,
    } = body

    // VALIDATION (ROOT LEVEL)
    if (!project_name || !client || !nilai_kontrak || !start_date || !status) {
      return NextResponse.json(
        { message: "Field wajib belum lengkap" },
        { status: 400 }
      )
    }

    const project_id = `PRJ-${Date.now()}`
    const created_at = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id,
          project_name,
          client,
          lokasi || "",
          nilai_kontrak,
          start_date,
          end_date || "",
          status,
          created_at,
        ]],
      },
    })

    return NextResponse.json(
      { project_id, message: "Project berhasil dibuat" },
      { status: 201 }
    )
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error)
    return NextResponse.json(
      { message: "Gagal menyimpan project" },
      { status: 500 }
    )
  }
}
