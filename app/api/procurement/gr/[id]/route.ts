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

const GR_SHEET = "GOODS_RECEIPT" // A:Q
const GR_ITEM_SHEET = "GR_ITEMS" // A:K
const PO_ITEM_SHEET = "PO_ITEMS" // for fallback qty_ordered & unit_price if needed

// ===== Status flow (opsional, biar rapih) =====
const VALID_GR_STATUS: string[] = ["DRAFT", "PARTIAL", "RECEIVED", "CLOSED"]
const VALID_GR_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PARTIAL", "RECEIVED", "CLOSED"],
  PARTIAL: ["RECEIVED", "CLOSED"],
  RECEIVED: ["CLOSED"],
  CLOSED: [],
}

function canTransition(oldStatus: string, nextStatus: string) {
  if (oldStatus === nextStatus) return true
  const allowed = VALID_GR_STATUS_TRANSITIONS[oldStatus] || []
  return allowed.includes(nextStatus)
}

// ===== Helpers =====
function num(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// Find GR row by gr_id (soft delete aware)
async function findGRRow(gr_id: string): Promise<{ row: string[]; rowNumber: number } | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${GR_SHEET}!A2:Q`,
  })

  const rows = res.data.values || []
  const idx = rows.findIndex(r => r[0] === gr_id && !r[16]) // Q = deleted_at (index 16)

  if (idx === -1) return null
  return { row: rows[idx], rowNumber: idx + 2 }
}

// Get GR items (A:K)
async function getGRItems(gr_id: string): Promise<any[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${GR_ITEM_SHEET}!A2:K`,
  })

  const rows = res.data.values || []
  return rows
    .filter(r => r[1] === gr_id)
    .map(r => ({
      gr_item_id: r[0] || "",
      gr_id: r[1] || "",
      po_item_id: r[2] || "",
      material_id: r[3] || "",
      description: r[4] || "",
      qty_ordered: num(r[5]),
      qty_received: num(r[6]),
      unit: r[7] || "",
      unit_price: num(r[8]),
      subtotal: num(r[9]),
      created_at: r[10] || "",
    }))
}

// Recalc totals from items
async function recalcTotals(gr_id: string) {
  const items = await getGRItems(gr_id)
  const total_received_qty = items.reduce((s, it) => s + num(it.qty_received), 0)
  const total_amount = items.reduce((s, it) => s + num(it.subtotal), 0)
  return { total_received_qty, total_amount, items }
}

