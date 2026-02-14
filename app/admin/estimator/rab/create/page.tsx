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

const INQUIRY_SHEET = "INQUIRY"
const PROJECT_SHEET = "PROJECT MASTER"
const RAB_PROJECT = "RAB_PROJECT"

/* ===================================================== */
/* ================= CREATE RAB FROM INQUIRY =========== */
/* ===================================================== */

export async function POST(req: Request) {
  try {
    const { inquiry_id, created_by } = await req.json()

    if (!inquiry_id) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    /* ================= AMBIL DATA INQUIRY ================= */

    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${INQUIRY_SHEET}!A2:Z`,
    })

    const inquiryRows = inquiryRes.data.values || []

    const inquiry = inquiryRows.find(
      (r) => r[0] === inquiry_id
    )

    if (!inquiry) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const nama_pekerjaan = inquiry[2]
    const customer_id = inquiry[1]

    /* ================= CREATE PROJECT BARU ================= */

    const project_id = "PRJ-" + nanoid(6).toUpperCase()
    const rab_id = "RAB-" + nanoid(6).toUpperCase()
    const created_at = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PROJECT_SHEET}!A:J`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id,
          nama_pekerjaan,
          customer_id,
          "",
          0,
          "",
          "",
          "estimating",
          created_at
        ]]
      }
    })

    /* ================= CREATE RAB HEADER ================= */

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rab_id,
          project_id,
          nama_pekerjaan,
          customer_id,
          0,
          0,
          "Draft",
          inquiry_id,
          created_at
        ]]
      }
    })

    /* ================= UPDATE STATUS INQUIRY ================= */

    const inquiryIndex = inquiryRows.findIndex(
      (r) => r[0] === inquiry_id
    )

    if (inquiryIndex !== -1) {
      const rowNumber = inquiryIndex + 2

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${INQUIRY_SHEET}!H${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["converted"]],
        },
      })
    }

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
