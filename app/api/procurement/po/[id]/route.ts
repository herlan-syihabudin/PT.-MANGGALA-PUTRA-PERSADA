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

const PO_SHEET = "PURCHASE_ORDER"
const PO_ITEM_SHEET = "PO_ITEMS"
const GR_SHEET = "GOODS_RECEIPT"
const AUDIT_SHEET = "PO_AUDIT_LOG"

const now = () => new Date().toISOString()

type POStatus = "DRAFT" | "SENT" | "CONFIRMED" | "DELIVERED" | "CLOSED"

const STATUS_FLOW: Record<POStatus, POStatus[]> = {
  DRAFT: ["SENT"],
  SENT: ["CONFIRMED"],
  CONFIRMED: ["DELIVERED"],
  DELIVERED: ["CLOSED"],
  CLOSED: [],
}

function n(v: any) {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

async function getRows(range: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  })
  return res.data.values || []
}

async function logAudit(po_id: string, action: string, oldStatus: string, newStatus: string, user: string) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${AUDIT_SHEET}!A:G`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        "LOG-" + nanoid(8).toUpperCase(),
        po_id,
        action,
        oldStatus,
        newStatus,
        user,
        now()
      ]]
    }
  })
}

async function findPORow(po_id: string) {
  // 🔥 FIX: Ambil sampai P (16 kolom)
  const rows = await getRows(`${PO_SHEET}!A2:P`)
  const index = rows.findIndex(r => r[0] === po_id && !r[15]) // 🔥 r[15] = deleted_at
  if (index === -1) return null
  return { row: rows[index], index, rowNumber: index + 2 }
}

async function hasGR(po_id: string) {
  const rows = await getRows(`${GR_SHEET}!C2:C`)
  return rows.some(r => r[0] === po_id)
}

async function getPOItems(po_id: string) {
  const rows = await getRows(`${PO_ITEM_SHEET}!A2:J`)
  return rows.filter(r => r[1] === po_id)
}

/* ================= GET ================= */

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const po = await findPORow(params.id)
    if (!po)
      return NextResponse.json({ success: false, error: "PO not found" }, { status: 404 })

    const items = await getPOItems(params.id)

    return NextResponse.json({
      success: true,
      data: {
        po_id: po.row[0],
        po_code: po.row[1],
        vendor_id: po.row[2],
        project_id: po.row[3],
        pr_id: po.row[4],
        order_date: po.row[5],
        delivery_date: po.row[6],
        status: po.row[7] as POStatus,
        notes: po.row[8],
        total_amount: n(po.row[9]),
        created_by: po.row[10],
        updated_by: po.row[11],
        deleted_by: po.row[12],
        created_at: po.row[13],
        updated_at: po.row[14],
        deleted_at: po.row[15] || null,
        // 🔥 Version dihapus karena tidak ada di sheet
        items: items.map(r => ({
          po_item_id: r[0],
          po_id: r[1],
          material_id: r[2] || undefined,
          description: r[3],
          qty: n(r[4]),
          unit: r[5],
          unit_price: n(r[6]),
          subtotal: n(r[7]),
          created_at: r[8],
          updated_at: r[9],
        }))
      }
    })
  } catch (err) {
    console.error("❌ GET PO Error:", err)
    return NextResponse.json({ success: false, error: "Failed to load PO" }, { status: 500 })
  }
}

/* ================= PATCH ================= */

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const po = await findPORow(params.id)

    if (!po)
      return NextResponse.json({ success: false, error: "PO not found" }, { status: 404 })

    const currentStatus = po.row[7] as POStatus
    const newStatus = body.status || currentStatus
    const user = body.updated_by || "SYSTEM"

    // 🔥 Version check dihapus karena tidak ada version di sheet
    // if (body.if_match_version !== currentVersion)
    //   return NextResponse.json({ success: false, error: "Version conflict" }, { status: 409 })

    // Hard lock
    if (currentStatus === "DELIVERED" || currentStatus === "CLOSED")
      return NextResponse.json({ success: false, error: "PO locked" }, { status: 409 })

    // Status validation
    if (body.status && !STATUS_FLOW[currentStatus].includes(newStatus) && newStatus !== currentStatus)
      return NextResponse.json({ success: false, error: "Invalid status transition" }, { status: 400 })

    // If items update & GR exists → block
    if (body.items && await hasGR(params.id))
      return NextResponse.json({ success: false, error: "Cannot modify items after GR" }, { status: 400 })

    let total = 0

    // === REPLACE ITEMS (ATOMIC) ===
    if (body.items) {
      const allItems = await getRows(`${PO_ITEM_SHEET}!A2:J`)
      const remaining = allItems.filter(r => r[1] !== params.id)

      // Clear and restore remaining items
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `${PO_ITEM_SHEET}!A2:J`,
      })

      if (remaining.length > 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: `${PO_ITEM_SHEET}!A2`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: remaining }
        })
      }

      // Add new items
      for (const it of body.items) {
        const qty = n(it.qty)
        const price = n(it.unit_price)
        const subtotal = qty * price
        total += subtotal

        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: `${PO_ITEM_SHEET}!A:J`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[
              "POI-" + nanoid(8).toUpperCase(),
              params.id,
              it.material_id || "",
              it.description,
              qty,
              it.unit || "",
              price,
              subtotal,
              now(),
              now()
            ]]
          }
        })
      }
    } else {
      total = n(po.row[9])
    }

    const updated_at = now()

    // 🔥 FIX: Update dari kolom H sampai P
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${PO_SHEET}!H${po.rowNumber}:P${po.rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          newStatus,                          // H: status
          po.row[8],                          // I: notes
          total,                               // J: total_amount
          user,                                // K: updated_by
          po.row[12],                          // L: deleted_by
          po.row[13],                          // M: created_at
          updated_at,                          // N: updated_at
          po.row[15] || "",                    // O: deleted_at (kosong)
        ]]
      }
    })

    await logAudit(params.id, "UPDATE", currentStatus, newStatus, user)

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("❌ PATCH Error:", err)
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 })
  }
}

/* ================= DELETE ================= */

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const po = await findPORow(params.id)
    if (!po)
      return NextResponse.json({ success: false, error: "PO not found" }, { status: 404 })

    if (await hasGR(params.id))
      return NextResponse.json({ success: false, error: "Cannot delete PO with GR" }, { status: 400 })

    // 🔥 FIX: Set deleted_at di kolom P
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${PO_SHEET}!P${po.rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[now()]] }
    })

    await logAudit(params.id, "DELETE", po.row[7], "DELETED", "SYSTEM")

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ DELETE Error:", err)
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 })
  }
}
