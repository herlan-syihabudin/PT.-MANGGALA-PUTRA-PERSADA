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
  const rows = await getRows(`${PO_SHEET}!A2:Q`)
  const index = rows.findIndex(r => r[0] === po_id && !r[15])
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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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
      status: po.row[7],
      notes: po.row[8],
      total_amount: n(po.row[9]),
      version: n(po.row[16]),
      items: items.map(r => ({
        po_item_id: r[0],
        description: r[3],
        qty: n(r[4]),
        unit: r[5],
        unit_price: n(r[6]),
        subtotal: n(r[7]),
      }))
    }
  })
}

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
    const currentVersion = n(po.row[16])
    const newStatus = body.status || currentStatus
    const user = body.updated_by || "SYSTEM"

    // optimistic lock
    if (body.if_match_version !== currentVersion)
      return NextResponse.json({ success: false, error: "Version conflict" }, { status: 409 })

    // hard lock
    if (currentStatus === "DELIVERED" || currentStatus === "CLOSED")
      return NextResponse.json({ success: false, error: "PO locked" }, { status: 409 })

    // status validation
    if (!STATUS_FLOW[currentStatus].includes(newStatus) && newStatus !== currentStatus)
      return NextResponse.json({ success: false, error: "Invalid status transition" }, { status: 400 })

    // if items update & GR exists → block
    if (body.items && await hasGR(params.id))
      return NextResponse.json({ success: false, error: "Cannot modify items after GR" }, { status: 400 })

    let total = 0

    // === REPLACE ITEMS (ATOMIC) ===
    if (body.items) {
      const allItems = await getRows(`${PO_ITEM_SHEET}!A2:J`)
      const remaining = allItems.filter(r => r[1] !== params.id)

      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `${PO_ITEM_SHEET}!A2:J`,
      })

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${PO_ITEM_SHEET}!A2`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: remaining }
      })

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

    const newVersion = currentVersion + 1
    const updated_at = now()

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${PO_SHEET}!H${po.rowNumber}:Q${po.rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          newStatus,
          po.row[8],
          total,
          user,
          po.row[12],
          po.row[13],
          updated_at,
          po.row[15],
          newVersion
        ]]
      }
    })

    await logAudit(params.id, "UPDATE", currentStatus, newStatus, user)

    return NextResponse.json({ success: true, version: newVersion })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const po = await findPORow(params.id)
  if (!po)
    return NextResponse.json({ success: false, error: "PO not found" }, { status: 404 })

  if (await hasGR(params.id))
    return NextResponse.json({ success: false, error: "Cannot delete PO with GR" }, { status: 400 })

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${PO_SHEET}!P${po.rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[now()]] }
  })

  await logAudit(params.id, "DELETE", po.row[7], "DELETED", "SYSTEM")

  return NextResponse.json({ success: true })
}
