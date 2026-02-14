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

const CRM_SHEET_ID = process.env.GSHEET_CRM_ID!
const EST_SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

const CRM_SHEET = "CRM_INQUIRY"
const RAB_SHEET = "RAB_PROJECT"

/* ================= CONVERT ================= */

export async function POST(req: Request) {
  try {
    const { inquiry_id } = await req.json()

    if (!inquiry_id) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    /* ================= GET INQUIRY ================= */

    const crmRes = await sheets.spreadsheets.values.get({
      spreadsheetId: CRM_SHEET_ID,
      range: `${CRM_SHEET}!A2:Q`,
    })

    const rows = crmRes.data.values || []
    const rowIndex = rows.findIndex(r => r[0] === inquiry_id)

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const row = rows[rowIndex]
    const sheetRowNumber = rowIndex + 2

    const projectName = row[4]
    const customerName = row[3]
    const currentStatus = row[9]

    /* ================= SAFETY CHECK ================= */

    if (currentStatus === "estimating") {
      return NextResponse.json(
        { message: "Inquiry sudah pernah di-convert ke RAB" },
        { status: 400 }
      )
    }

    if (currentStatus !== "won") {
      return NextResponse.json(
        { message: "Inquiry harus status WON sebelum convert ke RAB" },
        { status: 400 }
      )
    }

    /* ================= GENERATE ID ================= */

    const rabId = "RAB-" + nanoid(6).toUpperCase()
    const projectId = "PRJ-" + nanoid(8).toUpperCase()
    const createdAt = new Date().toISOString()

    /* ================= INSERT RAB PROJECT ================= */

    await sheets.spreadsheets.values.append({
      spreadsheetId: EST_SHEET_ID,
      range: `${RAB_SHEET}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rabId,            // A
          projectId,        // B
          projectName,      // C
          customerName,     // D
          0,                // E total_item
          0,                // F total_value
          "Draft",          // G status
          inquiry_id,       // H linked_inquiry_id
          createdAt         // I created_at
        ]]
      }
    })

    /* ================= UPDATE CRM ================= */

    await sheets.spreadsheets.values.update({
      spreadsheetId: CRM_SHEET_ID,
      range: `${CRM_SHEET}!J${sheetRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["estimating"]]
      }
    })

    return NextResponse.json({
      message: "Berhasil convert ke RAB",
      rab_id: rabId,
      project_id: projectId
    })

  } catch (error) {
    console.error("Convert Error:", error)

    return NextResponse.json(
      { message: "Gagal convert inquiry" },
      { status: 500 }
    )
  }
}
