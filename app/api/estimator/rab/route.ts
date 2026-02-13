import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= AUTH ================= */

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!
const RAB_ITEM = "RAB_ITEM"
const RAB_PROJECT = "RAB_PROJECT"

/* ===================================================== */
/* ================= HELPER FUNCTION =================== */
/* ===================================================== */

async function recalcRabProject(project_id: string) {
  const itemRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!A2:N`,
  })

  const itemRows = itemRes.data.values || []

  const items = itemRows.filter(
    (r) =>
      r[0] &&
      r[1] === project_id &&
      r[11] !== "Deleted"
  )

  const total_item = items.length
  const total_nilai_rab = items.reduce(
    (sum, r) => sum + Number(r[10] || 0),
    0
  )

  const rabRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_PROJECT}!A2:H`,
  })

  const rabRows = rabRes.data.values || []

  const idx = rabRows.findIndex(
    (r) => r[1] === project_id
  )

  if (idx === -1) return

  const row = idx + 2

  // 🔥 UPDATE TOTAL DI KOLOM E-F
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${RAB_PROJECT}!E${row}:F${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[total_item, total_nilai_rab]],
    },
  })
}

async function isRabLocked(project_id: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_PROJECT}!A2:H`,
  })

  const rows = res.data.values || []
  const row = rows.find(r => r[1] === project_id)

  if (!row) return false

  const status = (row[6] || "").toLowerCase()
  return status === "locked"
}

/* ===================================================== */
/* ================= GET RAB DETAIL ==================== */
/* ===================================================== */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rab_id = searchParams.get("rab_id")

  if (!rab_id) {
    return NextResponse.json(
      { message: "rab_id wajib" },
      { status: 400 }
    )
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!A2:N`,
  })

  const rows = res.data.values || []

  const items = rows
    .map((r, index) => ({ r, index }))
    .filter(
      ({ r }) =>
        r[0] &&
        r[0] === rab_id &&
        r[11] !== "Deleted"
    )
    .map(({ r, index }) => ({
      row: index + 2,
      rab_id: r[0],
      project_id: r[1],
      scope: r[2],
      item_name: r[3],
      category: r[4],
      volume: Number(r[5] || 0),
      unit: r[6],
      material_price: Number(r[7] || 0),
      labour_price: Number(r[8] || 0),
      unit_price: Number(r[9] || 0),
      total_price: Number(r[10] || 0),
      status: r[11],
      created_by: r[12],
      created_at: r[13],
    }))

  return NextResponse.json({
    rab_id,
    summary: {
      total_items: items.length,
      total_value: items.reduce(
        (s, i) => s + i.total_price,
        0
      ),
    },
    items,
  })
}

/* ===================================================== */
/* ================= ADD ITEM ========================== */
/* ===================================================== */

export async function POST(req: Request) {
  const body = await req.json()

  const {
    rab_id,
    project_id,
    scope,
    item_name,
    category,
    volume,
    unit,
    material_price,
    labour_price,
    created_by,
  } = body

  if (!rab_id || !project_id) {
    return NextResponse.json(
      { message: "rab_id & project_id wajib" },
      { status: 400 }
    )
  }

  if (await isRabLocked(project_id)) {
    return NextResponse.json(
      { message: "RAB sudah di-lock dan tidak bisa diubah" },
      { status: 400 }
    )
  }

  const unit_price =
    Number(material_price) + Number(labour_price)

  const total_price =
    Number(volume) * unit_price

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!A:N`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        rab_id,
        project_id,
        scope,
        item_name,
        category,
        Number(volume),
        unit,
        Number(material_price),
        Number(labour_price),
        unit_price,
        total_price,
        "Draft",
        created_by || "Estimator",
        new Date().toISOString(),
      ]],
    },
  })

  await recalcRabProject(project_id)

  return NextResponse.json({
    message: "Item RAB ditambahkan",
  })
}

/* ===================================================== */
/* ================= EDIT ITEM ========================= */
/* ===================================================== */

export async function PUT(req: Request) {
  const body = await req.json()

  const {
    row,
    project_id,
    scope,
    item_name,
    category,
    volume,
    unit,
    material_price,
    labour_price,
  } = body

  if (!row || !project_id) {
    return NextResponse.json(
      { message: "row & project_id wajib" },
      { status: 400 }
    )
  }

  if (await isRabLocked(project_id)) {
    return NextResponse.json(
      { message: "RAB sudah di-lock dan tidak bisa diubah" },
      { status: 400 }
    )
  }

  const unit_price =
    Number(material_price) + Number(labour_price)

  const total_price =
    Number(volume) * unit_price

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!C${row}:K${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        scope,
        item_name,
        category,
        Number(volume),
        unit,
        Number(material_price),
        Number(labour_price),
        unit_price,
        total_price,
      ]],
    },
  })

  await recalcRabProject(project_id)

  return NextResponse.json({
    message: "Item RAB diupdate",
  })
}

/* ===================================================== */
/* ================= SOFT DELETE ======================= */
/* ===================================================== */

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)

  const row = Number(searchParams.get("row"))
  const project_id = searchParams.get("project_id")

  if (!row || !project_id) {
    return NextResponse.json(
      { message: "row & project_id wajib" },
      { status: 400 }
    )
  }

  if (await isRabLocked(project_id)) {
    return NextResponse.json(
      { message: "RAB sudah di-lock dan tidak bisa diubah" },
      { status: 400 }
    )
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${RAB_ITEM}!L${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [["Deleted"]],
    },
  })

  await recalcRabProject(project_id)

  return NextResponse.json({
    message: "Item RAB dihapus (soft delete)",
  })
}
