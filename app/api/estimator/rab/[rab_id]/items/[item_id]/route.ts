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
const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

const RAB_PROJECT = "RAB_PROJECT"
const RAB_ITEM = "RAB_ITEM"

function n(x: any) {
  const v = Number(x)
  return Number.isFinite(v) ? v : 0
}

async function recalcHeader(rab_id: string) {
  const itemRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!A2:P`,
  })
  const rows = itemRes.data.values || []
  const items = rows.filter((r) => r[1] === rab_id)
  const total_items = items.length
  const total_value = items.reduce((s, r) => s + n(r[11]), 0)

  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_PROJECT}!A2:K`,
  })
  const headerRows = headerRes.data.values || []
  const idx = headerRows.findIndex((r) => r[0] === rab_id)
  if (idx === -1) return { total_items, total_value }
  const row = idx + 2

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${RAB_PROJECT}!F${row}:G${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[total_items, total_value]] },
  })

  return { total_items, total_value }
}

// ===================== GET SINGLE ITEM =====================
export async function GET(
  req: Request,
  { params }: { params: { rab_id: string; item_id: string } }
) {
  try {
    const { rab_id, item_id } = params

    const itemRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A2:P`,
    })
    const rows = itemRes.data.values || []
    const row = rows.find((r) => r[0] === item_id && r[1] === rab_id)

    if (!row) {
      return NextResponse.json(
        { message: "Item tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      item_id: row[0] || "",
      rab_id: row[1] || "",
      project_id: row[2] || "",
      scope: row[3] || "",
      item_name: row[4] || "",
      category: row[5] || "",
      qty: n(row[6]),
      unit: row[7] || "",
      material_price: n(row[8]),
      labour_price: n(row[9]),
      unit_price: n(row[10]),
      total_price: n(row[11]),
      status: row[12] || "Draft",
      created_by: row[13] || "",
      created_at: row[14] || "",
      updated_at: row[15] || "",
    })

  } catch (e) {
    console.error("GET ITEM ERROR:", e)
    return NextResponse.json(
      { message: "Gagal fetch item" },
      { status: 500 }
    )
  }
}

// ===================== UPDATE ITEM =====================
export async function PATCH(
  req: Request,
  { params }: { params: { rab_id: string; item_id: string } }
) {
  try {
    const { rab_id, item_id } = params
    const patch = await req.json()

    // Cari baris item
    const itemRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A2:P`,
    })
    const rows = itemRes.data.values || []
    const idx = rows.findIndex((r) => r[0] === item_id && r[1] === rab_id)

    if (idx === -1) {
      return NextResponse.json(
        { message: "Item tidak ditemukan" },
        { status: 404 }
      )
    }

    const rowNumber = idx + 2
    const row = rows[idx]

    // Hitung ulang prices
    let qty = patch.qty !== undefined ? n(patch.qty) : n(row[6])
    let material_price = patch.material_price !== undefined ? n(patch.material_price) : n(row[8])
    let labour_price = patch.labour_price !== undefined ? n(patch.labour_price) : n(row[9])

    if (qty < 0 || material_price < 0 || labour_price < 0) {
      return NextResponse.json(
        { message: "angka tidak boleh negatif" },
        { status: 400 }
      )
    }

    const unit_price = material_price + labour_price
    const total_price = qty * unit_price
    const updated_at = new Date().toISOString()

    // Prepare update values
    const updates = [
      patch.scope ?? row[3],
      patch.item_name ?? row[4],
      patch.category ?? row[5],
      qty,
      patch.unit ?? row[7],
      material_price,
      labour_price,
      unit_price,
      total_price,
      row[12] || "Draft",  // status
      row[13] || "",        // created_by
      row[14] || "",        // created_at
      updated_at,
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!D${rowNumber}:P${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updates]
      }
    })

    const summary = await recalcHeader(rab_id)

    return NextResponse.json({
      message: "Item updated",
      summary
    })

  } catch (e) {
    console.error("UPDATE ITEM ERROR:", e)
    return NextResponse.json(
      { message: "Gagal update item" },
      { status: 500 }
    )
  }
}

// ===================== DELETE ITEM =====================
export async function DELETE(
  req: Request,
  { params }: { params: { rab_id: string; item_id: string } }
) {
  try {
    const { rab_id, item_id } = params

    // Cari sheet ID untuk delete row
    const sheetMeta = await sheets.spreadsheets.get({ 
      spreadsheetId: SHEET_ID 
    })
    
    const itemSheet = sheetMeta.data.sheets?.find(
      s => s.properties?.title === RAB_ITEM
    )
    
    if (!itemSheet?.properties?.sheetId) {
      return NextResponse.json(
        { message: "Sheet tidak ditemukan" },
        { status: 404 }
      )
    }

    // Cari baris item
    const itemRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A2:A`,
    })
    const rows = itemRes.data.values || []
    const idx = rows.findIndex((r) => r[0] === item_id)

    if (idx === -1) {
      return NextResponse.json(
        { message: "Item tidak ditemukan" },
        { status: 404 }
      )
    }

    // Delete row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: itemSheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: idx + 1,
              endIndex: idx + 2,
            }
          }
        }]
      }
    })

    const summary = await recalcHeader(rab_id)

    return NextResponse.json({
      message: "Item deleted",
      summary
    })

  } catch (e) {
    console.error("DELETE ITEM ERROR:", e)
    return NextResponse.json(
      { message: "Gagal hapus item" },
      { status: 500 }
    )
  }
}
