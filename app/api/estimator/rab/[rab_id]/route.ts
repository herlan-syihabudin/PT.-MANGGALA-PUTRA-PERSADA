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

type Context = {
  params: {
    rab_id: string
  }
}

// ===================== GET DETAIL RAB =====================
export async function GET(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id

    // ===== HEADER =====
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:K`,
    })
    const headerRows = headerRes.data.values || []
    const headerRow = headerRows.find((r) => r[0] === rab_id) || null

    if (!headerRow) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
        { status: 404 }
      )
    }

    const project_id = headerRow[2] || ""

    // ===== ITEMS =====
    const itemRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A2:P`,
    })
    const rows = itemRes.data.values || []

    const items = rows
      .filter((r) => r[1] === rab_id)
      .map((r) => ({
        item_id: r[0] || "",
        rab_id: r[1] || "",
        project_id: r[2] || "",
        scope: r[3] || "",
        item_name: r[4] || "",
        category: r[5] || "",
        qty: n(r[6]),
        unit: r[7] || "",
        material_price: n(r[8]),
        labour_price: n(r[9]),
        unit_price: n(r[10]),
        total_price: n(r[11]),
        status: r[12] || "Draft",
        created_by: r[13] || "",
        created_at: r[14] || "",
        updated_at: r[15] || "",
      }))
      .sort((a, b) => a.created_at.localeCompare(b.created_at))

    const total_value = items.reduce((s, i) => s + n(i.total_price), 0)

    return NextResponse.json({
      rab_id,
      inquiry_id: headerRow[1],
      project_id,
      project_name: headerRow[3],
      customer_name: headerRow[4],
      total_items: items.length,
      total_value,
      status: headerRow[7] || "Draft",
      created_by: headerRow[8] || "",
      created_at: headerRow[9] || "",
      items,
    })

  } catch (e) {
    console.error("GET RAB DETAIL ERROR:", e)
    return NextResponse.json(
      { message: "Gagal fetch RAB" },
      { status: 500 }
    )
  }
}

// ===================== UPDATE RAB HEADER =====================
export async function PATCH(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id
    const body = await req.json()

    // Cari baris header
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:K`,
    })
    const headerRows = headerRes.data.values || []
    const idx = headerRows.findIndex((r) => r[0] === rab_id)

    if (idx === -1) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
        { status: 404 }
      )
    }

    const rowNumber = idx + 2
    const currentRow = headerRows[idx]

    // Mapping kolom yang bisa di-update
    const updates: Record<string, any> = {}
    if (body.project_name !== undefined) updates[3] = body.project_name
    if (body.customer_name !== undefined) updates[4] = body.customer_name
    if (body.status !== undefined) updates[7] = body.status

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data yang diupdate" },
        { status: 400 }
      )
    }

    // Update per kolom
    for (const [colIndex, value] of Object.entries(updates)) {
      const col = String.fromCharCode(65 + Number(colIndex)) // 0=A, 1=B, etc
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!${col}${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[value]]
        }
      })
    }

    return NextResponse.json({
      message: "RAB header updated",
      updates
    })

  } catch (e) {
    console.error("PATCH RAB ERROR:", e)
    return NextResponse.json(
      { message: "Gagal update RAB" },
      { status: 500 }
    )
  }
}

// ===================== DELETE RAB =====================
export async function DELETE(
  req: Request,
  { params }: { params: { rab_id: string } }
) {
  try {
    const rab_id = params.rab_id

    // Cari sheet ID untuk delete row
    const sheetMeta = await sheets.spreadsheets.get({ 
      spreadsheetId: SHEET_ID 
    })
    
    const projectSheet = sheetMeta.data.sheets?.find(
      s => s.properties?.title === RAB_PROJECT
    )
    
    if (!projectSheet?.properties?.sheetId) {
      return NextResponse.json(
        { message: "Sheet tidak ditemukan" },
        { status: 404 }
      )
    }

    // Cari baris header
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:A`,
    })
    
    const rows = headerRes.data.values || []
    const idx = rows.findIndex((r) => r[0] === rab_id)

    if (idx === -1) {
      return NextResponse.json(
        { message: "RAB tidak ditemukan" },
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
              sheetId: projectSheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: idx + 1, // +1 karena header
              endIndex: idx + 2,
            }
          }
        }]
      }
    })

    // TODO: Juga hapus semua items terkait

    return NextResponse.json({
      message: "RAB deleted successfully"
    })

  } catch (e) {
    console.error("DELETE RAB ERROR:", e)
    return NextResponse.json(
      { message: "Gagal delete RAB" },
      { status: 500 }
    )
  }
}
