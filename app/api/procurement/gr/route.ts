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

// ================= VALIDATE PO =================
async function getPO(po_id: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PO_SHEET}!A2:P`,
  })

  const rows = res.data.values || []
  const po = rows.find(r => r[0] === po_id && !r[15])
  return po
}

// ================= GET PO ITEMS =================
async function getPOItems(po_id: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PO_ITEM_SHEET}!A2:H`,
  })

  const rows = res.data.values || []
  return rows
    .filter(r => r[1] === po_id)
    .map(r => ({
      po_item_id: r[0],
      qty: Number(r[4] || 0),
      unit_price: Number(r[6] || 0)
    }))
}

// ================= GET RECEIVED QTY =================
async function getReceivedQty(po_item_id: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${GR_ITEM_SHEET}!A2:D`,
  })

  const rows = res.data.values || []
  return rows
    .filter(r => r[2] === po_item_id)
    .reduce((sum, r) => sum + Number(r[3] || 0), 0)
}

// ================= CREATE GR =================
export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.gr_code || !body.po_id) {
      return NextResponse.json({
        success: false,
        error: "gr_code & po_id required"
      }, { status: 400 })
    }

    const po = await getPO(body.po_id)
    if (!po) {
      return NextResponse.json({
        success: false,
        error: "PO not found"
      }, { status: 400 })
    }

    if (po[7] !== "CONFIRMED" && po[7] !== "DELIVERED") {
      return NextResponse.json({
        success: false,
        error: "PO must be CONFIRMED or DELIVERED"
      }, { status: 400 })
    }

    const poItems = await getPOItems(body.po_id)

    const gr_id = "GR-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    let total_received_qty = 0
    let total_amount = 0

    const items = body.items || []

    for (const item of items) {
      const poItem = poItems.find(p => p.po_item_id === item.po_item_id)
      if (!poItem) {
        return NextResponse.json({
          success: false,
          error: `PO item ${item.po_item_id} not found`
        }, { status: 400 })
      }

      const received_qty = Number(item.received_qty)
      const alreadyReceived = await getReceivedQty(item.po_item_id)

      if (alreadyReceived + received_qty > poItem.qty) {
        return NextResponse.json({
          success: false,
          error: "Received qty exceeds PO qty"
        }, { status: 400 })
      }

      total_received_qty += received_qty
      total_amount += received_qty * poItem.unit_price
    }

    // ===== INSERT GR HEADER =====
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${GR_SHEET}!A:Q`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          gr_id,
          body.gr_code,
          body.po_id,
          po[2],                 // vendor_id
          po[3],                 // project_id
          body.receive_date || now,
          body.delivery_note_no || "",
          "RECEIVED",
          body.notes || "",
          total_received_qty,
          total_amount,
          body.created_by || "SYSTEM",
          body.created_by || "SYSTEM",
          "",
          now,
          now,
          ""
        ]]
      }
    })

    // ===== INSERT ITEMS =====
    for (const item of items) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${GR_ITEM_SHEET}!A:D`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            "GRI-" + nanoid(8).toUpperCase(),
            gr_id,
            item.po_item_id,
            Number(item.received_qty)
          ]]
        }
      })
    }

    // ===== CHECK IF PO FULLFILLED =====
    let allDelivered = true
    for (const poItem of poItems) {
      const received = await getReceivedQty(poItem.po_item_id)
      if (received < poItem.qty) {
        allDelivered = false
        break
      }
    }

    if (allDelivered) {
      const rowIndex = po[0]
      const poRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${PO_SHEET}!A2:P`,
      })
      const rows = poRes.data.values || []
      const idx = rows.findIndex(r => r[0] === body.po_id)
      if (idx !== -1) {
        const rowNumber = idx + 2
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${PO_SHEET}!H${rowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [["DELIVERED"]] }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        gr_id,
        total_received_qty,
        total_amount
      }
    })

  } catch (error) {
    console.error("GR CREATE ERROR:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create GR"
    }, { status: 500 })
  }
}
