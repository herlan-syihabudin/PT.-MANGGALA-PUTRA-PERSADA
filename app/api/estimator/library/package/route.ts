import { NextResponse } from "next/server"
import { google } from "googleapis"
import { v4 as uuidv4 } from 'uuid'

// Environment validation
const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_ESTIMATOR_ID'] as const
const missing = required.filter(key => !process.env[key])
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`)
}

// Helper untuk generate slug dari string
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, category, type, status, notes, items } = body

    // ===== VALIDASI INPUT =====
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Package name is required" },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one item is required" },
        { status: 400 }
      )
    }

    // ===== GENERATE ID =====
    const packageId = `PKG-${uuidv4().slice(0, 8)}` // PKG-a1b2c3d4
    const now = new Date().toISOString()
    const createdBy = process.env.USER_ID || "SYSTEM" // TODO: Replace with actual user from session

    // ===== GENERATE SLUGS =====
    const categorySlug = generateSlug(category)
    const categoryId = `CAT-${categorySlug}`
    const scopeId = `SCOPE-${categorySlug}`

    // ===== PREPARE ROWS =====
    const rows = items.map((item: any) => {
      // Validasi per item
      if (!item.jobId || !item.jobName || !item.unit) {
        throw new Error(`Item ${item.jobName || 'unknown'} missing required fields`)
      }

      return [
        packageId,                    // PACKAGE_ID
        name,                         // PACKAGE_NAME
        categoryId,                   // CATEGORY_ID
        category,                     // CATEGORY (denormalized)
        scopeId,                      // SCOPE_ID
        category,                     // SCOPE (denormalized - bisa diubah nanti)
        item.jobId,                   // JOB_NAME_ID
        item.jobName,                 // JOB_NAME
        item.unit,                    // UNIT
        0,                            // MATERIAL_PRICE (to be filled later)
        0,                            // LABOUR_PRICE (to be filled later)
        0,                            // TOTAL_PRICE
        status || 'active',           // STATUS
        now,                          // CREATED_AT
        createdBy,                    // CREATED_BY
        now,                          // UPDATED_AT
        createdBy,                    // UPDATED_BY
        notes || ''                   // NOTES
      ]
    })

    // ===== AUTH =====
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    )

    const sheets = google.sheets({ version: "v4", auth })
    const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

    // ===== APPEND TO SHEET =====
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "WORK_LIBRARY!A:R",
      valueInputOption: "RAW",
      requestBody: { values: rows }
    })

    return NextResponse.json({ 
      success: true, 
      package_id: packageId,
      message: `Package ${name} created with ${items.length} items`
    })

  } catch (error: any) {
    console.error('Error creating package:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create package" 
      },
      { status: 500 }
    )
  }
}
