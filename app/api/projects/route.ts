import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

// ===== ENVIRONMENT VALIDATION =====
const REQUIRED_ENV = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_PROJECT_ID'] as const
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

// ===== GOOGLE AUTH =====
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  privateKey,
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

// Sheet constants
const SHEET_ID = process.env.GSHEET_PROJECT_ID!
const PROJECT_SHEET = "PROJECT MASTER"
const CUSTOMER_SHEET = "CUSTOMERS"
const PROGRESS_SHEET = "PROJECT_SCOPE_PROGRESS"

// ===== HELPER FUNCTIONS =====
const normalize = (val: any) => String(val || "").trim()
const toNumber = (val: any) => Number(String(val || "0").replace(/[^\d]/g, "")) || 0

// ===== LOGGER =====
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

/* ==============================
   GET : PROJECT LIST (JOIN CUSTOMER + PROGRESS)
================================ */
export async function GET(req: Request) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(req.url)
    const filterCustomerId = normalize(searchParams.get("customer_id"))
    const filterStatus = normalize(searchParams.get("status"))

    logger.info(`[${requestId}] Fetching projects`, { filterCustomerId, filterStatus })

    const [projectRes, customerRes, progressRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${PROJECT_SHEET}!A2:J`, // Skip header
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${CUSTOMER_SHEET}!A2:P`, // Skip header
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${PROGRESS_SHEET}!A2:F`, // Skip header
      }),
    ])

    const projectRows = projectRes.data.values || []
    const customerRows = customerRes.data.values || []
    const progressRows = progressRes.data.values || []

    // ===== MAP CUSTOMER (by customer_id)
    const customerMap: Record<string, any> = Object.fromEntries(
      customerRows
        .filter((r) => r?.[0])
        .map((r) => [
          normalize(r[0]), // customer_id
          {
            customer_id: normalize(r[0]),
            company_name: r[1] || "-",
            pic_name: r[3] || "-",
            email: r[5] || "-",
            phone: r[6] || "-",
            city: r[9] || "-",
            province: r[10] || "-",
          },
        ])
    )

    // ===== MAP PROGRESS (by project_id)
    const progressMap: Record<string, any> = Object.fromEntries(
      progressRows
        .filter((r) => r?.[0])
        .map((r) => {
          const mep = toNumber(r[1])
          const civil = toNumber(r[2])
          const steel = toNumber(r[3])
          const interior = toNumber(r[4])

          const scopes = [mep, civil, steel, interior].filter(v => v > 0)

const overall = scopes.length === 0
  ? 0
  : Math.round(scopes.reduce((a,b)=>a+b,0) / scopes.length)

          return [
            normalize(r[0]), // project_id
            { mep, civil, steel, interior, overall, updated_at: r[5] || "" },
          ]
        })
    )

    // ===== FILTER & BUILD RESPONSE
    const projects = projectRows
      .filter((r) => {
        if (filterCustomerId && normalize(r[2]) !== filterCustomerId) return false
        if (filterStatus && normalize(r[7]) !== filterStatus) return false
        return true
      })
      .map((r) => {
        const project_id = normalize(r[0])
        const customer_id = normalize(r[2])
        const customer = customerMap[customer_id]
        const progress = progressMap[project_id]

        return {
          project_id,
          project_name: r[1] || "",
          customer_id,
          customer: customer || {
            company_name: "-",
            pic_name: "-",
            email: "-",
            phone: "-",
            city: "-",
            province: "-",
          },
          lokasi: r[3] || "",
          nilai_kontrak: toNumber(r[4]),
          start_date: r[5] || "",
          end_date: r[6] || "",
          status: r[7] || "",
          created_at: r[8] || "",
          project_type: r[9] || "",
          progress: progress?.overall ?? 0,
          progress_detail: progress || {
            mep: 0,
            civil: 0,
            steel: 0,
            interior: 0,
            overall: 0
          }
        }
      })

    const duration = Date.now() - startTime
    logger.info(`[${requestId}] Success`, { 
      count: projects.length,
      duration_ms: duration 
    })

    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`
      }
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error(`[${requestId}] GET PROJECT ERROR`, error, { duration_ms: duration })

    if (error.code === 404) {
      return NextResponse.json(
        { error: "Sheet tidak ditemukan", code: "SHEET_NOT_FOUND" },
        { status: 404 }
      )
    }

    if (error.code === 403) {
      return NextResponse.json(
        { error: "Akses ke Google Sheets ditolak", code: "ACCESS_DENIED" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "Gagal mengambil data project", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}

/* ==============================
   POST : CREATE PROJECT
================================ */
export async function POST(req: Request) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    const body = await req.json().catch(() => ({}))

    const {
      project_code,
      project_name,
      customer_id,
      project_type,
      lokasi,
      nilai_kontrak,
      start_date,
      end_date,
      status,
    } = body

    // Validasi required fields
    const missingFields = []
    if (!project_name) missingFields.push('project_name')
    if (!customer_id) missingFields.push('customer_id')
    if (!project_type) missingFields.push('project_type')
    if (!nilai_kontrak) missingFields.push('nilai_kontrak')
    if (!start_date) missingFields.push('start_date')
    if (!status) missingFields.push('status')

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Field wajib: ${missingFields.join(', ')}`,
          code: "MISSING_FIELDS"
        },
        { status: 400 }
      )
    }

    // Generate project_id
    // Generate project_id
const date = new Date()
const y = date.getFullYear()
const m = String(date.getMonth()+1).padStart(2,'0')
const d = String(date.getDate()).padStart(2,'0')

const project_id = project_code || `PRJ-${y}${m}${d}-${Math.floor(Math.random()*900+100)}`

const created_at = new Date().toISOString()

    logger.info(`[${requestId}] Creating project`, { project_id, project_name })

    // Insert ke PROJECT MASTER
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PROJECT_SHEET}!A:J`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
  project_id,
  project_name,
  customer_id,
  lokasi || "",
  toNumber(nilai_kontrak),   // ✅ FIX
  start_date,
  end_date || "",
  status,
  created_at,
  project_type,
]],
      },
    })

    // Insert ke PROGRESS sheet (init 0)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PROGRESS_SHEET}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id,  // A
          0,           // B (MEP)
          0,           // C (CIVIL)
          0,           // D (STEEL)
          0,           // E (INTERIOR)
          created_at,  // F (updated_at)
        ]],
      },
    })

    const duration = Date.now() - startTime
    logger.info(`[${requestId}] Project created`, { 
      project_id, 
      duration_ms: duration 
    })

    return NextResponse.json(
      { 
        success: true,
        project_id, 
        message: "Project berhasil dibuat" 
      },
      { 
        status: 201,
        headers: {
          'X-Request-ID': requestId,
          'X-Response-Time': `${duration}ms`
        }
      }
    )

  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error(`[${requestId}] CREATE PROJECT ERROR`, error, { duration_ms: duration })

    if (error.code === 404) {
      return NextResponse.json(
        { error: "Sheet tidak ditemukan", code: "SHEET_NOT_FOUND" },
        { status: 404 }
      )
    }

    if (error.code === 403) {
      return NextResponse.json(
        { error: "Akses ke Google Sheets ditolak", code: "ACCESS_DENIED" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: "Gagal menyimpan project", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
