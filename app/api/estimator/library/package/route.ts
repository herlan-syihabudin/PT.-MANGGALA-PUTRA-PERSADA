import { NextResponse } from "next/server"
import { google } from "googleapis"
import { v4 as uuidv4 } from 'uuid'

// ==================== CONSTANTS ====================
const SHEET_RANGE = "WORK_LIBRARY!A:N"
const REQUIRED_ENV = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_ESTIMATOR_ID'] as const

// ==================== HELPER FUNCTIONS ====================
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function validateEnv() {
  const missing = REQUIRED_ENV.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

function getAuth() {
  return new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )
}

function validateItem(item: any, index: number) {
  const errors: string[] = []
  
  if (!item.jobName) {
    errors.push(`Item ${index + 1}: jobName wajib diisi`)
  }
  if (!item.unit) {
    errors.push(`Item ${index + 1}: unit wajib diisi`)
  }
  if (item.material_price && isNaN(Number(item.material_price))) {
    errors.push(`Item ${index + 1}: material_price harus berupa angka`)
  }
  if (item.labour_price && isNaN(Number(item.labour_price))) {
    errors.push(`Item ${index + 1}: labour_price harus berupa angka`)
  }
  
  return errors
}

// ==================== POST ====================
export async function POST(req: Request) {
  try {
    // Validate environment
    validateEnv()
    
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

    // Validate each item
    const validationErrors = items.flatMap((item, idx) => validateItem(item, idx))
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed",
          details: validationErrors 
        },
        { status: 400 }
      )
    }

    // ===== GENERATE ID =====
    const packageId = `PKG-${uuidv4().split('-')[0]}` // PKG-a1b2c3d4
    const now = new Date().toISOString()
    const createdBy = process.env.USER_ID || "SYSTEM"

    // ===== PREPARE ROWS =====
    const rows = items.map((item: any) => [
      packageId,                   // A package_id
      name,                        // B package_name
      item.scope || category
item.category || category
      item.jobName,                // E job_name
      item.unit,                   // F unit
      status || "active",          // G status
      now,                         // H created_at
      createdBy,                   // I created_by
      now,                         // J updated_at
      createdBy,                   // K updated_by
      notes || "",                 // L notes
      item.material_price || 0,    // M material_price (jika ada kolom)
      item.labour_price || 0       // N labour_price (jika ada kolom)
    ])

    // ===== AUTH =====
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

    // ===== APPEND TO SHEET =====
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
      valueInputOption: "USER_ENTERED", // Better for numbers
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

// ==================== GET ====================
export async function GET() {
  try {
    validateEnv()
    
    const auth = getAuth()
    const sheets = google.sheets({ version: "v4", auth })
    const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE
    })

    const rows = res.data.values || []
    
    // Skip header
    const dataRows = rows.slice(1)
    
    // Group by package_id
    const packageMap = new Map()
    
    dataRows.forEach(row => {
      const pkgId = row[0]
      if (!pkgId) return
      
      if (!packageMap.has(pkgId)) {
        packageMap.set(pkgId, {
          id: pkgId,
          name: row[1] || '',
          category: row[3] || '',
          status: row[6] || 'draft',
          created_at: row[7] || '',
          created_by: row[8] || '',
          updated_at: row[9] || '',
          updated_by: row[10] || '',
          notes: row[11] || '',
          items: []
        })
      }
      
      const pkg = packageMap.get(pkgId)
      pkg.items.push({
        job_name: row[4] || '',
        unit: row[5] || '',
        material_price: Number(row[12]) || 0,
        labour_price: Number(row[13]) || 0
      })
    })

    const packages = Array.from(packageMap.values()).map(pkg => ({
      ...pkg,
      itemCount: pkg.items.length,
      estimatedCost: pkg.items.reduce((sum, item) => 
        sum + (item.material_price || 0) + (item.labour_price || 0), 0
      )
    }))

    return NextResponse.json({
      success: true,
      data: packages,
      metadata: {
        total_packages: packages.length,
        total_items: dataRows.length
      }
    })

  } catch (error: any) {
    console.error("GET package error:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
