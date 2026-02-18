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

const GR_SHEET = "GOODS_RECEIPT"   // A:Q
const GR_ITEM_SHEET = "GR_ITEMS"   // A:K
const PO_SHEET = "PURCHASE_ORDER"  // A:P
const PO_ITEM_SHEET = "PO_ITEMS"   // A:H

// ---------- helpers ----------
function normalize(s: any) {
  return String(s || "").trim().toLowerCase()
}
function num(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
function nowISO() {
  return new Date().toISOString()
}

async function getAllRows(range: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  })
  return res.data.values || []
}

// PO row finder (soft delete aware, P = deleted_at index 15)
async function findPO(po_id: string) {
  const rows = await getAllRows(`${PO_SHEET}!A2:P`)
  const po = rows.find(r => r[0] === po_id && !r[15])
  return po || null
}

// PO items map
async function getPOItemsMap(po_id: string) {
  const rows = await getAllRows(`${PO_ITEM_SHEET}!A2:H`)
  const items = rows
    .filter(r => r[1] === po_id)
    .map(r => ({
      po_item_id: r[0] || "",
      po_id: r[1] || "",
      material_id: r[2] || "",
      description: r[3] || "",
      qty_ordered: num(r[4]),
      unit: r[5] || "",
      unit_price: num(r[6]),
      subtotal: num(r[7]),
    }))

  const map: Record<string, typeof items[number]> = {}
  for (const it of items) map[it.po_item_id] = it
  return { items, map }
}

// received per po_item_id from all GR_ITEMS (col C=po_item_id, col G=qty_received)
async function getReceivedByPOItemMap() {
  const rows = await getAllRows(`${GR_ITEM_SHEET}!A2:K`)
  const received: Record<string, number> = {}
  for (const r of rows) {
    const po_item_id = r[2]
    if (!po_item_id) continue
    const qty_received = num(r[6])
    received[po_item_id] = (received[po_item_id] || 0) + qty_received
  }
  return received
}

// check unique gr_code
async function isGrCodeExists(gr_code: string) {
  const rows = await getAllRows(`${GR_SHEET}!B2:B`)
  const codes = rows.map(r => normalize(r[0]))
  return codes.includes(normalize(gr_code))
}

