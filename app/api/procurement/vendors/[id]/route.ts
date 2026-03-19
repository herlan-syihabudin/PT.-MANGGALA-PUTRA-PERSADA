// app/api/procurement/vendors/[id]/route.ts
import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

// ========== CONSTANTS ==========
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_PROCUREMENT_ID!
const VENDOR_SHEET = "VENDORS"

const COLUMNS = {
  VENDOR_ID: 0,
  VENDOR_CODE: 1,
  VENDOR_NAME: 2,
  PHONE: 3,
  EMAIL: 4,
  ADDRESS: 5,
  CITY: 6,
  BANK_NAME: 7,
  BANK_ACCOUNT: 8,
  NPWP: 9,
  STATUS: 10,
  CREATED_BY: 11,
  UPDATED_BY: 12,
  DELETED_BY: 13,
  CREATED_AT: 14,
  UPDATED_AT: 15,
  DELETED_AT: 16,
} as const

// ========== UTILITIES ==========
const isDeleted = (val: any): boolean => {
  return val && String(val).trim() !== ""
}

function isValidEmail(email?: string): boolean {
  if (!email) return true
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(email)
}

function isValidPhone(phone?: string): boolean {
  if (!phone) return true
  const cleaned = phone.replace(/[-\s]/g, '')
  const re = /^(\+62|62|0)[0-9]{9,13}$/
  return re.test(cleaned)
}

function isValidNPWP(npwp?: string): boolean {
  if (!npwp) return true
  const cleaned = npwp.replace(/[.-]/g, '')
  return /^\d{15}$/.test(cleaned)
}

function normalize(str: any): string {
  return String(str || "").trim().toLowerCase()
}

// ========== RATE LIMITING ==========
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60000
const RATE_LIMIT_MAX = 30

function checkRateLimit(req: Request): { allowed: boolean; retryAfter?: number } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
             req.headers.get("x-real-ip") ||
             "unknown"
  const now = Date.now()
  
  const record = rateLimit.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW }
  
  if (now > record.resetAt) {
    record.count = 1
    record.resetAt = now + RATE_LIMIT_WINDOW
  } else {
    record.count++
  }
  
  rateLimit.set(ip, record)
  
  // Cleanup
  if (rateLimit.size > 1000) {
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetAt) {
        rateLimit.delete(key)
      }
    }
  }
  
  return {
    allowed: record.count <= RATE_LIMIT_MAX,
    retryAfter: record.count > RATE_LIMIT_MAX ? Math.ceil((record.resetAt - now) / 1000) : undefined
  }
}

// ========== HELPER: FIND VENDOR ==========
async function findVendorRow(vendor_id: string): Promise<{ index: number; row: string[]; rowNumber: number } | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${VENDOR_SHEET}!A2:Q`,
  })
  
  const rows = res.data.values || []
  const idx = rows.findIndex(r => r[COLUMNS.VENDOR_ID] === vendor_id && !isDeleted(r[COLUMNS.DELETED_AT]))
  
  if (idx === -1) return null
  
  return {
    index: idx,
    row: rows[idx],
    rowNumber: idx + 2
  }
}

// ========== GET SINGLE VENDOR ==========
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(req)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds`,
      }, { status: 429 })
    }

    const vendor_id = params.id
    const vendor = await findVendorRow(vendor_id)

    if (!vendor) {
      return NextResponse.json({
        success: false,
        error: "Vendor not found"
      }, { status: 404 })
    }

    const r = vendor.row
    const data = {
      vendor_id: r[COLUMNS.VENDOR_ID] || "",
      vendor_code: r[COLUMNS.VENDOR_CODE] || "",
      vendor_name: r[COLUMNS.VENDOR_NAME] || "",
      phone: r[COLUMNS.PHONE] || undefined,
      email: r[COLUMNS.EMAIL] || undefined,
      address: r[COLUMNS.ADDRESS] || undefined,
      city: r[COLUMNS.CITY] || undefined,
      bank_name: r[COLUMNS.BANK_NAME] || undefined,
      bank_account: r[COLUMNS.BANK_ACCOUNT] || undefined,
      npwp: r[COLUMNS.NPWP] || undefined,
      status: r[COLUMNS.STATUS] as "ACTIVE" | "INACTIVE",
      created_by: r[COLUMNS.CREATED_BY] || undefined,
      updated_by: r[COLUMNS.UPDATED_BY] || undefined,
      deleted_by: r[COLUMNS.DELETED_BY] || undefined,
      created_at: r[COLUMNS.CREATED_AT] || "",
      updated_at: r[COLUMNS.UPDATED_AT] || "",
      deleted_at: isDeleted(r[COLUMNS.DELETED_AT]) ? r[COLUMNS.DELETED_AT] : null,
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error("GET VENDOR ERROR:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch vendor"
    }, { status: 500 })
  }
}

