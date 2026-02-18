import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_PROCUREMENT_ID!
const VENDOR_SHEET = "VENDORS"

// Helper: Find vendor row
async function findVendorRow(vendor_id: string): Promise<{ index: number; row: string[]; rowNumber: number } | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${VENDOR_SHEET}!A2:Q`,
  })
  
  const rows = res.data.values || []
  const idx = rows.findIndex(r => r[0] === vendor_id && !r[16])
  
  if (idx === -1) return null
  
  return {
    index: idx,
    row: rows[idx],
    rowNumber: idx + 2
  }
}

// ==================== GET SINGLE VENDOR ====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendor_id = params.id
    const vendor = await findVendorRow(vendor_id)

    if (!vendor) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Vendor not found"
      }, { status: 404 })
    }

    const r = vendor.row
    const data = {
      vendor_id: r[0] || "",
      vendor_code: r[1] || "",
      vendor_name: r[2] || "",
      phone: r[3] || undefined,
      email: r[4] || undefined,
      address: r[5] || undefined,
      city: r[6] || undefined,
      bank_name: r[7] || undefined,
      bank_account: r[8] || undefined,
      npwp: r[9] || undefined,
      status: r[10] as "ACTIVE" | "INACTIVE",
      created_by: r[11] || undefined,
      updated_by: r[12] || undefined,
      deleted_by: r[13] || undefined,
      created_at: r[14] || "",
      updated_at: r[15] || "",
      deleted_at: r[16] || null,
    }

    return NextResponse.json({
      success: true,
      data,
      error: null
    })

  } catch (error) {
    console.error("GET VENDOR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to fetch vendor"
    }, { status: 500 })
  }
}

// ==================== UPDATE VENDOR ====================
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendor_id = params.id
    const body = await req.json()
    const vendor = await findVendorRow(vendor_id)

    if (!vendor) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Vendor not found"
      }, { status: 404 })
    }

    const r = vendor.row
    const rowNumber = vendor.rowNumber

    // Check duplicate vendor_code if changing
    if (body.vendor_code && body.vendor_code !== r[1]) {
      const checkRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${VENDOR_SHEET}!B2:B`,
      })
      
      const existingCodes = (checkRes.data.values || []).map(r => String(r[0] || "").trim().toLowerCase())
      if (existingCodes.includes(String(body.vendor_code).trim().toLowerCase())) {
        return NextResponse.json({
          success: false,
          data: null,
          error: "vendor_code must be unique"
        }, { status: 400 })
      }
    }

    const now = new Date().toISOString()
    const updates = [
      body.vendor_code ?? r[1],
      body.vendor_name ?? r[2],
      body.phone ?? r[3],
      body.email ?? r[4],
      body.address ?? r[5],
      body.city ?? r[6],
      body.bank_name ?? r[7],
      body.bank_account ?? r[8],
      body.npwp ?? r[9],
      body.status ?? r[10],
      r[11], // created_by (unchanged)
      body.updated_by || r[12] || "SYSTEM",
      r[13], // deleted_by
      r[14], // created_at
      now,   // updated_at
      r[16], // deleted_at
    ]

    // Update columns B to P (index 1 to 15)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${VENDOR_SHEET}!B${rowNumber}:P${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updates]
      }
    })

    // Fetch updated data
    const updated = await findVendorRow(vendor_id)
    const ur = updated!.row

    return NextResponse.json({
      success: true,
      data: {
        vendor_id,
        vendor_code: ur[1],
        vendor_name: ur[2],
        phone: ur[3] || undefined,
        email: ur[4] || undefined,
        address: ur[5] || undefined,
        city: ur[6] || undefined,
        bank_name: ur[7] || undefined,
        bank_account: ur[8] || undefined,
        npwp: ur[9] || undefined,
        status: ur[10],
        created_by: ur[11] || undefined,
        updated_by: ur[12] || undefined,
        deleted_by: ur[13] || undefined,
        created_at: ur[14],
        updated_at: ur[15],
        deleted_at: ur[16] || null,
      },
      error: null
    })

  } catch (error) {
    console.error("UPDATE VENDOR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to update vendor"
    }, { status: 500 })
  }
}

// ==================== SOFT DELETE VENDOR ====================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendor_id = params.id
    const { searchParams } = new URL(req.url)
    const permanent = searchParams.get('permanent') === 'true'
    const deleted_by = searchParams.get('deleted_by') || "SYSTEM"

    const vendor = await findVendorRow(vendor_id)

    if (!vendor) {
      return NextResponse.json({
        success: false,
        data: null,
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
          data: null,
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

      return NextResponse.json({
        success: true,
        data: { message: "Vendor permanently deleted" },
        error: null
      })
    } else {
      // Soft delete - set deleted_at and deleted_by
      const now = new Date().toISOString()
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${VENDOR_SHEET}!Q${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[now]]
        }
      })

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${VENDOR_SHEET}!N${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[deleted_by]]
        }
      })

      return NextResponse.json({
        success: true,
        data: { message: "Vendor soft deleted" },
        error: null
      })
    }

  } catch (error) {
    console.error("DELETE VENDOR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to delete vendor"
    }, { status: 500 })
  }
}
