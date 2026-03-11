// app/api/crm/pipeline/[id]/route.ts
import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
const requiredEnv = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_CRM_ID'] as const
for (const env of requiredEnv) {
  if (!process.env[env]) {
    throw new Error(`Missing environment variable: ${env}`)
  }
}

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
const RETRYABLE = [408, 429, 502, 503]

/* ================= CONSTANTS ================= */
const VALID_STATUS = ["new", "survey", "estimating", "boq_created", "proposal", "negotiation", "won", "lost"] as const
type InquiryStatus = typeof VALID_STATUS[number]

const VALID_STAGES = ["FOLLOW UP", "PENAWARAN", "NEGOSIASI", "DEAL", "LOST"] as const
type PipelineStage = typeof VALID_STAGES[number]

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

  NEXT_FOLLOW_UP_DATE: 19,
  FOLLOW_UP_TYPE: 20,
  FOLLOW_UP_NOTES: 21,
} as const

/* ================= HELPERS ================= */
const normalize = (val: any) => String(val || "").replace(/[\s-]/g, "").trim()

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

const logger = {
  error: (context: string, error: any, meta = {}) => 
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', context, error: { message: error?.message, code: error?.code }, ...meta })),
  info: (context: string, meta = {}) => 
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', context, ...meta }))
}

function getStageFromInquiry(i: any): PipelineStage {
  if (i.status === "lost") return "LOST"
  if (i.status === "won") return "DEAL"
  if (i.converted_proposal_id) return "NEGOSIASI"
  if (i.converted_rab_id) return "PENAWARAN"
  return "FOLLOW UP"
}

