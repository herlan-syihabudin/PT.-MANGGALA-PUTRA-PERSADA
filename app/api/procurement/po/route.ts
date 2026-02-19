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
const PR_SHEET = "PURCHASE_REQUEST"
const VENDOR_SHEET = "VENDORS"
const PROJECT_SHEET = "PROJECTS"
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

async function validateExist(sheet: string, id: string) {
  const rows = await getRows(`${sheet}!A2:A`)
  return rows.map(r => r[0]).includes(id)
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

/* ================= GET ================= */

export async function GET() {
  try {
    // 🔥 FIX: Ambil sampai P (16 kolom) bukan Q
    const rows = await getRows(`'${PO_SHEET}'!A2:P`)

    const data = rows
      .filter(r => !r[12]) // deleted_by kosong
      .map(r => ({
        po_id: r[0],
        po_code: r[1],
        vendor_id: r[2],
        project_id: r[3],
        pr_id: r[4],
        order_date: r[5],
        delivery_date: r[6],
        status: r[7],
        notes: r[8],
        total_amount: n(r[9]),
        created_by: r[10],
        updated_by: r[11],
        deleted_by: r[12],
        created_at: r[13],
        updated_at: r[14],
        deleted_at: r[15] || null, // 🔥 deleted_at di kolom P
      }))

    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Failed to load POs" }, { status: 500 })
  }
}

/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.po_code || !body.vendor_id || !body.project_id)
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })

    if (!(await validateExist(VENDOR_SHEET, body.vendor_id)))
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 400 })

    if (!(await validateExist(PROJECT_SHEET, body.project_id)))
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 400 })

    const existing = await getRows(`${PO_SHEET}!B2:B`)
    const dup = existing.some(r => String(r[0]).toLowerCase() === body.po_code.toLowerCase())
    if (dup)
      return NextResponse.json({ success: false, error: "po_code already exists" }, { status: 409 })

    const po_id = "PO-" + nanoid(8).toUpperCase()
    const created_at = now()

    let total = 0
    const items = body.items || []

    if (!items.length)
      return NextResponse.json({ success: false, error: "Items required" }, { status: 400 })

    for (const it of items) {
      const qty = n(it.qty)
      const price = n(it.unit_price)

      if (!it.description || qty <= 0 || price < 0)
        return NextResponse.json({ success: false, error: "Invalid item data" }, { status: 400 })

      total += qty * price
    }

    // 🔥 FIX: Append hanya sampai P (16 kolom)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `'${PO_SHEET}'!A:P`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          po_id,
          body.po_code,
          body.vendor_id,
          body.project_id,
          body.pr_id || "",
          body.order_date || created_at,
          body.delivery_date || "",
          "DRAFT",
          body.notes || "",
          total,
          body.created_by || "SYSTEM",
          body.created_by || "SYSTEM",
          "",             // deleted_by
          created_at,
          created_at,
          "",             // deleted_at
        ]]
      }
    })

    for (const it of items) {
      const qty = n(it.qty)
      const price = n(it.unit_price)
      const subtotal = qty * price

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${PO_ITEM_SHEET}!A:J`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            "POI-" + nanoid(8).toUpperCase(),
            po_id,
            it.material_id || "",
            it.description,
            qty,
            it.unit || "",
            price,
            subtotal,
            created_at,
            created_at
          ]]
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: { po_id }
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

/* ================= PATCH ================= */

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { po_id, status, items, updated_by } = body

    const rows = await getRows(`'${PO_SHEET}'!A2:P`) // 🔥 FIX: sampai P
    const index = rows.findIndex(r => r[0] === po_id && !r[12])
    if (index === -1)
      return NextResponse.json({ success: false, error: "PO not found" }, { status: 404 })

    const row = rows[index]
    const currentStatus = row[7] as POStatus

    if (currentStatus === "DELIVERED" || currentStatus === "CLOSED")
      return NextResponse.json({ success: false, error: "PO locked" }, { status: 409 })

    if (status && !STATUS_FLOW[currentStatus].includes(status))
      return NextResponse.json({ success: false, error: "Invalid status transition" }, { status: 400 })

    let total = n(row[9])

    if (items && items.length) {
      total = 0

      const itemRows = await getRows(`${PO_ITEM_SHEET}!A2:J`)
      const filtered = itemRows.filter(r => r[1] !== po_id)

      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `${PO_ITEM_SHEET}!A2:J`,
      })

      if (filtered.length) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: `${PO_ITEM_SHEET}!A2`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: filtered }
        })
      }

      for (const it of items) {
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
              po_id,
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
    }

    const updated_at = now()

    // 🔥 FIX: Update hanya sampai O (15 kolom)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${PO_SHEET}!H${index + 2}:O${index + 2}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          status || currentStatus,
          row[8],
          total,
          updated_by || "SYSTEM",
          row[12],
          row[13],
          updated_at,
          row[15] || "", // deleted_at
        ]]
      }
    })

    await logAudit(po_id, "UPDATE", currentStatus, status || currentStatus, updated_by || "SYSTEM")

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 })
  }
}

/* ================= DELETE ================= */

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const po_id = searchParams.get("po_id")
  const deleted_by = searchParams.get("deleted_by") || "SYSTEM"

  const rows = await getRows(`'${PO_SHEET}'!A2:P`) // 🔥 FIX: sampai P
  const index = rows.findIndex(r => r[0] === po_id && !r[12])
  if (index === -1)
    return NextResponse.json({ success: false, error: "PO not found" }, { status: 404 })

  // 🔥 FIX: Update kolom M (deleted_by) dan P (deleted_at)
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${PO_SHEET}!M${index + 2}:P${index + 2}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        deleted_by,
        rows[index][13],
        rows[index][14],
        now(), // deleted_at
      ]]
    }
  })

  await logAudit(po_id, "DELETE", rows[index][7], "DELETED", deleted_by)

  return NextResponse.json({ success: true })
}
