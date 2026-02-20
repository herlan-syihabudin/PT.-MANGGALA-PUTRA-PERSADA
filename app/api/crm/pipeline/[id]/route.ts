// app/api/crm/pipeline/[id]/route.ts
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

/* ================= HELPERS ================= */
const normalize = (val: any) => String(val || "").replace(/[\s-]/g, "").trim()

function getStageFromInquiry(i: any): string {
  if (i.status === "lost") return "LOST"
  if (i.proposal_status === "approved") return "DEAL"
  if (i.proposal_status === "sent") return "NEGOSIASI"
  if (i.converted_rab_id) return "PENAWARAN"
  return "FOLLOW UP"
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
    proposal_status: "draft", // TODO: ambil dari proposal API
  })
  
  // Probability based on stage
  const probabilityMap: Record<string, number> = {
    "FOLLOW UP": 0.2,
    "PENAWARAN": 0.5,
    "NEGOSIASI": 0.7,
    "DEAL": 1.0,
    "LOST": 0,
  }
  
  return {
    pipeline_id: inquiryId,
    inquiry_id: inquiryId,
    customer_id: row[COLUMNS.CUSTOMER_ID] || "",
    customer_name: row[COLUMNS.CUSTOMER_NAME] || "-",
    customer_email: "", // TODO: ambil dari customer API
    customer_phone: "", // TODO: ambil dari customer API
    customer_address: row[COLUMNS.LOKASI] || "",
    project_name: row[COLUMNS.NAMA_PEKERJAAN] || "Untitled Project",
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
    aging_days: 0, // akan dihitung di frontend
    source: row[COLUMNS.SUMBER] || "",
    priority: row[COLUMNS.PRIORITAS] || "normal",
    notes: row[COLUMNS.CATATAN] || "",
    assigned_to: row[COLUMNS.ASSIGNED_TO] || "",
  }
}

/* ================= GET DEAL ================= */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const inquiryId = params.id

    if (!inquiryId) {
      return NextResponse.json(
        { message: "ID wajib" },
        { status: 400 }
      )
    }

    // Ambil dari Google Sheets
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
        { message: "Deal tidak ditemukan" },
        { status: 404 }
      )
    }

    const row = rows[rowIndex]
    const deal = mapRowToDeal(row)

    // TODO: Fetch additional data from:
    // - Customer API untuk email/phone
    // - RAB API untuk gross_margin
    // - Proposal API untuk proposal_status & proposal_value

    return NextResponse.json(deal)

  } catch (error) {
    console.error("GET Deal Error:", error)
    return NextResponse.json(
      { message: "Gagal load deal" },
      { status: 500 }
    )
  }
}

/* ================= VALID STAGE TRANSITION ================= */
const validTransitions: Record<string, string[]> = {
  "FOLLOW UP": ["PENAWARAN"],
  "PENAWARAN": ["NEGOSIASI"],
  "NEGOSIASI": ["DEAL", "LOST"],
  "DEAL": [],
  "LOST": [],
}

/* ================= LOCK RAB ================= */
async function lockRAB(rabId: string) {
  // TODO: Implement RAB locking
  console.log("RAB locked:", rabId)
  return true
}

/* ================= PATCH - UPDATE STAGE ================= */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { stage } = body

    // First get existing deal
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:S`,
    })

    const rows = (getRes.data.values || []).filter(r => r[COLUMNS.INQUIRY_ID])
    const rowIndex = rows.findIndex((r) =>
      normalize(r[COLUMNS.INQUIRY_ID]) === normalize(params.id)
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
    if (
      stage &&
      !validTransitions[existingDeal.stage]?.includes(stage)
    ) {
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

    if (
      stage === "NEGOSIASI" &&
      existingDeal.proposal_status !== "sent"
    ) {
      return NextResponse.json(
        {
          message:
            "Proposal harus sudah dikirim sebelum NEGOSIASI",
        },
        { status: 400 }
      )
    }

    if (
      stage === "DEAL" &&
      existingDeal.proposal_status !== "approved"
    ) {
      return NextResponse.json(
        {
          message:
            "Proposal harus disetujui sebelum DEAL",
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
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!J${actualRowNumber}`, // Kolom STATUS
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[newStatus]],
      },
    })

    // Get updated data
    const updatedRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${actualRowNumber}:S${actualRowNumber}`,
    })

    const updatedRow = updatedRes.data.values?.[0] || []
    const updatedDeal = mapRowToDeal(updatedRow)

    return NextResponse.json(updatedDeal)

  } catch (error) {
    console.error("PATCH ERROR:", error)
    return NextResponse.json(
      { message: "Gagal update deal" },
      { status: 500 }
    )
  }
}
