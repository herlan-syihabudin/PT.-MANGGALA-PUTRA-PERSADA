import { NextResponse } from "next/server"
import { google } from "googleapis"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

/* ========== ENV & GOOGLE AUTH ========== */

const requiredEnv = ["GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY", "GSHEET_CRM_ID"] as const
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`[CRM_INQUIRY] Missing required env var: ${key}`)
  }
}

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CRM_INQUIRY"
const RETRYABLE = [408, 429, 502, 503]

/* ========== COLUMN MAPPING ========== */

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

type InquiryStatus = "new" | "survey" | "estimating" | "sent" | "lost" | "won"

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

interface InquirySummary {
  total: number
  active: number
  new: number
  survey: number
  estimating: number
  sent: number
  won: number
  lost: number
  pipeline_value: number
  conversion_rate: number
  avg_deal_value: number
}

/* ========== HELPERS ========== */

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    const code = Number(error.code || error.response?.status)
    if (retries > 0 && RETRYABLE.includes(code)) {
      await new Promise(r => setTimeout(r, 1000 * (4 - retries)))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

const VALID_STATUS: InquiryStatus[] = [
  "new",
  "survey",
  "estimating",
  "sent",
  "lost",
  "won",
]

const STATUS_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  new: ["survey"],
  survey: ["estimating"],
  estimating: ["sent"],
  sent: ["won", "lost"],
  won: [],
  lost: [],
}

const normalize = (val: unknown) =>
  String(val ?? "").replace(/\s+/g, "").trim()

function sanitize(value: unknown, allowHtml = false): string {
  if (!value) return ""
  let str = String(value).trim()
  if (!allowHtml) {
    str = str.replace(/[<>]/g, "") // hapus < > untuk keamanan
  }
  // Prevent formula injection
  return str.replace(/^[=+\-@]/, "")
}

const parseDate = (val?: string) => {
  if (!val) return 0
  const ts = Date.parse(val)
  return Number.isNaN(ts) ? 0 : ts
}

function parseNumber(val: unknown): number | null {
  if (!val) return null
  const cleaned = String(val).replace(/[^\d]/g, "")
  if (!cleaned) return null
  const num = Number(cleaned)
  return Number.isNaN(num) ? null : num
}

