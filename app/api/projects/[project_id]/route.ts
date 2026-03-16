import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

// ===== ENVIRONMENT VALIDATION =====
if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GSHEET_PROJECT_ID) {
  throw new Error("Missing Google Sheets environment variables")
}

// Sanitize private key
const privateKey = process.env.GOOGLE_PRIVATE_KEY!
  .replace(/\\n/g, '\n')
  .replace(/^["']|["']$/g, '')

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  privateKey,
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

const allowedTypes = ["MEP","CIVIL","STEEL","INTERIOR","OTHER"]

/* ==============================
   CONFIG (SATU SPREADSHEET)
================================ */
const PROJECT_SHEET_ID = process.env.GSHEET_PROJECT_ID!
const CRM_SHEET_ID = process.env.GSHEET_CRM_ID!

const PROJECT_SHEET = "PROJECT MASTER"
const CUSTOMER_SHEET = "CUSTOMERS"

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

  warn: (context: string, metadata: any = {}) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      context,
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
   GET : PROJECT DETAIL + CUSTOMER
================================ */
export async function GET(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    const { project_id } = params

    if (!project_id || project_id.length < 5) {
      return NextResponse.json(
        { error: "Invalid project ID", code: "INVALID_ID" },
        { status: 400 }
      )
    }

    logger.info(`[${requestId}] Fetching project: ${project_id}`)

    const [projectRes, customerRes] = await Promise.all([
  sheets.spreadsheets.values.get({
    spreadsheetId: PROJECT_SHEET_ID,
    range: `'${PROJECT_SHEET}'!A2:J`,
  }),
  sheets.spreadsheets.values.get({
    spreadsheetId: CRM_SHEET_ID,
    range: `'${CUSTOMER_SHEET}'!A2:P`,
  }),
])

    const projectRows = projectRes.data.values || []
    const customerRows = customerRes.data.values || []

    // Find project
   const projectRow = projectRows.find(
  (r) => normalize(r[0]) === project_id
)

if (!projectRow) {
  logger.warn(`[${requestId}] Project not found`)
  return NextResponse.json({ error: "Project tidak ditemukan" }, { status:404 })
}

const projectType = allowedTypes.includes(projectRow?.[9])
  ? projectRow[9]
  : "OTHER"
    

    // Find customer
    const customerId = normalize(projectRow[2])
    const customerRow = customerRows.find(
      (c) => normalize(c[0]) === customerId
    )

    // Build customer object
    const customer = customerRow
      ? {
          customer_id: normalize(customerRow[0]),
          company_name: customerRow[1] || "-",
          customer_type: customerRow[2] || "-",
          pic_name: customerRow[3] || "-",
          pic_position: customerRow[4] || "-",
          email: customerRow[5] || "-",
          phone: customerRow[6] || "-",
          npwp: customerRow[7] || "-",
          address: customerRow[8] || "-",
          city: customerRow[9] || "-",
          province: customerRow[10] || "-",
          postal_code: customerRow[11] || "-",
          status: customerRow[12] || "active",
        }
      : null

    const duration = Date.now() - startTime
    logger.info(`[${requestId}] Project found`, { 
      project_id,
      duration_ms: duration 
    })

    return NextResponse.json({
      project_id: normalize(projectRow[0]),
      project_name: projectRow[1] || "",
      
      // Legacy field
      client: customer?.company_name || customerId,
      
      // Relational
      customer_id: customerId,
      customer,
      
      // Project details
      lokasi: projectRow[3] || "",
      nilai_kontrak: toNumber(projectRow[4]),
      start_date: projectRow[5] || "",
      end_date: projectRow[6] || "",
      status: projectRow[7] || "planning",
      created_at: projectRow[8] || new Date().toISOString(),
      project_type: projectType,
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`
      }
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error(`[${requestId}] GET PROJECT DETAIL ERROR`, error, { duration_ms: duration })

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
   PATCH : UPDATE PROJECT
================================ */
export async function PATCH(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  const requestId = Math.random().toString(36).substring(7)
  const startTime = Date.now()

  try {
    const { project_id } = params
    const body = await req.json()
    
    logger.info(`[${requestId}] Updating project: ${project_id}`, body)

    // Get all projects to find the row
    const projectRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PROJECT_SHEET}!A2:J`,
    })

    const rows = projectRes.data.values || []
    const rowIndex = rows.findIndex((r) => normalize(r[0]) === project_id)

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "Project tidak ditemukan", code: "NOT_FOUND" },
        { status: 404 }
      )
    }

    const actualRow = rowIndex + 2 // +2 karena header dan index 0-based
    const updates: any[] = []

    // Build update requests
    if (body.status) {
      updates.push({
        range: `${PROJECT_SHEET}!H${actualRow}`, // H = status
        values: [[body.status]],
      })
    }

    if (body.project_name) {
      updates.push({
        range: `${PROJECT_SHEET}!B${actualRow}`, // B = project_name
        values: [[body.project_name]],
      })
    }

    if (body.lokasi !== undefined) {
      updates.push({
        range: `${PROJECT_SHEET}!D${actualRow}`, // D = lokasi
        values: [[body.lokasi]],
      })
    }

    if (body.nilai_kontrak !== undefined) {
      updates.push({
        range: `${PROJECT_SHEET}!E${actualRow}`, // E = nilai_kontrak
        values: [[body.nilai_kontrak]],
      })
    }

    if (body.start_date) {
      updates.push({
        range: `${PROJECT_SHEET}!F${actualRow}`, // F = start_date
        values: [[body.start_date]],
      })
    }

    if (body.end_date !== undefined) {
      updates.push({
        range: `${PROJECT_SHEET}!G${actualRow}`, // G = end_date
        values: [[body.end_date]],
      })
    }

    if (body.project_type && allowedTypes.includes(body.project_type)) {
      updates.push({
        range: `${PROJECT_SHEET}!J${actualRow}`, // J = project_type
        values: [[body.project_type]],
      })
    }

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          data: updates,
          valueInputOption: "USER_ENTERED",
        },
      })
    }

    const duration = Date.now() - startTime
    logger.info(`[${requestId}] Project updated`, { 
      project_id,
      updates: updates.length,
      duration_ms: duration 
    })

    return NextResponse.json({
      success: true,
      message: "Project berhasil diupdate",
      updated_fields: updates.map(u => u.range.split('!')[1][0]),
    }, {
      headers: {
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`
      }
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error(`[${requestId}] UPDATE PROJECT ERROR`, error, { duration_ms: duration })

    return NextResponse.json(
      { error: "Gagal mengupdate project", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
