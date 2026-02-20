import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

/* ================= ENVIRONMENT VALIDATION ================= */
function validateEnvironment() {
  const required = [
    'GOOGLE_CLIENT_EMAIL', 
    'GOOGLE_PRIVATE_KEY', 
    'GSHEET_ESTIMATOR_ID',
    'GSHEET_CRM_ID'
  ] as const
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
const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!
const CRM_SHEET_ID = process.env.GSHEET_CRM_ID!

const RAB_PROJECT = "RAB_PROJECT"
const CRM_INQUIRY = "CRM_INQUIRY"

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
  PROJECT_ID: 2,
  PROJECT_NAME: 3,
  CUSTOMER_NAME: 4,
  TOTAL_ITEMS: 5,
  TOTAL_VALUE: 6,
  STATUS: 7,
  AKSI: 8,
  CREATED_BY: 9,
  CREATED_AT: 10,
  // Tambahan untuk future
  MARGIN: 11,
  PPN: 12,
  NOTES: 13,
  APPROVED_BY: 14,
  APPROVED_AT: 15,
} as const

const RETRYABLE_CODES = [408, 429, 502, 503] as const

/* ================= HELPERS ================= */
function n(x: any) {
  const v = Number(x)
  return Number.isFinite(v) ? v : 0
}

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

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && RETRYABLE_CODES.includes(error.code)) {
      const delay = 1000 * (4 - retries)
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

// ===================== GET ALL RAB =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Number(searchParams.get('limit')) || 50)

    const res = await withRetry(() => 
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!A2:P`, // Perluas sampai kolom P
      })
    )

    let rows = res.data.values || []
    let data = rows
      .filter(r => r[RAB_COLUMNS.RAB_ID]) // minimal harus ada rab_id
      .map((r) => ({
        rab_id: r[RAB_COLUMNS.RAB_ID],
        inquiry_id: r[RAB_COLUMNS.INQUIRY_ID],
        project_id: r[RAB_COLUMNS.PROJECT_ID],
        project_name: r[RAB_COLUMNS.PROJECT_NAME] || "Untitled",
        customer_name: r[RAB_COLUMNS.CUSTOMER_NAME] || "-",
        total_items: n(r[RAB_COLUMNS.TOTAL_ITEMS]),
        total_value: n(r[RAB_COLUMNS.TOTAL_VALUE]),
        status: r[RAB_COLUMNS.STATUS] || "Draft",
        created_by: r[RAB_COLUMNS.CREATED_BY] || "",
        created_at: r[RAB_COLUMNS.CREATED_AT] || "",
        margin: n(r[RAB_COLUMNS.MARGIN]),
        ppn: n(r[RAB_COLUMNS.PPN]),
      }))

    // Filter by status
    if (status) {
      const statusList = status.split(',').map(s => s.toLowerCase())
      data = data.filter(item => statusList.includes(item.status.toLowerCase()))
    }

    // Search by project name or customer
    if (search) {
      const s = search.toLowerCase()
      data = data.filter(item => 
        item.project_name?.toLowerCase().includes(s) ||
        item.customer_name?.toLowerCase().includes(s)
      )
    }

    // Sort by created_at desc
    data.sort((a, b) => b.created_at.localeCompare(a.created_at))

    // Pagination
    const start = (page - 1) * limit
    const paginated = data.slice(start, start + limit)

    logger.info('GET RAB Success', { 
      total: data.length, 
      page, 
      limit,
      filtered: paginated.length 
    })

    return NextResponse.json({
      data: paginated,
      pagination: {
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error: any) {
    logger.error('GET RAB ERROR', error)

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { message: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { message: "Gagal load RAB" },
      { status: 500 }
    )
  }
}

// ===================== CREATE RAB =====================
export async function POST(req: Request) {
  try {
    const { inquiry_id, created_by = "Estimator" } = await req.json()

    if (!inquiry_id) {
      return NextResponse.json(
        { message: "inquiry_id wajib diisi" },
        { status: 400 }
      )
    }

    logger.info('Create RAB requested', { inquiry_id })

    // ===== CEK INQUIRY =====
    const crmRes = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: CRM_SHEET_ID,
        range: `${CRM_INQUIRY}!A2:S`, // Ambil semua kolom sampai S
      })
    )

    const rows = crmRes.data.values || []
    const inquiryRow = rows.find(r => r[INQUIRY_COLUMNS.ID] === inquiry_id)

    if (!inquiryRow) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    // Cek apakah sudah punya RAB
    if (inquiryRow[INQUIRY_COLUMNS.CONVERTED_RAB_ID]) {
      return NextResponse.json(
        { 
          message: "Inquiry sudah memiliki RAB", 
          rab_id: inquiryRow[INQUIRY_COLUMNS.CONVERTED_RAB_ID] 
        },
        { status: 409 } // Conflict
      )
    }

    // Validasi status
    const currentStatus = (inquiryRow[INQUIRY_COLUMNS.STATUS] || "").toLowerCase()
    if (!["new", "estimating"].includes(currentStatus)) {
      return NextResponse.json(
        { message: `Inquiry dengan status ${currentStatus} tidak bisa dibuat RAB` },
        { status: 400 }
      )
    }

    // ===== GENERATE ID =====
    const rab_id = "RAB-" + nanoid(8).toUpperCase()
    const project_id = "PRJ-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    const project_name = inquiryRow[INQUIRY_COLUMNS.NAMA_PEKERJAAN] || "Tanpa Nama Project"
    const customer_name = inquiryRow[INQUIRY_COLUMNS.CUSTOMER_NAME] || "-"
    const estimasiNilai = n(inquiryRow[INQUIRY_COLUMNS.ESTIMASI_NILAI])

    // ===== INSERT RAB =====
    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!A:P`, // Perluas sampai kolom P
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            rab_id,
            inquiry_id,
            project_id,
            project_name,
            customer_name,
            0,  // total_items
            estimasiNilai,  // total_value dari inquiry
            "Draft",
            "",  // aksi (kosong)
            created_by,
            now,
            "",  // margin
            "",  // ppn
            "",  // notes
            "",  // approved_by
            "",  // approved_at
          ]]
        }
      })
    )

    // ===== UPDATE INQUIRY =====
    const rowIndex = rows.findIndex(r => r[INQUIRY_COLUMNS.ID] === inquiry_id)
    const sheetRowNumber = rowIndex + 2 // +2 karena header dan index mulai 0

    // Update status ke "estimating"
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: CRM_SHEET_ID,
        range: `${CRM_INQUIRY}!J${sheetRowNumber}`, // Kolom STATUS
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["estimating"]]
        }
      })
    )

    // Update converted_rab_id
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: CRM_SHEET_ID,
        range: `${CRM_INQUIRY}!N${sheetRowNumber}`, // Kolom CONVERTED_RAB_ID
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[rab_id]]
        }
      })
    )

    logger.info('RAB created successfully', { 
      rab_id, 
      inquiry_id,
      project_id,
      project_name,
      estimasi_nilai: estimasiNilai
    })

    return NextResponse.json({
      success: true,
      message: "RAB berhasil dibuat",
      rab_id,
      project_id,
      data: {
        rab_id,
        inquiry_id,
        project_id,
        project_name,
        customer_name,
        estimasi_nilai: estimasiNilai,
        status: "Draft"
      }
    })

  } catch (error: any) {
    logger.error('CREATE RAB ERROR', error, { body: await req.json().catch(() => ({})) })

    const errorMap: Record<number, { message: string; status: number }> = {
      404: { message: "Sheet tidak ditemukan", status: 404 },
      403: { message: "Akses ke Google Sheets ditolak", status: 403 },
      429: { message: "Terlalu banyak request, coba lagi", status: 429 },
    }

    const errorResponse = errorMap[error.code]
    if (errorResponse) {
      return NextResponse.json(
        { message: errorResponse.message },
        { status: errorResponse.status }
      )
    }

    return NextResponse.json(
      { message: "Gagal membuat RAB" },
      { status: 500 }
    )
  }
}
