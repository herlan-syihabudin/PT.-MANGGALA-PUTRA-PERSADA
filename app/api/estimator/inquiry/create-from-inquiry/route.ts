import { NextResponse } from "next/server"
import { google } from "googleapis"
import { appendActivity } from "@/lib/crm/activity"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
function validateEnvironment() {
  const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_CRM_ID'] as const
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

validateEnvironment()

/* ================= GOOGLE AUTH ================= */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_CRM_ID!

/* ================= CONSTANTS ================= */
const INQUIRY_COLUMNS = {
  ID: 0,
  TANGGAL_MASUK: 1,
  CUSTOMER_ID: 2,
  CUSTOMER_NAME: 3,
  NAMA_PEKERJAAN: 4,
  LAYANAN: 5,
  ESTIMASI_NILAI: 6,
  SUMBER: 7,
  ASSIGNED_TO: 8,
  STATUS: 9,
  PRIORITAS: 10,
  LOKASI: 11,
  CATATAN: 12,
  CONVERTED_RAB_ID: 13,
  CONVERTED_PROJECT_ID: 14,
  CREATED_AT: 15,
  CREATED_BY: 16,
  STAGE: 17,
  CONVERTED_PROPOSAL_ID: 18,
} as const

const RAB_COLUMNS = {
  RAB_ID: 0,           // A
  INQUIRY_ID: 1,       // B
  PROJECT_NAME: 2,      // C
  CUSTOMER_ID: 3,       // D
  CUSTOMER_NAME: 4,     // E
  TOTAL_ITEMS: 5,       // F
  TOTAL_VALUE: 6,       // G
  STATUS: 7,            // H
  MARGIN: 8,            // I
  PPN: 9,               // J
  NOTES: 10,            // K
  CREATED_BY: 11,       // L
  CREATED_AT: 12,       // M
  APPROVED_BY: 13,      // N
  APPROVED_AT: 14,      // O
} as const

/* ================= LOGGER ================= */
const logger = {
  error: (context: string, error: any, metadata: any = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      context,
      error: {
        message: error?.message,
        stack: error?.stack,
        code: error?.code
      },
      ...metadata
    }))
  },
  info: (context: string, metadata: any = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      context,
      ...metadata
    }))
  }
}

/* ================= CREATE RAB ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { inquiry_id } = body

    if (!inquiry_id) {
      return NextResponse.json(
        { error: "inquiry_id wajib diisi" },
        { status: 400 }
      )
    }

    logger.info('Create RAB requested', { inquiry_id })

    /* ============================
       1️⃣ AMBIL DATA INQUIRY
    ============================ */
    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!A2:S`,
    })

    const rows = inquiryRes.data.values || []
    const inquiryRow = rows.find(r => r[INQUIRY_COLUMNS.ID] === inquiry_id)

    if (!inquiryRow) {
      return NextResponse.json(
        { error: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    /* ============================
       2️⃣ CEK DUPLIKAT RAB
    ============================ */
    if (inquiryRow[INQUIRY_COLUMNS.CONVERTED_RAB_ID]) {
      return NextResponse.json(
        { 
          error: "Inquiry sudah memiliki RAB",
          rab_id: inquiryRow[INQUIRY_COLUMNS.CONVERTED_RAB_ID]
        },
        { status: 409 }
      )
    }

    /* ============================
   3️⃣ VALIDASI STATUS
============================ */
const currentStatus = (inquiryRow[INQUIRY_COLUMNS.STATUS] || "").toString().toLowerCase()

if (currentStatus !== "estimating") {
  return NextResponse.json(
    { error: `Inquiry dengan status ${currentStatus} tidak bisa dibuat RAB` },
    { status: 400 }
  )
}

    /* ============================
       4️⃣ GENERATE RAB ID
    ============================ */
    const rabId = `RAB-${Date.now()}`
    const now = new Date().toISOString()
    
    // Extract data dari inquiry
    const estimasiNilai = Number(
      String(inquiryRow[INQUIRY_COLUMNS.ESTIMASI_NILAI] || 0).replace(/[^\d]/g, "")
    )

    /* ============================
       5️⃣ INSERT KE RAB_PROJECT
    ============================ */
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `RAB_PROJECT!A:O`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rabId,
          inquiry_id,
          inquiryRow[INQUIRY_COLUMNS.NAMA_PEKERJAAN] || "Untitled Project",
          inquiryRow[INQUIRY_COLUMNS.CUSTOMER_ID] || "",
          inquiryRow[INQUIRY_COLUMNS.CUSTOMER_NAME] || "-",
          0,                    // total_items (akan diisi nanti)
          estimasiNilai,        // total_value dari inquiry
          "draft",              // status
          "",                   // margin
          "",                   // ppn
          "",                   // notes
          "Estimator",          // created_by
          now,
          "",                   // approved_by
          "",                   // approved_at
        ]],
      },
    })

    /* ============================
       6️⃣ UPDATE INQUIRY
    ============================ */
    const rowIndex = rows.findIndex(r => r[INQUIRY_COLUMNS.ID] === inquiry_id)
    const actualRow = rowIndex + 2 // +2 karena header dan index mulai 0

    // Update status ke "estimating"
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!J${actualRow}`, // Kolom STATUS
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["estimating"]],
      },
    })

    // Update converted_rab_id
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!N${actualRow}`, // Kolom CONVERTED_RAB_ID
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[rabId]],
      },
    })

    logger.info('RAB created successfully', { 
      rab_id: rabId, 
      inquiry_id,
      estimasi_nilai: estimasiNilai 
    })

    await appendActivity({
  inquiry_id,
  type: "RAB_CREATED",
  description: `Convert ke RAB ${rabId}`,
  old_value: "",
  new_value: rabId,
  created_by: "Estimator"
})
    
    return NextResponse.json({
      success: true,
      rab_id: rabId,
      message: "RAB berhasil dibuat",
      data: {
        rab_id: rabId,
        inquiry_id,
        project_name: inquiryRow[INQUIRY_COLUMNS.NAMA_PEKERJAAN],
        customer_name: inquiryRow[INQUIRY_COLUMNS.CUSTOMER_NAME],
        estimasi_nilai: estimasiNilai,
      }
    })

  } catch (error: any) {
    logger.error('Create RAB Error', error)

    // Map error codes
    if (error.code === 404) {
      return NextResponse.json(
        { error: "Sheet tidak ditemukan" },
        { status: 404 }
      )
    }

    if (error.code === 403) {
      return NextResponse.json(
        { error: "Akses ke Google Sheets ditolak" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "Gagal membuat RAB" },
      { status: 500 }
    )
  }
}
