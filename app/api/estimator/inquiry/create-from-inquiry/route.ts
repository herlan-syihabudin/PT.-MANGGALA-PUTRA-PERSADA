import { NextResponse } from "next/server"
import { google } from "googleapis"
import { appendActivity } from "@/lib/crm/activity"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
const REQUIRED_ENV = ["GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY", "GSHEET_CRM_ID"] as const
for (const env of REQUIRED_ENV) {
  if (!process.env[env]) {
    console.error(`Missing environment variable: ${env}`)
    throw new Error(`Missing environment variable: ${env}`)
  }
}

// Sanitize private key
const privateKey = process.env.GOOGLE_PRIVATE_KEY!
  .replace(/\\n/g, '\n')
  .replace(/^["']|["']$/g, '')

/* ================= GOOGLE AUTH ================= */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  privateKey,
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
  RAB_ID: 0,
  INQUIRY_ID: 1,
  PROJECT_NAME: 2,
  CUSTOMER_ID: 3,
  CUSTOMER_NAME: 4,
  TOTAL_ITEMS: 5,
  TOTAL_VALUE: 6,
  STATUS: 7,
  MARGIN: 8,
  PPN: 9,
  NOTES: 10,
  CREATED_BY: 11,
  CREATED_AT: 12,
  APPROVED_BY: 13,
  APPROVED_AT: 14,
} as const

// Simple rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 50 // requests per window (lebih kecil karena ini POST)
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

/* ================= HELPER FUNCTIONS ================= */
function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimit.get(ip)

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

function safeParseNumber(value: any): number {
  if (value === null || value === undefined) return 0
  const cleaned = String(value).replace(/[^\d]/g, "")
  const num = Number(cleaned)
  return isNaN(num) ? 0 : num
}

function generateRABId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `RAB-${timestamp}-${random}`
}

/* ================= LOGGER ================= */
const logger = {
  error: (context: string, error: any, metadata: any = {}) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        context,
        error: {
          message: error?.message,
          stack: error?.stack,
          code: error?.code,
        },
        ...metadata,
      })
    )
  },
  info: (context: string, metadata: any = {}) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        context,
        ...metadata,
      })
    )
  },
  warn: (context: string, metadata: any = {}) => {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        context,
        ...metadata,
      })
    )
  }
}

