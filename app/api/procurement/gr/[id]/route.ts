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
const GR_SHEET = "GOODS_RECEIPT"
const GR_ITEM_SHEET = "GR_ITEMS"

// Helper: Find GR row
async function findGRRow(gr_id: string): Promise<{ index: number; row: string[]; rowNumber: number } | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${GR_SHEET}!A2:H`,
  })
  
  const rows = res.data.values || []
  const idx = rows.findIndex(r => r[0] === gr_id)
  
  if (idx === -1) return null
  
  return {
    index: idx,
    row: rows[idx],
    rowNumber: idx + 2
  }
}

// Helper: Get items for GR
async function getGRItems(gr_id: string): Promise<any[]> {
  const itemRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${GR_ITEM_SHEET}!A2:D`,
  })
  
  const rows = itemRes.data.values || []
  return rows
    .filter(r => r[1] === gr_id)
    .map(r => ({
      gr_item_id: r[0] || "",
      gr_id: r[1] || "",
      po_item_id: r[2] || "",
      received_qty: Number(r[3] || 0),
    }))
}

// ==================== GET SINGLE GR ====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gr_id = params.id
    const gr = await findGRRow(gr_id)

    if (!gr) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "GR not found"
      }, { status: 404 })
    }

    const r = gr.row
    const items = await getGRItems(gr_id)

    const data = {
      gr_id: r[0] || "",
      gr_code: r[1] || "",
      po_id: r[2] || "",
      received_date: r[3] || "",
      received_by: r[4] || "",
      notes: r[5] || undefined,
      created_at: r[6] || "",
      updated_at: r[7] || "",
      items,
    }

    return NextResponse.json({
      success: true,
      data,
      error: null
    })

  } catch (error) {
    console.error("GET GR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to fetch GR"
    }, { status: 500 })
  }
}

// ==================== UPDATE GR ====================
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gr_id = params.id
    const body = await req.json()
    const gr = await findGRRow(gr_id)

    if (!gr) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "GR not found"
      }, { status: 404 })
    }

    const r = gr.row
    const rowNumber = gr.rowNumber
    const now = new Date().toISOString()

    const updates = [
      body.gr_code ?? r[1],
      body.po_id ?? r[2],
      body.received_date ?? r[3],
      body.received_by ?? r[4],
      body.notes ?? r[5],
      r[6], // created_at
      now,  // updated_at
    ]

    // Update columns B to H (index 1 to 7)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${GR_SHEET}!B${rowNumber}:H${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updates]
      }
    })

    const items = await getGRItems(gr_id)

    return NextResponse.json({
      success: true,
      data: {
        gr_id,
        gr_code: updates[0],
        po_id: updates[1],
        received_date: updates[2],
        received_by: updates[3],
        notes: updates[4],
        created_at: updates[5],
        updated_at: updates[6],
        items,
      },
      error: null
    })

  } catch (error) {
    console.error("UPDATE GR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to update GR"
    }, { status: 500 })
  }
}

// ==================== DELETE GR ====================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gr_id = params.id
    const gr = await findGRRow(gr_id)

    if (!gr) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "GR not found"
      }, { status: 404 })
    }

    const rowNumber = gr.rowNumber

    // Permanent delete only (GR doesn't have soft delete)
    const sheetMeta = await sheets.spreadsheets.get({ 
      spreadsheetId: SHEET_ID 
    })
    
    const sheet = sheetMeta.data.sheets?.find(
      s => s.properties?.title === GR_SHEET
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
      data: { message: "GR deleted" },
      error: null
    })

  } catch (error) {
    console.error("DELETE GR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to delete GR"
    }, { status: 500 })
  }
}
