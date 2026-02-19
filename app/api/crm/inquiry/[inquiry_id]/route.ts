import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= AUTH ================= */

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CRM_INQUIRY"

/* ================= CONSTANTS ================= */

const VALID_STATUS = ["new", "survey", "estimating", "sent", "won", "lost"] as const
type InquiryStatus = typeof VALID_STATUS[number]

const STATUS_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  new: ["survey"],
  survey: ["estimating"],
  estimating: ["sent"],
  sent: ["won", "lost"],
  won: [],
  lost: [],
}

const COLUMNS = {
  INQUIRY_ID: 0,
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

// Update COLUMN_MAP to include estimasi_nilai
const COLUMN_MAP: Record<string, string> = {
  assigned_to: "I",
  status: "J",
  prioritas: "K",
  lokasi: "L",
  catatan: "M",
  converted_rab_id: "N",
  converted_project_id: "O",
  estimasi_nilai: "G",
  stage: "R",
  converted_proposal_id: "S",
}

// All columns in order for full row update
const ALL_COLUMNS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S"
] as const

/* ================= HELPERS ================= */

const normalize = (val: any) => String(val || "").replace(/[\s-]/g, "").trim()

const safeStatus = (status: any): InquiryStatus => {
  const normalized = String(status || "new").toLowerCase().trim()
  return VALID_STATUS.includes(normalized as any) ? normalized as InquiryStatus : "new"
}

function mapRowToInquiry(row: any[]): any {
  const rawBudget = String(row[COLUMNS.ESTIMASI_NILAI] || "").replace(/[^\d]/g, "")
  const statusRaw = String(row[COLUMNS.STATUS] || "new").toLowerCase().trim()
  
  return {
    inquiry_id: row[COLUMNS.INQUIRY_ID] || "",
    tanggal_masuk: row[COLUMNS.TANGGAL_MASUK] || "",
    customer_id: row[COLUMNS.CUSTOMER_ID] || "",
    customer_name: row[COLUMNS.CUSTOMER_NAME] || "",
    nama_pekerjaan: row[COLUMNS.NAMA_PEKERJAAN] || "",
    layanan: row[COLUMNS.LAYANAN] || "",
    estimasi_nilai: rawBudget ? Number(rawBudget) : null,
    sumber: row[COLUMNS.SUMBER] || "",
    assigned_to: row[COLUMNS.ASSIGNED_TO] || "",
    status: safeStatus(statusRaw),
    prioritas: row[COLUMNS.PRIORITAS] || "normal",
    lokasi: row[COLUMNS.LOKASI] || "",
    catatan: row[COLUMNS.CATATAN] || "",
    converted_rab_id: row[COLUMNS.CONVERTED_RAB_ID] || "",
    converted_project_id: row[COLUMNS.CONVERTED_PROJECT_ID] || "",
    created_at: row[COLUMNS.CREATED_AT] || "",
    created_by: row[COLUMNS.CREATED_BY] || "",
    stage: row[COLUMNS.STAGE] || "NEW",
    converted_proposal_id: row[COLUMNS.CONVERTED_PROPOSAL_ID] || "",
  }
}

function rowFromInquiry(inquiry: any): any[] {
  return [
    inquiry.inquiry_id,
    inquiry.tanggal_masuk,
    inquiry.customer_id,
    inquiry.customer_name,
    inquiry.nama_pekerjaan,
    inquiry.layanan,
   inquiry.estimasi_nilai ?? "",
    inquiry.sumber,
    inquiry.assigned_to,
    inquiry.status,
    inquiry.prioritas,
    inquiry.lokasi,
    inquiry.catatan,
    inquiry.converted_rab_id,
    inquiry.converted_project_id,
    inquiry.created_at,
    inquiry.created_by,
    inquiry.stage,
    inquiry.converted_proposal_id,
  ]
}

/* ===================================================== */
/* ====================== GET DETAIL =================== */
/* ===================================================== */

