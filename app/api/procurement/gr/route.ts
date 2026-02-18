import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

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
const PO_SHEET = "PURCHASE_ORDER"
const PO_ITEM_SHEET = "PO_ITEMS"

type GR = {
  gr_id: string
  gr_code: string
  po_id: string
  received_date: string
  received_by: string
  notes?: string
  created_at: string
  updated_at: string
}

type GRItem = {
  gr_item_id: string
  gr_id: string
  po_item_id: string
  received_qty: number
}

// Helper: Validate PO exists and get its status
async function validatePO(po_id: string): Promise<{ exists: boolean; status: string }> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PO_SHEET}!A2:H`,
  })
  const rows = res.data.values || []
  const po = rows.find(r => r[0] === po_id && !r[15])
  
  if (!po) return { exists: false, status: "" }
  return { exists: true, status: po[7] || "" }
}

// Helper: Get PO items with their qtys
async function getPOItems(po_id: string): Promise<any[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PO_ITEM_SHEET}!A2:H`,
  })
  const rows = res.data.values || []
  return rows
    .filter(r => r[1] === po_id)
    .map(r => ({
      po_item_id: r[0] || "",
      qty: Number(r[4] || 0),
    }))
}

// Helper: Get total received qty for a PO item
async function getReceivedQty(po_item_id: string): Promise<number> {
  const grItemRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${GR_ITEM_SHEET}!C2:D`,
  })
  const grItemRows = grItemRes.data.values || []
  return grItemRows
    .filter(r => r[0] === po_item_id)
    .reduce((sum, r) => sum + Number(r[1] || 0), 0)
}

// ==================== GET ALL GRs ====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const po_id = searchParams.get('po_id')

    const grRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${GR_SHEET}!A2:H`,
    })

    let grRows = grRes.data.values || []
    
    if (po_id) {
      grRows = grRows.filter(r => r[2] === po_id)
    }

    const grs: GR[] = grRows.map(r => ({
      gr_id: r[0] || "",
      gr_code: r[1] || "",
      po_id: r[2] || "",
      received_date: r[3] || "",
      received_by: r[4] || "",
      notes: r[5] || undefined,
      created_at: r[6] || "",
      updated_at: r[7] || "",
    }))

    // Fetch items for each GR
    const itemRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${GR_ITEM_SHEET}!A2:D`,
    })
    const itemRows = itemRes.data.values || []
    
    const itemsByGR = itemRows.reduce((acc, r) => {
      const gr_id = r[1]
      if (!acc[gr_id]) acc[gr_id] = []
      acc[gr_id].push({
        gr_item_id: r[0] || "",
        gr_id: r[1] || "",
        po_item_id: r[2] || "",
        received_qty: Number(r[3] || 0),
      })
      return acc
    }, {} as Record<string, GRItem[]>)

    const result = grs.map(gr => ({
      ...gr,
      items: itemsByGR[gr.gr_id] || []
    }))

    return NextResponse.json({
      success: true,
      data: result,
      error: null
    })

  } catch (error) {
    console.error("GET GRs ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to fetch GRs"
    }, { status: 500 })
  }
}

// ==================== CREATE GR ====================
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate required fields
    if (!body.gr_code) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "gr_code is required"
      }, { status: 400 })
    }
    
    if (!body.po_id) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "po_id is required"
      }, { status: 400 })
    }

    if (!body.received_by) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "received_by is required"
      }, { status: 400 })
    }

    // Validate PO exists and has proper status
    const po = await validatePO(body.po_id)
    if (!po.exists) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "PO not found"
      }, { status: 400 })
    }

    // Rule: GR only if PO is CONFIRMED or DELIVERED
    if (po.status !== "CONFIRMED" && po.status !== "DELIVERED") {
      return NextResponse.json({
        success: false,
        data: null,
        error: "PO must be CONFIRMED or DELIVERED to create GR"
      }, { status: 400 })
    }

    // Check duplicate gr_code
    const checkRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${GR_SHEET}!B2:B`,
    })
    
    const existingCodes = (checkRes.data.values || []).map(r => String(r[0] || "").trim().toLowerCase())
    if (existingCodes.includes(String(body.gr_code).trim().toLowerCase())) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "gr_code must be unique"
      }, { status: 400 })
    }

    // Get PO items for validation
    const poItems = await getPOItems(body.po_id)
    
    // Validate received quantities
    const items = body.items || []
    const createdItems: GRItem[] = []

    for (const item of items) {
      if (!item.po_item_id) {
        return NextResponse.json({
          success: false,
          data: null,
          error: "po_item_id is required for each item"
        }, { status: 400 })
      }

      const poItem = poItems.find(p => p.po_item_id === item.po_item_id)
      if (!poItem) {
        return NextResponse.json({
          success: false,
          data: null,
          error: `PO item ${item.po_item_id} not found`
        }, { status: 400 })
      }

      const received_qty = Number(item.received_qty || 0)
      if (received_qty <= 0) {
        return NextResponse.json({
          success: false,
          data: null,
          error: "received_qty must be positive"
        }, { status: 400 })
      }

      // Check total received qty doesn't exceed PO qty
      const alreadyReceived = await getReceivedQty(item.po_item_id)
      if (alreadyReceived + received_qty > poItem.qty) {
        return NextResponse.json({
          success: false,
          data: null,
          error: `Total received quantity (${alreadyReceived + received_qty}) exceeds PO quantity (${poItem.qty})`
        }, { status: 400 })
      }
    }

    const gr_id = "GR-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    // Create GR header
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${GR_SHEET}!A:H`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          gr_id,
          body.gr_code,
          body.po_id,
          body.received_date || now,
          body.received_by,
          body.notes || "",
          now,
          now,
        ]]
      }
    })

    // Create GR items
    for (const item of items) {
      const gr_item_id = "GRI-" + nanoid(8).toUpperCase()

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${GR_ITEM_SHEET}!A:D`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            gr_item_id,
            gr_id,
            item.po_item_id,
            Number(item.received_qty || 0),
          ]]
        }
      })

      createdItems.push({
        gr_item_id,
        gr_id,
        po_item_id: item.po_item_id,
        received_qty: Number(item.received_qty || 0),
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        gr_id,
        gr_code: body.gr_code,
        po_id: body.po_id,
        received_date: body.received_date || now,
        received_by: body.received_by,
        notes: body.notes,
        created_at: now,
        updated_at: now,
        items: createdItems,
      },
      error: null
    }, { status: 201 })

  } catch (error) {
    console.error("CREATE GR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to create GR"
    }, { status: 500 })
  }
}