// update PO status column H (index 7) based on rowNumber
async function updatePOStatus(po_id: string, newStatus: string) {
  const rows = await getAllRows(`${PO_SHEET}!A2:P`)
  const idx = rows.findIndex(r => r[0] === po_id && !r[15])
  if (idx === -1) return

  const rowNumber = idx + 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${PO_SHEET}!H${rowNumber}`, // status
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[newStatus]] },
  })
}

// ---------- POST /procurement/gr ----------
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, data: null, error: "Invalid JSON body" }, { status: 400 })
    }

    const gr_code = String(body.gr_code || "").trim()
    const po_id = String(body.po_id || "").trim()
    const receive_date = String(body.receive_date || "").trim()
    const delivery_note_no = String(body.delivery_note_no || "").trim()
    const notes = String(body.notes || "").trim()
    const created_by = String(body.created_by || "SYSTEM").trim()

    if (!gr_code) {
      return NextResponse.json({ success: false, data: null, error: "gr_code is required" }, { status: 400 })
    }
    if (!po_id) {
      return NextResponse.json({ success: false, data: null, error: "po_id is required" }, { status: 400 })
    }

    // items
    const incomingItems = Array.isArray(body.items) ? body.items : []
    if (incomingItems.length === 0) {
      return NextResponse.json({ success: false, data: null, error: "items is required (min 1 item)" }, { status: 400 })
    }

    // unique gr_code
    if (await isGrCodeExists(gr_code)) {
      return NextResponse.json({ success: false, data: null, error: "gr_code must be unique" }, { status: 409 })
    }

    // PO validate
    const po = await findPO(po_id)
    if (!po) {
      return NextResponse.json({ success: false, data: null, error: "PO not found" }, { status: 404 })
    }

    const po_status = String(po[7] || "")
    if (po_status !== "CONFIRMED" && po_status !== "DELIVERED") {
      return NextResponse.json(
        { success: false, data: null, error: "PO must be CONFIRMED or DELIVERED to create GR" },
        { status: 400 }
      )
    }

    // PO fields (based on your PO header mapping)
    const vendor_id = String(po[2] || "")
    const project_id = String(po[3] || "")

    // Load PO items + received map (1x fetch each)
    const { items: poItems, map: poItemMap } = await getPOItemsMap(po_id)
    if (poItems.length === 0) {
      return NextResponse.json({ success: false, data: null, error: "PO has no items" }, { status: 400 })
    }

    const receivedMap = await getReceivedByPOItemMap()

    // Validate incoming items:
    // - must have po_item_id
    // - qty_received > 0
    // - no duplicate po_item_id in payload
    const seen = new Set<string>()
    const prepared: {
      po_item_id: string
      material_id: string
      description: string
      qty_ordered: number
      qty_received: number
      unit: string
      unit_price: number
      subtotal: number
    }[] = []

    for (const it of incomingItems) {
      const po_item_id = String(it?.po_item_id || "").trim()
      if (!po_item_id) {
        return NextResponse.json({ success: false, data: null, error: "Each item requires po_item_id" }, { status: 400 })
      }
      if (seen.has(po_item_id)) {
        return NextResponse.json({ success: false, data: null, error: `Duplicate po_item_id in payload: ${po_item_id}` }, { status: 400 })
      }
      seen.add(po_item_id)

      const poIt = poItemMap[po_item_id]
      if (!poIt) {
        return NextResponse.json({ success: false, data: null, error: `PO item not found: ${po_item_id}` }, { status: 404 })
      }

      const qty_received = num(it?.qty_received)
      if (qty_received <= 0) {
        return NextResponse.json({ success: false, data: null, error: "qty_received must be > 0" }, { status: 400 })
      }

      const alreadyReceived = num(receivedMap[po_item_id] || 0)
      const qty_ordered = num(poIt.qty_ordered)

      if (alreadyReceived + qty_received > qty_ordered) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: `Received exceeds ordered for ${po_item_id} (ordered=${qty_ordered}, already=${alreadyReceived}, incoming=${qty_received})`,
          },
          { status: 400 }
        )
      }

      const unit_price = num(poIt.unit_price)
      const subtotal = qty_received * unit_price

      prepared.push({
        po_item_id,
        material_id: poIt.material_id,
        description: poIt.description,
        qty_ordered,
        qty_received,
        unit: poIt.unit,
        unit_price,
        subtotal,
      })
    }

    // Totals
    const total_received_qty = prepared.reduce((s, x) => s + x.qty_received, 0)
    const total_amount = prepared.reduce((s, x) => s + x.subtotal, 0)

    // Determine GR status based on whether PO becomes fully delivered after this GR
    // We compute fulfillment after adding these prepared items to receivedMap
    const afterReceivedMap = { ...receivedMap }
    for (const p of prepared) {
      afterReceivedMap[p.po_item_id] = num(afterReceivedMap[p.po_item_id] || 0) + p.qty_received
    }

    let allFulfilled = true
    for (const poIt of poItems) {
      const ordered = num(poIt.qty_ordered)
      const rec = num(afterReceivedMap[poIt.po_item_id] || 0)
      if (rec < ordered) {
        allFulfilled = false
        break
      }
    }

    const gr_status = allFulfilled ? "RECEIVED" : "PARTIAL"

    // Insert GR header (A:Q)
    const gr_id = "GR-" + nanoid(8).toUpperCase()
    const now = nowISO()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${GR_SHEET}!A:Q`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          gr_id,                       // A gr_id
          gr_code,                     // B gr_code
          po_id,                       // C po_id
          vendor_id,                   // D vendor_id
          project_id,                  // E project_id
          receive_date || now,         // F receive_date
          delivery_note_no || "",      // G delivery_note_no
          gr_status,                   // H status
          notes || "",                 // I notes
          total_received_qty,          // J total_received_qty
          total_amount,                // K total_amount
          created_by,                  // L created_by
          created_by,                  // M updated_by
          "",                          // N deleted_by
          now,                         // O created_at
          now,                         // P updated_at
          "",                          // Q deleted_at
        ]]
      }
    })

    // Insert GR items (A:K) FULL sesuai header lu
    // gr_item_id	gr_id	po_item_id	material_id	description	qty_ordered	qty_received	unit	unit_price	subtotal	created_at
    const itemRows = prepared.map(p => ([
      "GRI-" + nanoid(8).toUpperCase(),
      gr_id,
      p.po_item_id,
      p.material_id,
      p.description,
      p.qty_ordered,
      p.qty_received,
      p.unit,
      p.unit_price,
      p.subtotal,
      now,
    ]))

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${GR_ITEM_SHEET}!A:K`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: itemRows }
    })

    // If all fulfilled -> update PO status to DELIVERED
    if (allFulfilled && po_status !== "DELIVERED") {
      await updatePOStatus(po_id, "DELIVERED")
    }

    return NextResponse.json({
      success: true,
      data: {
        gr_id,
        gr_code,
        po_id,
        vendor_id,
        project_id,
        receive_date: receive_date || now,
        delivery_note_no,
        status: gr_status,
        notes,
        total_received_qty,
        total_amount,
        created_at: now,
        updated_at: now,
        items: prepared,
        po_status_after: allFulfilled ? "DELIVERED" : po_status,
      },
      error: null,
    }, { status: 201 })

  } catch (error: any) {
    console.error("GR CREATE ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to create GR",
      details: String(error?.message || error),
    }, { status: 500 })
  }
}