// ========== UPDATE VENDOR ==========
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(req)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds`,
      }, { status: 429 })
    }

    const vendor_id = params.id
    const body = await req.json()
    const vendor = await findVendorRow(vendor_id)

    if (!vendor) {
      return NextResponse.json({
        success: false,
        error: "Vendor not found"
      }, { status: 404 })
    }

    const r = vendor.row
    const rowNumber = vendor.rowNumber

    // 🔥 VALIDASI INPUT
    if (body.email && !isValidEmail(body.email)) {
      return NextResponse.json({
        success: false,
        error: "Invalid email format"
      }, { status: 400 })
    }

    if (body.phone && !isValidPhone(body.phone)) {
      return NextResponse.json({
        success: false,
        error: "Invalid phone format. Must be Indonesian number (08xx, 62xx, +62xx)"
      }, { status: 400 })
    }

    if (body.npwp && !isValidNPWP(body.npwp)) {
      return NextResponse.json({
        success: false,
        error: "Invalid NPWP format. Must be 15 digits"
      }, { status: 400 })
    }

    // Check duplicate vendor_code if changing
    if (body.vendor_code && body.vendor_code !== r[COLUMNS.VENDOR_CODE]) {
      const checkRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${VENDOR_SHEET}!B2:B`,
      })
      
      const existingCodes = (checkRes.data.values || []).map((row, i) => ({
  code: normalize(row[0]),
  rowNumber: i + 2
}))

const isDuplicate = existingCodes.some(item =>
  item.code === normalize(body.vendor_code) &&
  item.rowNumber !== rowNumber
)

