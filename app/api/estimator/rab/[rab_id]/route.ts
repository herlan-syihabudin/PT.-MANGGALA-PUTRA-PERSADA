import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

// ==================== ENVIRONMENT ====================
const requiredEnv = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GSHEET_ESTIMATOR_ID'] as const
for (const env of requiredEnv) {
  if (!process.env[env]) throw new Error(`Missing ${env}`)
}

// ==================== GOOGLE SHEETS ====================
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
const RETRYABLE = [408, 429, 502, 503]

// ==================== CONSTANTS ====================
const RAB_HEADER = {
  ID: 0,
  INQUIRY_ID: 1,
  PROJECT_ID: 2,
  PROJECT_NAME: 3,
  CUSTOMER_NAME: 4,
  TOTAL_ITEMS: 5,
  TOTAL_VALUE: 6,
  STATUS: 7,
  ACTION: 8,
  CREATED_BY: 9,
  CREATED_AT: 10,
} as const

const RAB_ITEM_COLS = {
  ID: 0,
  RAB_ID: 1,
  SCOPE: 2,
  CATEGORY: 3,
  NAME: 4,
  QTY: 5,
  UNIT: 6,
  MATERIAL_PRICE: 7,
  LABOUR_PRICE: 8,
  EQUIPMENT_PRICE: 9,
  UNIT_PRICE: 10,
  TOTAL_PRICE: 11,
  STATUS: 12,
  CREATED_BY: 13,
  CREATED_AT: 14,
  UPDATED_AT: 15,
  NOTES: 16,
} as const

const VALID_STATUSES = ["Draft", "Approved", "Rejected", "Locked", "Deleted"] as const
const STATUS_TRANSITIONS: Record<string, string[]> = {
  Draft: ["Draft", "Approved", "Rejected", "Deleted"],
  Approved: ["Approved", "Locked"],
  Rejected: ["Draft", "Deleted"],
  Locked: ["Locked"],
  Deleted: ["Deleted"],
}

// ==================== HELPERS ====================
const n = (x: any): number => {
  const v = Number(x)
  return Number.isFinite(v) ? v : 0
}

const logger = {
  error: (context: string, error: any, meta = {}) => 
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', context, error: { message: error?.message, code: error?.code }, ...meta })),
  info: (context: string, meta = {}) => 
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', context, ...meta }))
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    const code = Number(error.code || error.response?.status)
    if (retries > 0 && RETRYABLE.includes(code)) {
      await new Promise(r => setTimeout(r, 1000 * (4 - retries)))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

// ==================== GET ====================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ rab_id: string }> }
) {
  let rab_id = ""
  
  try {
    const resolvedParams = await params
    rab_id = resolvedParams.rab_id

    // Get header
    const headerRes = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:K`,
    }))

    const headerRows = headerRes.data.values || []
    const headerIdx = headerRows.findIndex(r => r[RAB_HEADER.ID] === rab_id)
    
    if (headerIdx === -1) {
      return NextResponse.json({ message: "RAB tidak ditemukan" }, { status: 404 })
    }

    const headerRow = headerRows[headerIdx]
    const headerRowNum = headerIdx + 2

    // Get items
    const itemRes = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A2:Q`,
    }))

    const items = (itemRes.data.values || [])
  .filter(r => r[RAB_ITEM_COLS.RAB_ID] === rab_id && r[RAB_ITEM_COLS.STATUS] !== "Deleted")
  .map(r => ({
    item_id: r[RAB_ITEM_COLS.ID] || "",
    rab_id: r[RAB_ITEM_COLS.RAB_ID] || "",
        scope: r[RAB_ITEM_COLS.SCOPE] || "",
        item_name: r[RAB_ITEM_COLS.NAME] || "",
        category: r[RAB_ITEM_COLS.CATEGORY] || "",
        qty: n(r[RAB_ITEM_COLS.QTY]),
        unit: r[RAB_ITEM_COLS.UNIT] || "",
        material_price: n(r[RAB_ITEM_COLS.MATERIAL_PRICE]),
        labour_price: n(r[RAB_ITEM_COLS.LABOUR_PRICE]),
        unit_price: n(r[RAB_ITEM_COLS.UNIT_PRICE]),
        total_price: n(r[RAB_ITEM_COLS.TOTAL_PRICE]),
        status: r[RAB_ITEM_COLS.STATUS] || "Draft",
        created_by: r[RAB_ITEM_COLS.CREATED_BY] || "",
        created_at: r[RAB_ITEM_COLS.CREATED_AT] || new Date().toISOString(),
        updated_at: r[RAB_ITEM_COLS.UPDATED_AT] || "",
      }))
      .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""))

    // Calculate totals
    const total_value = items.reduce((sum, i) => sum + i.total_price, 0)
    const total_items = items.length

    // Update header if needed
    if (total_value !== n(headerRow[RAB_HEADER.TOTAL_VALUE])) {
      await withRetry(() => sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!G${headerRowNum}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[total_value]] }
      }))
    }

    if (total_items !== n(headerRow[RAB_HEADER.TOTAL_ITEMS])) {
      await withRetry(() => sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!F${headerRowNum}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[total_items]] }
      }))
    }

    logger.info('GET Success', { rab_id, total_items, total_value })

    return NextResponse.json({
  rab_id,
  inquiry_id: headerRow[RAB_HEADER.INQUIRY_ID] || null,
  project_id: headerRow[RAB_HEADER.PROJECT_ID] || "",
  project_name: headerRow[RAB_HEADER.PROJECT_NAME] || "",
  customer_name: headerRow[RAB_HEADER.CUSTOMER_NAME] || "",
  total_items,
  total_value,
  status: headerRow[RAB_HEADER.STATUS] || "Draft",
  created_by: headerRow[RAB_HEADER.CREATED_BY] || "",
  created_at: headerRow[RAB_HEADER.CREATED_AT] || "",
  items,
})

  } catch (error: any) {
    logger.error('GET Failed', error, { rab_id })
    const status = error.code || error.response?.status
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ message: error.message }, { status })
    }
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 })
  }
}