function mapRowToInquiry(row: any[]): Inquiry {
  const statusRaw = String(row[COLUMNS.STATUS] || "new")
    .toLowerCase()
    .trim()

  const status: InquiryStatus = VALID_STATUS.includes(statusRaw as InquiryStatus)
    ? (statusRaw as InquiryStatus)
    : "new"

  return {
    inquiry_id: row[COLUMNS.INQUIRY_ID] || "",
    tanggal_masuk: row[COLUMNS.TANGGAL_MASUK] || "",
    customer_id: row[COLUMNS.CUSTOMER_ID] || "",
    customer_name: row[COLUMNS.CUSTOMER_NAME] || "",
    nama_pekerjaan: row[COLUMNS.NAMA_PEKERJAAN] || "",
    layanan: row[COLUMNS.LAYANAN] || "",
    estimasi_nilai: parseNumber(row[COLUMNS.ESTIMASI_NILAI]),
    sumber: row[COLUMNS.SUMBER] || "",
    assigned_to: row[COLUMNS.ASSIGNED_TO] || "",
    status,
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

function rowFromInquiry(inquiry: Inquiry): any[] {
  return [
    inquiry.inquiry_id,
    inquiry.tanggal_masuk,
    inquiry.customer_id,
    inquiry.customer_name,
    inquiry.nama_pekerjaan,
    inquiry.layanan,
    inquiry.estimasi_nilai || "",
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

function calculateSummary(data: Inquiry[]): InquirySummary {
  const total = data.length
  const won = data.filter(i => i.converted_project_id).length
  const wonValues = data
    .filter(i => i.converted_project_id && i.estimasi_nilai)
    .map(i => i.estimasi_nilai as number)
  
  const avgDealValue = wonValues.length > 0
    ? Math.round(wonValues.reduce((a, b) => a + b, 0) / wonValues.length)
    : 0

  return {
    total,
    active: data.filter(i => !i.converted_project_id && i.status !== "lost").length,
    new: data.filter(i => i.status === "new").length,
    survey: data.filter(i => i.status === "survey").length,
    estimating: data.filter(i => i.status === "estimating").length,
    sent: data.filter(i => i.status === "sent").length,
    won,
    lost: data.filter(i => i.status === "lost").length,
    pipeline_value: data
      .filter(i => !i.converted_project_id && i.status !== "lost")
      .reduce((acc, i) => acc + (i.estimasi_nilai || 0), 0),
    conversion_rate: total > 0 ? Number(((won / total) * 100).toFixed(1)) : 0,
    avg_deal_value: avgDealValue,
  }
}

/* ========== GET ========== */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)))
    const filterStatus = searchParams.get("status")
    const filterCustomerId = searchParams.get("customer_id")

    if (filterStatus) {
      const normalizedStatus = filterStatus.toLowerCase()
      if (!VALID_STATUS.includes(normalizedStatus as InquiryStatus)) {
        return NextResponse.json(
          { message: "Status tidak valid. Gunakan: new, survey, estimating, sent, lost, won" },
          { status: 400 }
        )
      }
    }

    const res = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:S`,
    }))

    const rows = (res.data.values || []).filter((r) => r[COLUMNS.INQUIRY_ID])
    let data: Inquiry[] = rows.map(mapRowToInquiry)

    if (filterCustomerId) {
      data = data.filter((i) => normalize(i.customer_id) === normalize(filterCustomerId))
    }

    if (filterStatus) {
      const normalizedStatus = filterStatus.toLowerCase() as InquiryStatus
      data = data.filter((i) => i.status === normalizedStatus)
    }

    data.sort((a, b) => parseDate(b.tanggal_masuk) - parseDate(a.tanggal_masuk))

    const summary = calculateSummary(data)

    const start = (page - 1) * limit
    const paginated = data.slice(start, start + limit)

    return NextResponse.json({
      data: paginated,
      summary,
      page,
      totalPages: Math.ceil(data.length / limit),
    })
  } catch (error) {
    console.error("GET Inquiry Error:", error)
    return NextResponse.json(
      { message: "Gagal load inquiry: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}

/* ========== POST ========== */

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.customer_id || !String(body.customer_id).trim()) {
      return NextResponse.json(
        { message: "Customer ID wajib diisi" },
        { status: 400 }
      )
    }

    if (!body.customer_name || !String(body.customer_name).trim()) {
      return NextResponse.json(
        { message: "Nama customer wajib diisi" },
        { status: 400 }
      )
    }

    if (!body.nama_pekerjaan || !String(body.nama_pekerjaan).trim()) {
      return NextResponse.json(
        { message: "Nama Pekerjaan wajib diisi" },
        { status: 400 }
      )
    }

    if (String(body.nama_pekerjaan).length > 200) {
      return NextResponse.json(
        { message: "Nama pekerjaan terlalu panjang" },
        { status: 400 }
      )
    }

    const inquiryId = `INQ-${randomUUID()}`
    const now = new Date().toISOString()
    const today = new Date().toISOString().split("T")[0]

    const budget = parseNumber(body.estimasi_nilai)
    const createdBy = "MARKETING" // TODO: from session

    const values = [[
      inquiryId,
      body.tanggal_masuk || today,
      sanitize(body.customer_id),
      sanitize(body.customer_name),
      sanitize(body.nama_pekerjaan),
      sanitize(body.layanan),
      budget || "",
      sanitize(body.sumber),
      sanitize(body.assigned_to),
      "new",
      sanitize(body.prioritas || "normal"),
      sanitize(body.lokasi),
      sanitize(body.catatan),
      "",
      "",
      now,
      createdBy,
      "NEW",
      "",
    ]]

    await withRetry(() => sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:S`,
      valueInputOption: "RAW",
      requestBody: { values },
    }))

    return NextResponse.json({
      success: true,
      inquiry_id: inquiryId,
      message: "Inquiry berhasil dibuat",
    })
  } catch (error) {
    console.error("POST Inquiry Error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal membuat inquiry: " + 
          (error instanceof Error ? error.message : "Unknown error")
      },
      { status: 500 }
    )
  }
}