// Optional: if some fields missing in GR_ITEMS, we can lookup PO_ITEMS
async function getPOItemMap(): Promise<Record<string, { qty: number; unit_price: number; unit: string; description: string; material_id: string }>> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PO_ITEM_SHEET}!A2:H`,
  })
  const rows = res.data.values || []
  const map: Record<string, any> = {}
  for (const r of rows) {
    const po_item_id = r[0]
    if (!po_item_id) continue
    map[po_item_id] = {
      // Based on your PO_ITEMS mapping earlier:
      // [0]=po_item_id, [1]=po_id, [2]=material_id, [3]=description, [4]=qty, [5]=unit, [6]=unit_price, [7]=subtotal
      material_id: r[2] || "",
      description: r[3] || "",
      qty: num(r[4]),
      unit: r[5] || "",
      unit_price: num(r[6]),
    }
  }
  return map
}

// ==================== GET SINGLE GR ====================
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const gr_id = params.id
    const gr = await findGRRow(gr_id)

    if (!gr) {
      return NextResponse.json({ success: false, data: null, error: "GR not found" }, { status: 404 })
    }

    const r = gr.row
    const { total_received_qty, total_amount, items } = await recalcTotals(gr_id)

    // Return full fields sesuai header GR sheet
    const data = {
      gr_id: r[0] || "",
      gr_code: r[1] || "",
      po_id: r[2] || "",
      vendor_id: r[3] || "",
      project_id: r[4] || "",
      receive_date: r[5] || "",
      delivery_note_no: r[6] || "",
      status: r[7] || "DRAFT",
      notes: r[8] || "",
      total_received_qty: num(r[9]) || total_received_qty,
      total_amount: num(r[10]) || total_amount,
      created_by: r[11] || "",
      updated_by: r[12] || "",
      deleted_by: r[13] || "",
      created_at: r[14] || "",
      updated_at: r[15] || "",
      deleted_at: r[16] || null,
      items,
    }

    return NextResponse.json({ success: true, data, error: null })
  } catch (error) {
    console.error("GET GR ERROR:", error)
    return NextResponse.json({ success: false, data: null, error: "Failed to fetch GR" }, { status: 500 })
  }
}

// ==================== UPDATE GR (HEADER + RECALC TOTALS) ====================
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const gr_id = params.id
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, data: null, error: "Invalid JSON body" }, { status: 400 })
    }

    const gr = await findGRRow(gr_id)
    if (!gr) {
      return NextResponse.json({ success: false, data: null, error: "GR not found" }, { status: 404 })
    }

    const r = gr.row
    const rowNumber = gr.rowNumber
    const now = new Date().toISOString()

    // status validation
    const oldStatus = String(r[7] || "DRAFT")
    const nextStatus = body.status ? String(body.status) : oldStatus

    if (body.status) {
      if (!VALID_GR_STATUS.includes(nextStatus)) {
        return NextResponse.json({ success: false, data: null, error: "Invalid GR status" }, { status: 400 })
      }
      if (!canTransition(oldStatus, nextStatus)) {
        return NextResponse.json(
          { success: false, data: null, error: `Invalid status transition from ${oldStatus} to ${nextStatus}` },
          { status: 400 }
        )
      }
    }

    // Recalc totals based on items (source of truth)
    const { total_received_qty, total_amount, items } = await recalcTotals(gr_id)

    // Only allow update these header fields:
    // B gr_code, F receive_date, G delivery_note_no, H status, I notes, M updated_by, P updated_at
    const new_gr_code = body.gr_code ?? r[1]
    const new_receive_date = body.receive_date ?? r[5]
    const new_delivery_note_no = body.delivery_note_no ?? r[6]
    const new_notes = body.notes ?? r[8]
    const new_updated_by = body.updated_by ?? body.updatedBy ?? r[12] ?? "SYSTEM"

    // Prepare full row update for B:Q (keep locked fields intact)
    const updatedRow = [
      new_gr_code,              // B
      r[2],                     // C po_id (LOCK)
      r[3],                     // D vendor_id (LOCK)
      r[4],                     // E project_id (LOCK)
      new_receive_date,         // F
      new_delivery_note_no,     // G
      nextStatus,               // H
      new_notes,                // I
      total_received_qty,       // J
      total_amount,             // K
      r[11] || "SYSTEM",        // L created_by (LOCK)
      new_updated_by,           // M
      r[13] || "",              // N deleted_by
      r[14] || "",              // O created_at (LOCK)
      now,                      // P updated_at
      r[16] || "",              // Q deleted_at
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${GR_SHEET}!B${rowNumber}:Q${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] },
    })

    // Return updated payload
    return NextResponse.json({
      success: true,
      data: {
        gr_id,
        gr_code: new_gr_code,
        po_id: r[2],
        vendor_id: r[3],
        project_id: r[4],
        receive_date: new_receive_date,
        delivery_note_no: new_delivery_note_no,
        status: nextStatus,
        notes: new_notes,
        total_received_qty,
        total_amount,
        created_by: r[11] || "SYSTEM",
        updated_by: new_updated_by,
        created_at: r[14] || "",
        updated_at: now,
        items,
      },
      error: null,
    })
  } catch (error) {
    console.error("UPDATE GR ERROR:", error)
    return NextResponse.json({ success: false, data: null, error: "Failed to update GR" }, { status: 500 })
  }
}

// ==================== SOFT DELETE GR ====================
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const gr_id = params.id
    const gr = await findGRRow(gr_id)

    if (!gr) {
      return NextResponse.json({ success: false, data: null, error: "GR not found" }, { status: 404 })
    }

    const r = gr.row
    const rowNumber = gr.rowNumber
    const now = new Date().toISOString()

    // Soft delete: set deleted_at (Q) and deleted_by (N), updated_at (P)
    const deleted_by = "SYSTEM"

    // Update N, P, Q only (columns N=14? Actually in B:Q update we can just update whole B:Q safely)
    const updatedRow = [
      r[1] || "",               // B gr_code
      r[2] || "",               // C po_id
      r[3] || "",               // D vendor_id
      r[4] || "",               // E project_id
      r[5] || "",               // F receive_date
      r[6] || "",               // G delivery_note_no
      r[7] || "DRAFT",          // H status
      r[8] || "",               // I notes
      r[9] || 0,                // J total_received_qty
      r[10] || 0,               // K total_amount
      r[11] || "SYSTEM",        // L created_by
      r[12] || "SYSTEM",        // M updated_by
      deleted_by,               // N deleted_by
      r[14] || "",              // O created_at
      now,                      // P updated_at
      now,                      // Q deleted_at
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${GR_SHEET}!B${rowNumber}:Q${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [updatedRow] },
    })

    return NextResponse.json({
      success: true,
      data: { deleted: true, gr_id },
      error: null,
    })
  } catch (error) {
    console.error("DELETE GR ERROR:", error)
    return NextResponse.json({ success: false, data: null, error: "Failed to delete GR" }, { status: 500 })
  }
}
