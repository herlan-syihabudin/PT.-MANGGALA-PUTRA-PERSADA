import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

// ===== AUTH =====
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

// ===== SPREADSHEET IDs =====
const CRM_SHEET_ID = process.env.GSHEET_CRM_ID!
const ESTIMATOR_SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

// ===== SHEET NAMES =====
const INQUIRY_SHEET = "CRM_INQUIRY"
const PROJECT_SHEET = "PROJECT MASTER"
const RAB_PROJECT = "RAB_PROJECT"

export async function POST(req: Request) {
  try {
    const { inquiry_id, created_by } = await req.json()

    if (!inquiry_id) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    // =====================================================
    // 1️⃣ GET INQUIRY (DARI CRM SHEET)
    // =====================================================
    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: CRM_SHEET_ID,
      range: `${INQUIRY_SHEET}!A2:Q`,
    })

    const inquiryRows = inquiryRes.data.values || []
    const inquiryIndex = inquiryRows.findIndex(
      (r) => r[0] === inquiry_id
    )

    if (inquiryIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const inquiry = inquiryRows[inquiryIndex]

    const customer_id = inquiry[2] || ""
    const customer_name = inquiry[3] || ""
    const nama_pekerjaan = inquiry[4] || ""
    const lokasi = inquiry[11] || ""

    const alreadyRab = inquiry[13]
    const alreadyProject = inquiry[14]

    if (alreadyRab && alreadyProject) {
      return NextResponse.json({
        message: "Inquiry sudah pernah dibuatkan RAB",
        rab_id: alreadyRab,
        project_id: alreadyProject,
      })
    }

    const created_at = new Date().toISOString()

    // =====================================================
    // 2️⃣ CREATE PROJECT (KE ESTIMATOR SHEET)
    // =====================================================
    const project_id = "PRJ-" + nanoid(8).toUpperCase()

    await sheets.spreadsheets.values.append({
      spreadsheetId: ESTIMATOR_SHEET_ID,
      range: `${PROJECT_SHEET}!A:J`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id,
          nama_pekerjaan,
          customer_id,
          lokasi,
          0,
          "",
          "",
          "planning",
          created_at,
          "MEP"
        ]]
      }
    })

    // =====================================================
    // 3️⃣ CREATE RAB HEADER (KE ESTIMATOR SHEET)
    // =====================================================
    const rab_id = "RAB-" + nanoid(6).toUpperCase()

    await sheets.spreadsheets.values.append({
      spreadsheetId: ESTIMATOR_SHEET_ID,
      range: `${RAB_PROJECT}!A:K`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rab_id,
          inquiry_id,
          project_id,
          nama_pekerjaan,
          customer_name,
          0,
          0,
          "Draft",
          "Estimator",
          created_by || "Estimator",
          created_at,
        ]]
      }
    })

    // =====================================================
    // 4️⃣ UPDATE INQUIRY STATUS + CONVERTED IDS
    // =====================================================
    const row = inquiryIndex + 2

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CRM_SHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: `${INQUIRY_SHEET}!J${row}`,
            values: [["estimating"]],
          },
          {
            range: `${INQUIRY_SHEET}!N${row}:O${row}`,
            values: [[rab_id, project_id]],
          },
        ],
      },
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