/* ================= CREATE RAB ================= */
export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    // ===== RATE LIMITING =====
    const clientIp = getClientIp(req)
    if (!checkRateLimit(clientIp)) {
      logger.warn(`[${requestId}] Rate limit exceeded for IP: ${clientIp}`)
      return NextResponse.json(
        { error: "Terlalu banyak request, coba lagi nanti" },
        { status: 429 }
      )
    }

    // ===== VALIDASI INPUT =====
    const body = await req.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json(
        { error: "Request body tidak valid" },
        { status: 400 }
      )
    }

    const { inquiry_id } = body

    if (!inquiry_id) {
      return NextResponse.json(
        { error: "inquiry_id wajib diisi" },
        { status: 400 }
      )
    }

    if (typeof inquiry_id !== 'string') {
      return NextResponse.json(
        { error: "inquiry_id harus berupa string" },
        { status: 400 }
      )
    }

    logger.info(`[${requestId}] Create RAB requested`, { inquiry_id })

    /* ============================
       1️⃣ AMBIL DATA INQUIRY
    ============================ */
    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!A2:S`,
    }).catch(error => {
      if (error.code === 404) throw new Error("SHEET_NOT_FOUND")
      if (error.code === 403) throw new Error("ACCESS_DENIED")
      if (error.code === 429) throw new Error("QUOTA_EXCEEDED")
      throw error
    })

    const rows = inquiryRes.data.values || []
    
    // Cari row index
    const rowIndex = rows.findIndex((r) => r[INQUIRY_COLUMNS.ID] === inquiry_id)
    const actualRow = rowIndex + 2 // +2 karena header + index 0-based

    if (rowIndex === -1) {
      logger.warn(`[${requestId}] Inquiry not found`, { inquiry_id })
      return NextResponse.json(
        { error: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const inquiryRow = rows[rowIndex]

    /* ============================
       2️⃣ CEK DUPLIKAT RAB
    ============================ */
    const existingRABId = inquiryRow[INQUIRY_COLUMNS.CONVERTED_RAB_ID]?.toString().trim()
    
    if (existingRABId) {
      logger.warn(`[${requestId}] Inquiry already has RAB`, { 
        inquiry_id, 
        existing_rab_id: existingRABId 
      })
      
      return NextResponse.json(
        {
          error: "Inquiry sudah memiliki RAB",
          rab_id: existingRABId,
        },
        { status: 409 }
      )
    }

    /* ============================
       3️⃣ VALIDASI STATUS
    ============================ */
    const currentStatus = (inquiryRow[INQUIRY_COLUMNS.STATUS] || "")
      .toString()
      .toLowerCase()
      .trim()

    if (currentStatus !== "estimating") {
      logger.warn(`[${requestId}] Invalid status for RAB creation`, { 
        inquiry_id, 
        current_status: currentStatus 
      })
      
      return NextResponse.json(
        { 
          error: `Inquiry dengan status "${currentStatus}" tidak bisa dibuat RAB`,
          required_status: "estimating"
        },
        { status: 400 }
      )
    }

    /* ============================
       4️⃣ DOUBLE-CHECK SEBELUM CREATE (ANTI RACE CONDITION)
    ============================ */
    const latestCheck = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `CRM_INQUIRY!N${actualRow}`,
    })

    if (latestCheck.data.values?.[0]?.[0]?.toString().trim()) {
      logger.warn(`[${requestId}] Race condition detected - RAB already created`, { 
        inquiry_id 
      })
      
      return NextResponse.json(
        { error: "Inquiry sudah memiliki RAB" },
        { status: 409 }
      )
    }

    /* ============================
       5️⃣ PREPARE DATA
    ============================ */
    const rabId = generateRABId()
    const now = new Date().toISOString()
    
    const estimasiNilai = safeParseNumber(inquiryRow[INQUIRY_COLUMNS.ESTIMASI_NILAI])
    const projectName = inquiryRow[INQUIRY_COLUMNS.NAMA_PEKERJAAN]?.toString().trim() || "Untitled Project"
    const customerName = inquiryRow[INQUIRY_COLUMNS.CUSTOMER_NAME]?.toString().trim() || "-"
    const customerId = inquiryRow[INQUIRY_COLUMNS.CUSTOMER_ID]?.toString().trim() || ""

    /* ============================
       6️⃣ INSERT KE RAB_PROJECT
    ============================ */
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `RAB_PROJECT!A:O`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rabId,                    // A: RAB_ID
          inquiry_id,               // B: INQUIRY_ID
          projectName,              // C: PROJECT_NAME
          customerId,               // D: CUSTOMER_ID
          customerName,             // E: CUSTOMER_NAME
          0,                        // F: TOTAL_ITEMS
          estimasiNilai,            // G: TOTAL_VALUE
          "draft",                  // H: STATUS
          "",                       // I: MARGIN
          "",                       // J: PPN
          "",                       // K: NOTES
          "Estimator",              // L: CREATED_BY
          now,                      // M: CREATED_AT
          "",                       // N: APPROVED_BY
          "",                       // O: APPROVED_AT
        ]],
      },
    })

    /* ============================
       7️⃣ UPDATE INQUIRY (BATCH UPDATE)
    ============================ */
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        data: [
          {
            range: `CRM_INQUIRY!J${actualRow}`, // STATUS
            values: [["rab_created"]],
          },
          {
            range: `CRM_INQUIRY!N${actualRow}`, // CONVERTED_RAB_ID
            values: [[rabId]],
          }
        ],
        valueInputOption: "USER_ENTERED",
      },
    })

    /* ============================
       8️⃣ LOG ACTIVITY
    ============================ */
    await appendActivity({
      inquiry_id,
      type: "RAB_CREATED",
      description: `Convert ke RAB ${rabId}`,
      old_value: "",
      new_value: rabId,
      created_by: "Estimator",
    }).catch(error => {
      // Non-critical error, just log
      logger.error(`[${requestId}] Failed to append activity`, error, { inquiry_id })
    })

    const duration = Date.now() - startTime
    logger.info(`[${requestId}] RAB created successfully`, {
      rab_id: rabId,
      inquiry_id,
      estimasi_nilai: estimasiNilai,
      duration_ms: duration,
    })

    /* ============================
       9️⃣ RETURN RESPONSE
    ============================ */
    return NextResponse.json({
      success: true,
      rab_id: rabId,
      message: "RAB berhasil dibuat",
      data: {
        rab_id: rabId,
        inquiry_id,
        project_name: projectName,
        customer_name: customerName,
        estimasi_nilai: estimasiNilai,
        status: "draft",
        created_at: now,
      },
    }, {
      headers: {
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`
      }
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error(`[${requestId}] Create RAB Error`, error, { duration_ms: duration })

    // Handle known errors
    if (error.message === "SHEET_NOT_FOUND") {
      return NextResponse.json(
        { error: "Sheet tidak ditemukan" },
        { status: 404 }
      )
    }

    if (error.message === "ACCESS_DENIED") {
      return NextResponse.json(
        { error: "Akses ke Google Sheets ditolak. Periksa service account email dan permissions." },
        { status: 403 }
      )
    }

    if (error.message === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "Kuota Google Sheets API habis, coba lagi nanti" },
        { status: 429 }
      )
    }

    // Handle Google Sheets specific errors
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

    if (error.code === 429) {
      return NextResponse.json(
        { error: "Terlalu banyak request ke Google Sheets" },
        { status: 429 }
      )
    }

    // Default error
    return NextResponse.json(
      { 
        error: "Gagal membuat RAB",
        request_id: requestId 
      },
      { status: 500 }
    )
  }
}
