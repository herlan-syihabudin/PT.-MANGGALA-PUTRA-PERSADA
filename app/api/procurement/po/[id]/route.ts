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
const PO_SHEET = "PURCHASE_ORDER"
const PO_ITEM_SHEET = "PO_ITEMS"
const GR_SHEET = "GOODS_RECEIPT"

// Valid status transitions
const VALID_PO_STATUS_TRANSITIONS: Record<string, string[]> = {
  "DRAFT": ["SENT"],
  "SENT": ["CONFIRMED"],
  "CONFIRMED": ["DELIVERED"],
  "DELIVERED": ["CLOSED"],
  "CLOSED": [],
}

// Helper: Find PO row
async function findPORow(po_id: string): Promise<{ index: number; row: string[]; rowNumber: number } | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PO_SHEET}!A2:P`,
  })
  
  const rows = res.data.values || []
  const idx = rows.findIndex(r => r[0] === po_id && !r[15])
  
  if (idx === -1) return null
  
  return {
    index: idx,
    row: rows[idx],
    rowNumber: idx + 2
  }
}

// Helper: Check if PO has GRs
async function hasGRs(po_id: string): Promise<boolean> {
  const grRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${GR_SHEET}!C2:C`,
  })
  const grRows = grRes.data.values || []
  return grRows.some(r => r[0] === po_id)
}

// Helper: Get items for PO
async function getPOItems(po_id: string): Promise<any[]> {
  const itemRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PO_ITEM_SHEET}!A2:J`,
  })
  
  const rows = itemRes.data.values || []
  return rows
    .filter(r => r[1] === po_id)
    .map(r => ({
      po_item_id: r[0] || "",
      po_id: r[1] || "",
      material_id: r[2] || undefined,
      description: r[3] || "",
      qty: Number(r[4] || 0),
      unit: r[5] || "",
      unit_price: Number(r[6] || 0),
      subtotal: Number(r[7] || 0),
      created_at: r[8] || "",
      updated_at: r[9] || "",
    }))
}

// ==================== GET SINGLE PO ====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const po_id = params.id
    const po = await findPORow(po_id)

    if (!po) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "PO not found"
      }, { status: 404 })
    }

    const r = po.row
    const items = await getPOItems(po_id)

    const data = {
      po_id: r[0] || "",
      po_code: r[1] || "",
      vendor_id: r[2] || "",
      project_id: r[3] || "",
      pr_id: r[4] || undefined,
      order_date: r[5] || "",
      delivery_date: r[6] || undefined,
      status: r[7] || "DRAFT",
      notes: r[8] || undefined,
      total_amount: Number(r[9] || 0),
      created_by: r[10] || undefined,
      updated_by: r[11] || undefined,
      deleted_by: r[12] || undefined,
      created_at: r[13] || "",
      updated_at: r[14] || "",
      items,
    }

    return NextResponse.json({
      success: true,
      data,
      error: null
    })

  } catch (error) {
    console.error("GET PO ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to fetch PO"
    }, { status: 500 })
  }
}

// ==================== UPDATE PO ====================
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const po_id = params.id
    const body = await req.json()
    const po = await findPORow(po_id)

    if (!po) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "PO not found"
      }, { status: 404 })
    }

    const r = po.row
    const rowNumber = po.rowNumber
    const now = new Date().toISOString()

    // Rule: Cannot update qty after GR created
    if (body.items) {
      const hasGR = await hasGRs(po_id)
      if (hasGR) {
        return NextResponse.json({
          success: false,
          data: null,
          error: "Cannot update PO items after GR created"
        }, { status: 400 })
      }
    }

    // Validate status transition
    if (body.status && body.status !== r[7]) {
      if (!isValidPOStatusTransition(r[7], body.status)) {
        return NextResponse.json({
          success: false,
          data: null,
          error: `Invalid status transition from ${r[7]} to ${body.status}`
        }, { status: 400 })
      }
    }

    // Calculate new total amount if items changed
    let total_amount = Number(r[9] || 0)
    if (body.items) {
      total_amount = body.items.reduce((sum: number, item: any) => {
        const qty = Number(item.qty || 0)
        const unit_price = Number(item.unit_price || 0)
        return sum + (qty * unit_price)
      }, 0)
    }

    const updates = [
      body.po_code ?? r[1],
      body.vendor_id ?? r[2],
      body.project_id ?? r[3],
      body.pr_id ?? r[4],
      body.order_date ?? r[5],
      body.delivery_date ?? r[6],
      body.status ?? r[7],
      body.notes ?? r[8],
      total_amount,
      r[10], // created_by
      body.updated_by || r[11] || "SYSTEM",
      r[12], // deleted_by
      r[13], // created_at
      now,   // updated_at
      r[15], // deleted_at
    ]

    // Update columns B to O (index 1 to 14)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${PO_SHEET}!B${rowNumber}:O${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updates]
      }
    })

    // Update items if provided
    if (body.items) {
      // In production, you'd implement proper item CRUD
      // For now, we'll just update the items
      for (const item of body.items) {
        if (item.po_item_id) {
          // Update existing item
          const itemRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${PO_ITEM_SHEET}!A2:J`,
          })
          const itemRows = itemRes.data.values || []
          const itemIdx = itemRows.findIndex(r => r[0] === item.po_item_id)
          
          if (itemIdx !== -1) {
            const itemRowNumber = itemIdx + 2
            const qty = Number(item.qty || 0)
            const unit_price = Number(item.unit_price || 0)
            const subtotal = qty * unit_price

            await sheets.spreadsheets.values.update({
              spreadsheetId: SHEET_ID,
              range: `${PO_ITEM_SHEET}!B${itemRowNumber}:J${itemRowNumber}`,
              valueInputOption: "USER_ENTERED",
              requestBody: {
                values: [[
                  item.material_id || "",
                  item.description,
                  qty,
                  item.unit || "",
                  unit_price,
                  subtotal,
                  now,
                  now,
                ]]
              }
            })
          }
        }
      }
    }

    const items = await getPOItems(po_id)

    return NextResponse.json({
      success: true,
      data: {
        po_id,
        po_code: updates[0],
        vendor_id: updates[1],
        project_id: updates[2],
        pr_id: updates[3],
        order_date: updates[4],
        delivery_date: updates[5],
        status: updates[6],
        notes: updates[7],
        total_amount: updates[8],
        created_by: updates[9],
        updated_by: updates[10],
        created_at: updates[12],
        updated_at: updates[13],
        items,
      },
      error: null
    })

  } catch (error) {
    console.error("UPDATE PO ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to update PO"
    }, { status: 500 })
  }
}

