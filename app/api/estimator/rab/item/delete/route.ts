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
    range: `'${RAB_ITEM}'!A2:P`,
  })
  const rows = itemRes.data.values || []
  const items = rows.filter((r) => r[1] === rab_id)
  const total_items = items.length
  const total_value = items.reduce((s, r) => s + n(r[11]), 0)

  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${RAB_PROJECT}'!A2:K`,
  })
  const headerRows = headerRes.data.values || []
  const idx = headerRows.findIndex((r) => r[0] === rab_id)
  if (idx === -1) return { total_items, total_value }
  const row = idx + 2

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'${RAB_PROJECT}'!F${row}:G${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[total_items, total_value]] },
  })

  return { total_items, total_value }
}

export async function POST(req: Request) {
  try {
    const { rab_id, item_id } = await req.json()
    if (!rab_id) return NextResponse.json({ message: "rab_id wajib" }, { status: 400 })
    if (!item_id) return NextResponse.json({ message: "item_id wajib" }, { status: 400 })

    // find row index
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'${RAB_ITEM}'!A2:P`,
    })
    const rows = res.data.values || []
    const idx = rows.findIndex((r) => r[0] === item_id)
    if (idx === -1) return NextResponse.json({ message: "Item tidak ditemukan" }, { status: 404 })

    // delete row via batchUpdate
    const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
    const sheet = sheetMeta.data.sheets?.find((s) => s.properties?.title === RAB_ITEM)
    const sheetId = sheet?.properties?.sheetId
    if (sheetId === undefined) return NextResponse.json({ message: "Sheet RAB_ITEM tidak ditemukan" }, { status: 404 })

    const rowIndex = idx + 1 // because A2 is rowIndex=1 zero-based
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    })

    const summary = await recalcHeader(rab_id)
    return NextResponse.json({ message: "Item deleted", summary })
  } catch (e) {
    console.error("DELETE ITEM ERROR:", e)
    return NextResponse.json({ message: "Gagal hapus item" }, { status: 500 })
  }
}