if (isDuplicate) {
  return NextResponse.json({
    success: false,
    error: "vendor_code must be unique"
  }, { status: 409 })
}
    }

    const now = new Date().toISOString()
    
    // Build updates array (B to Q)
    const updates = [
      body.vendor_code ?? r[COLUMNS.VENDOR_CODE],
      body.vendor_name ?? r[COLUMNS.VENDOR_NAME],
      body.phone ?? r[COLUMNS.PHONE] ?? "",
      body.email ?? r[COLUMNS.EMAIL] ?? "",
      body.address ?? r[COLUMNS.ADDRESS] ?? "",
      body.city ?? r[COLUMNS.CITY] ?? "",
      body.bank_name ?? r[COLUMNS.BANK_NAME] ?? "",
      body.bank_account ?? r[COLUMNS.BANK_ACCOUNT] ?? "",
      body.npwp ?? r[COLUMNS.NPWP] ?? "",
      body.status ?? r[COLUMNS.STATUS],
      r[COLUMNS.CREATED_BY],           // created_by unchanged
      body.updated_by || r[COLUMNS.UPDATED_BY] || "SYSTEM",
      r[COLUMNS.DELETED_BY] ?? "",      // deleted_by
      r[COLUMNS.CREATED_AT],            // created_at unchanged
      now,                               // updated_at
      r[COLUMNS.DELETED_AT] ?? "",       // deleted_at
    ]

    // 🔥 UPDATE ALL COLUMNS (A to Q)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${VENDOR_SHEET}!A${rowNumber}:Q${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[vendor_id, ...updates]]
      }
    })

    // Fetch updated data
    const updated = await findVendorRow(vendor_id)
    const ur = updated!.row

    // 🔥 LOGGING
    console.log(`[VENDOR UPDATED] ${vendor_id} by ${body.updated_by || 'SYSTEM'}`)

    return NextResponse.json({
      success: true,
      data: {
        vendor_id,
        vendor_code: ur[COLUMNS.VENDOR_CODE],
        vendor_name: ur[COLUMNS.VENDOR_NAME],
        phone: ur[COLUMNS.PHONE] || undefined,
        email: ur[COLUMNS.EMAIL] || undefined,
        address: ur[COLUMNS.ADDRESS] || undefined,
        city: ur[COLUMNS.CITY] || undefined,
        bank_name: ur[COLUMNS.BANK_NAME] || undefined,
        bank_account: ur[COLUMNS.BANK_ACCOUNT] || undefined,
        npwp: ur[COLUMNS.NPWP] || undefined,
        status: ur[COLUMNS.STATUS],
        created_by: ur[COLUMNS.CREATED_BY] || undefined,
        updated_by: ur[COLUMNS.UPDATED_BY] || undefined,
        deleted_by: ur[COLUMNS.DELETED_BY] || undefined,
        created_at: ur[COLUMNS.CREATED_AT],
        updated_at: ur[COLUMNS.UPDATED_AT],
        deleted_at: isDeleted(ur[COLUMNS.DELETED_AT]) ? ur[COLUMNS.DELETED_AT] : null,
      }
    })

  } catch (error) {
    console.error("UPDATE VENDOR ERROR:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to update vendor"
    }, { status: 500 })
  }
}

// ========== DELETE VENDOR ==========
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(req)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds`,
      }, { status: 429 })
    }

    const vendor_id = params.id
    const { searchParams } = new URL(req.url)
    const permanent = searchParams.get('permanent') === 'true'
    const deleted_by = searchParams.get('deleted_by') || "SYSTEM"

    const vendor = await findVendorRow(vendor_id)

    if (!vendor) {
      return NextResponse.json({
        success: false,
        error: "Vendor not found"
      }, { status: 404 })
    }

    const rowNumber = vendor.rowNumber

    if (permanent) {
      // Permanent delete - remove entire row
      const sheetMeta = await sheets.spreadsheets.get({ 
        spreadsheetId: SHEET_ID 
      })
      
      const sheet = sheetMeta.data.sheets?.find(
        s => s.properties?.title === VENDOR_SHEET
      )
      
      if (!sheet?.properties?.sheetId) {
        return NextResponse.json({
          success: false,
          error: "Sheet not found"
        }, { status: 404 })
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: "ROWS",
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              }
            }
          }]
        }
      })

      console.log(`[VENDOR PERMANENT_DELETED] ${vendor_id} by ${deleted_by}`)

      return NextResponse.json({
        success: true,
        message: "Vendor permanently deleted"
      })
    } else {
      // Soft delete - set deleted_at and deleted_by
      const now = new Date().toISOString()
      
      // 🔥 BATCH UPDATE kedua kolom sekaligus
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: [
            {
              range: `${VENDOR_SHEET}!Q${rowNumber}`,
              values: [[now]]
            },
            {
              range: `${VENDOR_SHEET}!N${rowNumber}`,
              values: [[deleted_by]]
            }
          ]
        }
      })

      console.log(`[VENDOR SOFT_DELETED] ${vendor_id} by ${deleted_by}`)

      return NextResponse.json({
        success: true,
        message: "Vendor soft deleted"
      })
    }

  } catch (error) {
    console.error("DELETE VENDOR ERROR:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete vendor"
    }, { status: 500 })
  }
}