// ==================== PATCH ====================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ rab_id: string }> }
) {
  let rab_id: string
  
  try {
    const resolvedParams = await params
    rab_id = resolvedParams.rab_id
    const body = await req.json()

    // Validate input types
    if (body.project_name !== undefined && typeof body.project_name !== 'string') {
      return NextResponse.json({ message: "project_name harus string" }, { status: 400 })
    }
    if (body.customer_name !== undefined && typeof body.customer_name !== 'string') {
      return NextResponse.json({ message: "customer_name harus string" }, { status: 400 })
    }
    if (body.status !== undefined && !VALID_STATUSES.includes(body.status as any)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 })
    }

    // Find header row
    const headerRes = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:K`,
    }))

    const headerRows = headerRes.data.values || []
    const idx = headerRows.findIndex(r => r[RAB_HEADER.ID] === rab_id)
    if (idx === -1) {
      return NextResponse.json({ message: "RAB tidak ditemukan" }, { status: 404 })
    }

    const rowNum = idx + 2
    const currentRow = headerRows[idx]

    // Validate status transition
    const currentStatus = currentRow[RAB_HEADER.STATUS] || "Draft"
    if (body.status && body.status !== currentStatus) {
      if (!STATUS_TRANSITIONS[currentStatus]?.includes(body.status)) {
        return NextResponse.json(
          { message: `Tidak bisa ubah status dari ${currentStatus} ke ${body.status}` },
          { status: 400 }
        )
      }
    }

    // Prepare updates
    const updates: Record<number, any> = {}
    if (body.project_name !== undefined) updates[RAB_HEADER.PROJECT_NAME] = body.project_name
    if (body.customer_name !== undefined) updates[RAB_HEADER.CUSTOMER_NAME] = body.customer_name
    if (body.status !== undefined) updates[RAB_HEADER.STATUS] = body.status
    if (body.action !== undefined)
  updates[RAB_HEADER.ACTION] = body.action

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Tidak ada data yang diupdate" }, { status: 400 })
    }

    // Apply updates
    for (const [colIdx, value] of Object.entries(updates)) {
      const col = String.fromCharCode(65 + Number(colIdx))
      await withRetry(() => sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT}!${col}${rowNum}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[value]] }
      }))
    }

    logger.info('PATCH Success', { rab_id, updates: Object.keys(updates) })

    return NextResponse.json({
      success: true,
      message: "RAB berhasil diupdate",
      updates: Object.keys(updates)
    })

  } catch (error: any) {
    logger.error('PATCH Failed', error, { rab_id })
    const status = Number(error.code || error.response?.status)
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ success: false, message: error.message }, { status })
    }
    return NextResponse.json({ success: false, message: "Gagal update RAB" }, { status: 500 })
  }
}

// ==================== DELETE ====================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ rab_id: string }> }
) {
  let rab_id: string
  
  try {
    const resolvedParams = await params
    rab_id = resolvedParams.rab_id

    // Find header row
    const headerRes = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:K`,
    }))

    const headerRows = headerRes.data.values || []
    const idx = headerRows.findIndex(r => r[RAB_HEADER.ID] === rab_id)
    if (idx === -1) {
      return NextResponse.json({ message: "RAB tidak ditemukan" }, { status: 404 })
    }

    const rowNum = idx + 2
    const currentRow = headerRows[idx]

    // Check if approved
    if (currentRow[RAB_HEADER.STATUS] === "Approved") {
      return NextResponse.json(
        { message: "RAB yang sudah Approved tidak bisa dihapus" },
        { status: 403 }
      )
    }

    // Soft delete header
    await withRetry(() => sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!H${rowNum}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["Deleted"]] }
    }))

    // Find and soft delete items
    const itemRes = await withRetry(() => sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A2:Q`,
    }))

    const itemRows = itemRes.data.values || []
    const itemIndices = itemRows
      .map((r, i) => r[RAB_ITEM_COLS.RAB_ID] === rab_id ? i + 2 : -1)
      .filter(i => i !== -1)

    for (const itemRow of itemIndices) {
      await withRetry(() => sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_ITEM}!M${itemRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Deleted"]] }
      }))
    }

    logger.info('DELETE Success', { rab_id, items_deleted: itemIndices.length })

    return NextResponse.json({
      success: true,
      message: "RAB berhasil dihapus",
      deleted_items: itemIndices.length
    })

  } catch (error: any) {
    logger.error('DELETE Failed', error, { rab_id })
    const status = error.code || error.response?.status
    if ([404, 403, 429].includes(status)) {
      return NextResponse.json({ success: false, message: error.message }, { status })
    }
    return NextResponse.json({ success: false, message: "Gagal menghapus RAB" }, { status: 500 })
  }
}