export async function GET(
  req: Request,
  { params }: { params: { inquiry_id: string } }
) {
  try {
    const inquiryId = params.inquiry_id

    if (!inquiryId) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:S`,
    })

    const rows = (res.data.values || []).filter(r => r[COLUMNS.INQUIRY_ID])

    const rowIndex = rows.findIndex((r) =>
      normalize(r[COLUMNS.INQUIRY_ID]) === normalize(inquiryId)
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const row = rows[rowIndex]
    const data = mapRowToInquiry(row)

    // Cek apakah sudah dihapus (stage DELETED)
    if (data.stage === "DELETED") {
      return NextResponse.json(
        { message: "Inquiry telah dihapus" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error("Detail Inquiry Error:", error)
    return NextResponse.json(
      { message: "Gagal load detail inquiry: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}

/* ===================================================== */
/* ====================== PATCH UPDATE ================= */
/* ===================================================== */

export async function PATCH(
  req: Request,
  { params }: { params: { inquiry_id: string } }
) {
  try {
    const inquiryId = params.inquiry_id
    const body = await req.json()

    if (!inquiryId) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:S`,
    })

    const rows = (res.data.values || []).filter(r => r[COLUMNS.INQUIRY_ID])

    const rowIndex = rows.findIndex((r) =>
      normalize(r[COLUMNS.INQUIRY_ID]) === normalize(inquiryId)
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    // Ambil data existing
    const existingRow = rows[rowIndex]
    const existingData = mapRowToInquiry(existingRow)

    // Cek LOCK RULE: Jika sudah WON (converted_project_id ada), tidak bisa diubah
    if (existingData.converted_project_id) {
      return NextResponse.json(
        { message: "Inquiry sudah WON (converted_project_id sudah ada), tidak dapat diubah" },
        { status: 403 }
      )
    }

    // Cek apakah sudah dihapus
    if (existingData.stage === "DELETED") {
      return NextResponse.json(
        { message: "Inquiry telah dihapus, tidak dapat diubah" },
        { status: 403 }
      )
    }

    // SAFETY CHECK: Validasi status existing sebelum pake STATUS_TRANSITIONS
    const currentStatus = safeStatus(existingData.status)

    // Validasi STATUS TRANSITION jika ada update status
    if (body.status) {
      const newStatus = safeStatus(body.status)
      
      if (!VALID_STATUS.includes(newStatus)) {
        return NextResponse.json(
          { message: "Status tidak valid" },
          { status: 400 }
        )
      }

      const allowedTransitions = STATUS_TRANSITIONS[currentStatus]
      
      if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json(
          { 
            message: `Status tidak sesuai alur: dari ${currentStatus} hanya bisa ke ${allowedTransitions.join(", ")}` 
          },
          { status: 400 }
        )
      }

      // Cek lock untuk won/lost
      if (currentStatus === "won" || currentStatus === "lost") {
        return NextResponse.json(
          { message: `Inquiry dengan status ${currentStatus} tidak dapat diubah` },
          { status: 403 }
        )
      }
    }

    // Validasi khusus untuk converted_project_id
    if (body.converted_project_id && currentStatus !== "sent") {
      return NextResponse.json(
        { message: "Inquiry hanya bisa di-convert ke WON jika status sudah 'sent'" },
        { status: 400 }
      )
    }

    const actualRowNumber = rowIndex + 2 // karena data mulai dari A2

    /* ================= OPTIMIZED UPDATE ================= */
    
    // Mulai dengan data existing
    const mergedData = { ...existingData }
    
    // Merge dengan body, handle special cases
    for (const [key, value] of Object.entries(body)) {
      if (key === "estimasi_nilai") {
        // Clean budget
        const cleanedBudget = value ? Number(String(value).replace(/[^\d]/g, "")) : null
        mergedData.estimasi_nilai = cleanedBudget
      } 
      else if (key === "status") {
        mergedData.status = safeStatus(value as string)
      }
      else if (key in mergedData) {
        // @ts-ignore - dynamic assignment
        mergedData[key] = value
      }
    }

    // Konversi merged data ke row array
    const updatedRow = rowFromInquiry(mergedData)

    // Single update untuk seluruh row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${actualRowNumber}:S${actualRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updatedRow],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Inquiry berhasil diperbarui",
      data: mergedData
    })

  } catch (error) {
    console.error("Update Inquiry Error:", error)
    return NextResponse.json(
      { 
        success: false,
        message: "Gagal update inquiry: " + (error instanceof Error ? error.message : "Unknown error")
      },
      { status: 500 }
    )
  }
}