/* ========== PUT ========== */

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const inquiryId = searchParams.get("id")
    
    if (!inquiryId) {
      return NextResponse.json(
        { message: "Inquiry ID diperlukan" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const res = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:S`,
    }))

    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[COLUMNS.INQUIRY_ID] === inquiryId)

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const sheetRowNumber = rowIndex + 2
    const existingRow = rows[rowIndex]
    const existingInquiry = mapRowToInquiry(existingRow)

    if (existingInquiry.converted_project_id) {
      return NextResponse.json(
        { message: "Inquiry sudah WON, tidak dapat diubah" },
        { status: 403 }
      )
    }

    if (body.status) {
      const newStatus = body.status.toLowerCase() as InquiryStatus

      if (!VALID_STATUS.includes(newStatus)) {
        return NextResponse.json(
          { message: "Status tidak valid" },
          { status: 400 }
        )
      }

      const allowedTransitions = STATUS_TRANSITIONS[existingInquiry.status]

      if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json(
          { 
            message: `Status tidak sesuai alur: dari ${existingInquiry.status} hanya bisa ke ${allowedTransitions.join(", ")}`
          },
          { status: 400 }
        )
      }

      if (newStatus === "won" && !body.converted_project_id) {
        return NextResponse.json(
          { message: "Tidak bisa set WON tanpa converted_project_id" },
          { status: 400 }
        )
      }
    }

    const mergedInquiry: Inquiry = {
      inquiry_id: existingInquiry.inquiry_id,
      tanggal_masuk: body.tanggal_masuk || existingInquiry.tanggal_masuk,
      customer_id: body.customer_id ? sanitize(body.customer_id) : existingInquiry.customer_id,
      customer_name: body.customer_name ? sanitize(body.customer_name) : existingInquiry.customer_name,
      nama_pekerjaan: body.nama_pekerjaan ? sanitize(body.nama_pekerjaan) : existingInquiry.nama_pekerjaan,
      layanan: body.layanan ? sanitize(body.layanan) : existingInquiry.layanan,
      estimasi_nilai: body.estimasi_nilai ? parseNumber(body.estimasi_nilai) : existingInquiry.estimasi_nilai,
      sumber: body.sumber ? sanitize(body.sumber) : existingInquiry.sumber,
      assigned_to: body.assigned_to ? sanitize(body.assigned_to) : existingInquiry.assigned_to,
      status: body.status ? body.status.toLowerCase() as InquiryStatus : existingInquiry.status,
      prioritas: body.prioritas ? sanitize(body.prioritas) : existingInquiry.prioritas,
      lokasi: body.lokasi ? sanitize(body.lokasi) : existingInquiry.lokasi,
      catatan: body.catatan ? sanitize(body.catatan) : existingInquiry.catatan,
      converted_rab_id: body.converted_rab_id ? sanitize(body.converted_rab_id) : existingInquiry.converted_rab_id,
      converted_project_id: body.converted_project_id ? sanitize(body.converted_project_id) : existingInquiry.converted_project_id,
      created_at: existingInquiry.created_at,
      created_by: existingInquiry.created_by,
      stage: body.stage ? sanitize(body.stage) : existingInquiry.stage,
      converted_proposal_id: body.converted_proposal_id
        ? sanitize(body.converted_proposal_id)
        : existingInquiry.converted_proposal_id,
    }

    await withRetry(() => sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${sheetRowNumber}:S${sheetRowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [rowFromInquiry(mergedInquiry)] }
    }))

    return NextResponse.json({
      success: true,
      message: "Inquiry berhasil diupdate",
    })
  } catch (error) {
    console.error("PUT Inquiry Error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal update inquiry: " + 
          (error instanceof Error ? error.message : "Unknown error")
      },
      { status: 500 }
    )
  }
}

/* ========== DELETE ========== */

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const inquiryId = searchParams.get("id")
    
    if (!inquiryId) {
      return NextResponse.json(
        { message: "Inquiry ID diperlukan" },
        { status: 400 }
      )
    }

    const res = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:S`,
    }))

    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[COLUMNS.INQUIRY_ID] === inquiryId)

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const sheetRowNumber = rowIndex + 2
    const existingRow = rows[rowIndex]
    const existingInquiry = mapRowToInquiry(existingRow)

    if (existingInquiry.converted_project_id) {
      return NextResponse.json(
        { message: "Inquiry sudah WON, tidak dapat dihapus" },
        { status: 403 }
      )
    }

    const deletedInquiry: Inquiry = {
      ...existingInquiry,
      status: "lost",
      stage: "DELETED",
    }

    await withRetry(() => sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${sheetRowNumber}:S${sheetRowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [rowFromInquiry(deletedInquiry)] }
    }))

    return NextResponse.json({
      success: true,
      message: "Inquiry berhasil dihapus (soft delete)",
    })
  } catch (error) {
    console.error("DELETE Inquiry Error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Gagal hapus inquiry: " + (error instanceof Error ? error.message : "Unknown error")
      },
      { status: 500 }
    )
  }
}
