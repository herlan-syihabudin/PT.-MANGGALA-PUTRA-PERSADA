import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

const INQUIRY_SHEET = "CRM_INQUIRY"
const PROJECT_SHEET = "PROJECT MASTER"
const RAB_PROJECT = "RAB_PROJECT"

export async function POST(req: Request) {
  try {
    const { inquiry_id, created_by } = await req.json()

    if (!inquiry_id) {
      return NextResponse.json({ message: "inquiry_id wajib" }, { status: 400 })
    }

    // ===== GET INQUIRY =====
    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${INQUIRY_SHEET}!A2:Q`, // aman, karena sheet kamu sampai created_by
    })

    const inquiryRows = inquiryRes.data.values || []
    const inquiryIndex = inquiryRows.findIndex((r) => r[0] === inquiry_id)

    if (inquiryIndex === -1) {
      return NextResponse.json({ message: "Inquiry tidak ditemukan" }, { status: 404 })
    }

    const inquiry = inquiryRows[inquiryIndex]

    // CRM_INQUIRY columns (0-based):
    // 0 inquiry_id
    // 2 customer_id
    // 3 customer_name
    // 4 nama_pekerjaan
    // 9 status
    // 11 lokasi
    // 13 converted_rab_id
    // 14 converted_project_id
    const customer_id = inquiry[2] || ""
    const customer_name = inquiry[3] || ""
    const nama_pekerjaan = inquiry[4] || ""
    const lokasi = inquiry[11] || ""

    // ===== CHECK: SUDAH PERNAH CONVERT? (optional tapi penting) =====
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

    // ===== CREATE PROJECT =====
    const project_id = "PRJ-" + nanoid(8).toUpperCase()

    await sheets.spreadsheets.values.append({
  spreadsheetId: SHEET_ID,
  range: `${PROJECT_SHEET}!A:J`,
  valueInputOption: "USER_ENTERED",
  requestBody: {
    values: [[
      project_id,        // A
      nama_pekerjaan,    // B
      customer_id,       // C
      lokasi,            // D
      0,                 // E nilai_kontrak
      "",                // F start_date
      "",                // G end_date
      "planning",        // H status
      created_at,        // I created_at
      "MEP"              // J project_type (atau kosong "")
    ]]
  }
})

    // ===== CREATE RAB HEADER =====
    const rab_id = "RAB-" + nanoid(6).toUpperCase()

    // RAB_PROJECT: A..K (11 kolom)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A:K`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rab_id,                 // A rab_id
          inquiry_id,             // B inquiry_id
          project_id,             // C project_id
          nama_pekerjaan,         // D project_name
          customer_name,          // E customer_name
          0,                      // F total_item
          0,                      // G total_nilai_rab
          "Draft",                // H status
          "Estimator",            // I aksi (atau kosong "")
          created_by || "Estimator", // J created_by
          created_at,             // K created_at
        ]],
      },
    })

    // ===== UPDATE INQUIRY: status + converted ids =====
    const row = inquiryIndex + 2

    // status ada di kolom J (10) pada sheet => J{row}
    // converted_rab_id kolom N (14th col) => N{row}
    // converted_project_id kolom O (15th col) => O{row}
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${INQUIRY_SHEET}!J${row}:O${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          "estimating", // J status
          inquiry[10] || "", // K prioritas (biarin tetap kalau ada)
          inquiry[11] || "", // L lokasi (biarin tetap)
          inquiry[12] || "", // M catatan (biarin tetap)
          rab_id,       // N converted_rab_id
          project_id,   // O converted_project_id
        ]],
      },
    })

    return NextResponse.json({
      message: "RAB berhasil dibuat",
      rab_id,
      project_id,
    })
  } catch (error) {
    console.error("CREATE RAB ERROR:", error)
    return NextResponse.json({ message: "Gagal membuat RAB" }, { status: 500 })
  }
}