function getAgingDays(date: string): number {
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function mapRowToDeal(row: any[]): any {
  const inquiryId = row[COLUMNS.INQUIRY_ID] || ""
  const status = row[COLUMNS.STATUS] || "new"
  const rabId = row[COLUMNS.CONVERTED_RAB_ID] || ""
  const proposalId = row[COLUMNS.CONVERTED_PROPOSAL_ID] || ""
  const projectId = row[COLUMNS.CONVERTED_PROJECT_ID] || ""
  const estimasi = Number(String(row[COLUMNS.ESTIMASI_NILAI] || "").replace(/[^\d]/g, "")) || 0
  
  // Determine stage
  const stage = getStageFromInquiry({
    status,
    converted_rab_id: rabId,
    converted_proposal_id: proposalId,
  })
  
  // Probability based on stage
  const probabilityMap: Record<PipelineStage, number> = {
    "FOLLOW UP": 0.2,
    "PENAWARAN": 0.5,
    "NEGOSIASI": 0.7,
    "DEAL": 1.0,
    "LOST": 0,
  }
  
  // Generate project name with fallback
  let projectName = row[COLUMNS.NAMA_PEKERJAAN] || ""
  if (!projectName && row[COLUMNS.CUSTOMER_NAME]) {
    projectName = `${row[COLUMNS.CUSTOMER_NAME]} Project`
  }
  if (!projectName) {
    projectName = inquiryId
  }
  
  return {
    pipeline_id: inquiryId,
    inquiry_id: inquiryId,
    customer_id: row[COLUMNS.CUSTOMER_ID] || "",
    customer_name: row[COLUMNS.CUSTOMER_NAME] || "-",
    customer_email: "", // TODO: ambil dari customer API
    customer_phone: "", // TODO: ambil dari customer API
    customer_address: row[COLUMNS.LOKASI] || "",
    project_name: projectName,
    project_location: row[COLUMNS.LOKASI] || "",
    stage,
    estimated_value: estimasi,
    proposal_value: 0, // TODO: ambil dari proposal API
    final_value: estimasi,
    rab_id: rabId,
    proposal_id: proposalId,
    proposal_status: "draft", // TODO: ambil dari proposal API
    project_id: projectId,
    created_at: row[COLUMNS.CREATED_AT] || row[COLUMNS.TANGGAL_MASUK] || new Date().toISOString(),
    updated_at: row[COLUMNS.CREATED_AT] || row[COLUMNS.TANGGAL_MASUK] || new Date().toISOString(),
    last_activity_at: row[COLUMNS.CREATED_AT] || row[COLUMNS.TANGGAL_MASUK] || new Date().toISOString(),
    status,
    probability: probabilityMap[stage] || 0,
    aging_days: getAgingDays(row[COLUMNS.CREATED_AT] || row[COLUMNS.TANGGAL_MASUK] || new Date().toISOString()),
    source: row[COLUMNS.SUMBER] || "",
    priority: row[COLUMNS.PRIORITAS] || "normal",
    notes: row[COLUMNS.CATATAN] || "",
    assigned_to: row[COLUMNS.ASSIGNED_TO] || "",
    next_follow_up_date: row[COLUMNS.NEXT_FOLLOW_UP_DATE] || "",
follow_up_type: row[COLUMNS.FOLLOW_UP_TYPE] || "",
follow_up_notes: row[COLUMNS.FOLLOW_UP_NOTES] || "",
  }
}

/* ================= VALID STAGE TRANSITION ================= */
const validTransitions: Record<PipelineStage, PipelineStage[]> = {
  "FOLLOW UP": ["PENAWARAN"],
  "PENAWARAN": ["NEGOSIASI"],
  "NEGOSIASI": ["DEAL", "LOST"],
  "DEAL": [],
  "LOST": [],
}

/* ================= LOCK RAB ================= */
async function lockRAB(rabId: string) {
  // TODO: Implement RAB locking
  logger.info('RAB locked', { rabId })
  return true
}

/* ================= GET DEAL ================= */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inquiryId } = await params

    if (!inquiryId) {
      return NextResponse.json(
        { message: "ID wajib" },
        { status: 400 }
      )
    }

    // Ambil dari Google Sheets
    const res = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:V`,
    }))

    const rows = (res.data.values || []).filter(r => r[COLUMNS.INQUIRY_ID])

    const rowIndex = rows.findIndex((r) =>
      normalize(r[COLUMNS.INQUIRY_ID]) === normalize(inquiryId)
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Deal tidak ditemukan" },
        { status: 404 }
      )
    }

    const row = rows[rowIndex]
    const deal = mapRowToDeal(row)

    logger.info('GET Deal Success', { inquiryId })

    return NextResponse.json(deal)

  } catch (error: any) {
    const { id } = await params
    logger.error('GET Deal Error', error, { inquiryId: id })

    const status = error.code || error.response?.status
    if ([404, 403, 429, 503].includes(status)) {
      return NextResponse.json({ message: error.message }, { status })
    }

    return NextResponse.json(
      { message: "Gagal load deal" },
      { status: 500 }
    )
  }
}

/* ================= PATCH - UPDATE STAGE ================= */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inquiryId } = await params
    const body = await req.json()
    const { stage } = body

    // Validate stage
    if (!stage) {
      return NextResponse.json(
        { message: "Stage wajib diisi" },
        { status: 400 }
      )
    }

    if (!VALID_STAGES.includes(stage as PipelineStage)) {
      return NextResponse.json(
        { message: "Stage tidak valid" },
        { status: 400 }
      )
    }

    // First get existing deal
    const getRes = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:V`,
    }))

    const rows = (getRes.data.values || []).filter(r => r[COLUMNS.INQUIRY_ID])
    const rowIndex = rows.findIndex((r) =>
      normalize(r[COLUMNS.INQUIRY_ID]) === normalize(inquiryId)
    )

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Deal tidak ditemukan" },
        { status: 404 }
      )
    }

    const existingRow = rows[rowIndex]
    const existingDeal = mapRowToDeal(existingRow)

    // ===============================
    // VALID STAGE TRANSITION
    // ===============================
    if (!validTransitions[existingDeal.stage as PipelineStage]?.includes(stage as PipelineStage)) {
      return NextResponse.json(
        {
          message: `Transisi tidak valid: dari ${existingDeal.stage} ke ${stage}`,
        },
        { status: 400 }
      )
    }

    // ===============================
    // VALIDASI SYARAT
    // ===============================
    if (stage === "PENAWARAN" && !existingDeal.rab_id) {
      return NextResponse.json(
        { message: "RAB harus ada sebelum masuk PENAWARAN" },
        { status: 400 }
      )
    }

    if (stage === "NEGOSIASI" && existingDeal.proposal_status !== "sent") {
      return NextResponse.json(
        {
          message: "Proposal harus sudah dikirim sebelum NEGOSIASI",
        },
        { status: 400 }
      )
    }

    if (stage === "DEAL" && existingDeal.proposal_status !== "approved") {
      return NextResponse.json(
        {
          message: "Proposal harus disetujui sebelum DEAL",
        },
        { status: 400 }
      )
    }

    // ===============================
    // LOCK RAB IF DEAL
    // ===============================
    if (stage === "DEAL" && existingDeal.rab_id) {
      await lockRAB(existingDeal.rab_id)
    }

    // ===============================
    // UPDATE STATUS DI INQUIRY
    // ===============================
    const actualRowNumber = rowIndex + 2 // karena data mulai dari A2
    
    // Map stage ke status inquiry
    const statusMap: Record<string, string> = {
      "FOLLOW UP": "new",
      "PENAWARAN": "estimating",
      "NEGOSIASI": "sent",
      "DEAL": "won",
      "LOST": "lost",
    }
    
    const newStatus = statusMap[stage] || existingDeal.status
    
    await withRetry(() => sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!J${actualRowNumber}`, // Kolom STATUS
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[newStatus]],
      },
    }))

    // Get updated data
    const updatedRes = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${actualRowNumber}:V${actualRowNumber}`,
    }))

    const updatedRow = updatedRes.data.values?.[0] || []
    const updatedDeal = mapRowToDeal(updatedRow)

    logger.info('PATCH Deal Success', { inquiryId, stage })

    return NextResponse.json(updatedDeal)

  } catch (error: any) {
    const { id } = await params
    logger.error('PATCH Deal Error', error, { inquiryId: id })

    const status = error.code || error.response?.status
    if ([404, 403, 429, 503].includes(status)) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status }
      )
    }

    return NextResponse.json(
      { success: false, message: "Gagal update deal" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const { next_follow_up_date, follow_up_type, follow_up_notes } = body

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:V`,
  })

  const rows = res.data.values || []

  const rowIndex = rows.findIndex(
    (r) => normalize(r[COLUMNS.INQUIRY_ID]) === normalize(id)
  )

  if (rowIndex === -1) {
    return NextResponse.json({ message: "Deal tidak ditemukan" }, { status: 404 })
  }

  const actualRow = rowIndex + 2

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!T${actualRow}:V${actualRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[next_follow_up_date, follow_up_type, follow_up_notes]],
    },
  })

  return NextResponse.json({ success: true })
}