// ==================== SOFT DELETE PO ====================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const po_id = params.id
    const { searchParams } = new URL(req.url)
    const permanent = searchParams.get('permanent') === 'true'
    const deleted_by = searchParams.get('deleted_by') || "SYSTEM"

    const po = await findPORow(po_id)

    if (!po) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "PO not found"
      }, { status: 404 })
    }

    // Check if PO has GRs
    const hasGR = await hasGRs(po_id)
    if (hasGR) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Cannot delete PO with existing Goods Receipt"
      }, { status: 400 })
    }

    const rowNumber = po.rowNumber

    if (permanent) {
      // Permanent delete
      const sheetMeta = await sheets.spreadsheets.get({ 
        spreadsheetId: SHEET_ID 
      })
      
      const sheet = sheetMeta.data.sheets?.find(
        s => s.properties?.title === PO_SHEET
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
        data: { message: "PO permanently deleted" },
        error: null
      })
    } else {
      // Soft delete
      const now = new Date().toISOString()
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${PO_SHEET}!P${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[now]]
        }
      })

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${PO_SHEET}!M${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[deleted_by]]
        }
      })

      return NextResponse.json({
        success: true,
        data: { message: "PO soft deleted" },
        error: null
      })
    }

  } catch (error) {
    console.error("DELETE PO ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to delete PO"
    }, { status: 500 })
  }
}

// Helper function
function isValidPOStatusTransition(oldStatus: string, newStatus: string): boolean {
  if (oldStatus === newStatus) return true
  const allowed = VALID_PO_STATUS_TRANSITIONS[oldStatus] || []
  return allowed.includes(newStatus)
}
