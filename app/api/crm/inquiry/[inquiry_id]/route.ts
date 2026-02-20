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

  // 🔥 TAMBAHAN INI
  nama_pekerjaan: "E",
  layanan: "F",
  sumber: "H",
  customer_name: "D",
  customer_id: "C",
}

const HEADER_ROWS = 1
const ROW_OFFSET = HEADER_ROWS + 1
const SHEET_RANGE = `${SHEET_NAME}!A2:S` as const

const RETRYABLE_CODES = [408, 429, 502, 503] as const

/* ================= TYPES ================= */

interface Inquiry {
  inquiry_id: string
  tanggal_masuk: string
  customer_id: string
  customer_name: string
  nama_pekerjaan: string
  layanan: string
  estimasi_nilai: number | null
  sumber: string
  assigned_to: string
  status: InquiryStatus
  prioritas: string
  lokasi: string
  catatan: string
  converted_rab_id: string
  converted_project_id: string
  created_at: string
  created_by: string
  stage: string
  converted_proposal_id: string
}

/* ================= HELPERS ================= */

const normalize = (val: any) => String(val || "").replace(/[\s-]/g, "").trim()

const safeStatus = (status: any): InquiryStatus => {
  const normalized = String(status || "new").toLowerCase().trim()
  return VALID_STATUS.includes(normalized as any) ? normalized as InquiryStatus : "new"
}

function mapRowToInquiry(row: any[]): Inquiry {
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

function rowFromInquiry(inquiry: Inquiry): unknown[] {
  return [
    inquiry.inquiry_id,
    inquiry.tanggal_masuk,
    inquiry.customer_id,
    inquiry.customer_name,
    inquiry.nama_pekerjaan,
    inquiry.layanan,
    inquiry.estimasi_nilai ?? null,
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

/* ================= RETRY WRAPPER ================= */

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && RETRYABLE_CODES.includes(error.code)) {
      const baseDelay = 1000 * Math.pow(2, 3 - retries)
      const jitter = Math.random() * 100
      const delay = Math.min(baseDelay + jitter, 10000)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

/* ================= STRUCTURED LOGGING ================= */

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

    const res = await withRetry(() => 
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: SHEET_RANGE,
      })
    )

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

    if (data.stage === "DELETED") {
      return NextResponse.json(
        { message: "Inquiry telah dihapus" },
        { status: 404 }
      )
    }

    logger.info('GET Inquiry Success', { inquiryId })
    return NextResponse.json(data)

  } catch (error: any) {
    logger.error('GET Inquiry', error, { inquiryId: params.inquiry_id })

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
      503: { message: "Layanan Google Sheets sibuk", status: 503 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { message: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { message: "Gagal load detail inquiry" },
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

    // Validasi fields
    const allowedFields = Object.keys(COLUMN_MAP)
    const invalidFields = Object.keys(body).filter(
      key => !allowedFields.includes(key)
    )

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { message: `Field tidak valid: ${invalidFields.join(', ')}` },
        { status: 400 }
      )
    }

    const res = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: SHEET_RANGE,
      })
    )

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

    const existingRow = rows[rowIndex]
const existingData = mapRowToInquiry(existingRow)

const oldStatus = existingData.status
const oldAssigned = existingData.assigned_to

    // Lock rules
    if (existingData.converted_project_id) {
      return NextResponse.json(
        { message: "Inquiry sudah WON, tidak dapat diubah" },
        { status: 403 }
      )
    }

    if (existingData.stage === "DELETED") {
      return NextResponse.json(
        { message: "Inquiry telah dihapus" },
        { status: 403 }
      )
    }

    const currentStatus = safeStatus(existingData.status)
    let finalStatus = currentStatus

    // Status transition validation
    if (body.status) {
      const newStatus = safeStatus(body.status)
      const allowedTransitions = STATUS_TRANSITIONS[currentStatus]
      
      if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json(
          { message: `Status tidak sesuai alur: dari ${currentStatus} hanya bisa ke ${allowedTransitions.join(", ")}` },
          { status: 400 }
        )
      }
      finalStatus = newStatus
    }

    // Convert validation
   const newStatus = body.status ? safeStatus(body.status) : currentStatus
const finalRabId = body.converted_rab_id || existingData.converted_rab_id

if (newStatus === "won" && !finalRabId) {
  return NextResponse.json(
    { message: "Inquiry hanya bisa WON jika RAB sudah disetujui" },
    { status: 400 }
  )
}

    const actualRowNumber = rowIndex + ROW_OFFSET

    // Merge data
    const mergedData = { ...existingData }
    
    for (const [key, value] of Object.entries(body)) {
  if (key === "estimasi_nilai") {
    mergedData.estimasi_nilai = value
      ? Number(String(value).replace(/[^\d]/g, ""))
      : null

  } else if (key === "status") {
    mergedData.status = safeStatus(value as string)

  } else if (key === "converted_project_id") {
    mergedData.converted_project_id = value as string

  } else if (key in mergedData) {
    (mergedData as any)[key] = value
  }
}

    const updatedRow = rowFromInquiry(mergedData)

    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A${actualRowNumber}:S${actualRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [updatedRow] },
      })
    )

    if (body.status && body.status !== oldStatus) {
  await appendActivity({
    inquiry_id: inquiryId,
    type: "STATUS_CHANGE",
    description: `Status berubah ${oldStatus} → ${body.status}`,
    old_value: oldStatus,
    new_value: body.status,
    created_by: existingData.created_by || "System"
  })
}
    if (body.assigned_to && body.assigned_to !== oldAssigned) {
  await appendActivity({
    inquiry_id: inquiryId,
    type: "ASSIGNMENT_CHANGE",
    description: `Assigned ke ${body.assigned_to}`,
    old_value: oldAssigned,
    new_value: body.assigned_to,
    created_by: existingData.created_by || "System"
  })
}
    
    logger.info('PATCH Inquiry Success', { inquiryId, updates: Object.keys(body) })
    
    return NextResponse.json({
      success: true,
      message: "Inquiry berhasil diperbarui",
      data: mergedData
    })

  } catch (error: any) {
    logger.error('PATCH Inquiry', error, { inquiryId: params.inquiry_id })

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
      503: { message: "Layanan Google Sheets sibuk", status: 503 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { success: false, message: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    

    return NextResponse.json(
      { 
        success: false,
        message: "Gagal update inquiry"
      },
      { status: 500 }
    )
  }
}
