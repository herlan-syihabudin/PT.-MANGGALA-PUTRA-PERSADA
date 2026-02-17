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

/* ================= HELPER ================= */

const normalize = (val: any) =>
  String(val || "").trim().toLowerCase()

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

    const rowIndex = rows.findIndex(
      r => String(r[0]).trim() === String(inquiry_id).trim()
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const row = rows[rowIndex]
    const sheetRowNumber = rowIndex + 2

    const projectName = row[4] || "Tanpa Nama Project"
    const customerName = row[3] || "-"
    const currentStatus = normalize(row[9])
    const convertedRabId = row[13] || ""

    /* ================= SAFETY CHECK ================= */

    // 1️⃣ Harus status ESTIMATING
    if (currentStatus !== "estimating") {
      return NextResponse.json(
        { message: "Inquiry harus status ESTIMATING sebelum convert ke RAB" },
        { status: 400 }
      )
    }

    // 2️⃣ Tidak boleh sudah pernah convert
    if (convertedRabId) {
      return NextResponse.json(
        { message: "Inquiry sudah pernah di-convert ke RAB" },
        { status: 400 }
      )
    }

    /* ================= GENERATE ID ================= */

    const rabId = "RAB-" + nanoid(6).toUpperCase()
const createdAt = new Date().toISOString()

    /* ================= INSERT RAB PROJECT ================= */

    await sheets.spreadsheets.values.append({
  spreadsheetId: EST_SHEET_ID,
  range: `${RAB_SHEET}!A:K`,
  valueInputOption: "USER_ENTERED",
  requestBody: {
    values: [[
  rabId,
  inquiry_id,
  "",                 // project_id kosong dulu
  projectName,
  customerName,
  0,
  0,
  "Draft",
  "Estimator",
  "System",
  createdAt
]]
  }
})

    /* ================= UPDATE CRM ================= */

   await sheets.spreadsheets.values.update({
  spreadsheetId: CRM_SHEET_ID,
  range: `${CRM_SHEET}!N${sheetRowNumber}:O${sheetRowNumber}`,
  valueInputOption: "USER_ENTERED",
  requestBody: {
    values: [[
      rabId,   // col N
      ""       // col O kosong dulu
    ]]
  }
})

    return NextResponse.json({
  success: true,
  message: "Berhasil convert ke RAB",
  rab_id: rabId
})

  } catch (error) {
    console.error("Convert Error:", error)

    return NextResponse.json(
      { message: "Gagal convert inquiry" },
      { status: 500 }
    )
  }
}
