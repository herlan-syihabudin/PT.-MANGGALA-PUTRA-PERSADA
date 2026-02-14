import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

/* ================= AUTH ================= */

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

const PROJECT_SHEET = "PROJECT MASTER"
const RAB_PROJECT = "RAB_PROJECT"

/* ===================================================== */
/* ================= CREATE RAB HEADER ================= */
/* ===================================================== */

export async function POST(req: Request) {
  try {
    const { project_id, created_by } = await req.json()

    if (!project_id) {
      return NextResponse.json(
        { message: "project_id wajib" },
        { status: 400 }
      )
    }

    /* ================= CHECK PROJECT EXIST ================= */

    const projectRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PROJECT_SHEET}!A2:J`,
    })

    const projectRows = projectRes.data.values || []

    const project = projectRows.find(
      (r) => r[0] === project_id
    )

    if (!project) {
      return NextResponse.json(
        { message: "Project tidak ditemukan" },
        { status: 404 }
      )
    }

    const project_name = project[1]
    const customer_id = project[2]

    /* ================= CHECK RAB EXIST ================= */

    const rabRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:I`,
    })

    const rabRows = rabRes.data.values || []

    const existing = rabRows.find(
      (r) => r[1] === project_id
    )

    if (existing) {
      return NextResponse.json({
        message: "RAB sudah ada",
        rab_id: existing[0],
        project_id,
      })
    }

    /* ================= CREATE NEW RAB ================= */

    const rab_id = "RAB-" + nanoid(6).toUpperCase()
    const created_at = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rab_id,          // A
          project_id,      // B
          project_name,    // C
          customer_id,     // D
          0,               // E total_item
          0,               // F total_value
          "Draft",         // G status
          "",              // H linked_inquiry_id (optional)
          created_at       // I created_at
        ]]
      }
    })

    return NextResponse.json({
      message: "RAB berhasil dibuat",
      rab_id,
      project_id,
    })

  } catch (error) {
    console.error("CREATE RAB ERROR:", error)

    return NextResponse.json(
      { message: "Gagal membuat RAB" },
      { status: 500 }
    )
  }
}
