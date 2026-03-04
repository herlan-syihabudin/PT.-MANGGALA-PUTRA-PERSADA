import { NextResponse } from "next/server"
import { google } from "googleapis"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

/* ================= ENV VALIDATION ================= */

const required = [
  "GOOGLE_CLIENT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GSHEET_ESTIMATOR_ID"
] as const

const missing = required.filter(k => !process.env[k])

if (missing.length > 0) {
  console.error("Missing ENV:", missing)
}

/* ================= GOOGLE AUTH ================= */

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

const WORK_LIBRARY = "WORK_LIBRARY"
const RAB_ITEM = "RAB_ITEM"

/* ================= COLUMN INDEX ================= */

const LIB_COL = {
  PACKAGE_ID: 0,
  PACKAGE_NAME: 1,
  CATEGORY_ID: 2,
  CATEGORY: 3,
  SCOPE_ID: 4,
  SCOPE: 5,
  JOB_ID: 6,
  JOB_NAME: 7,
  UNIT: 8,
  MATERIAL: 9,
  LABOUR: 10,
}

const RAB_COL_COUNT = 15

/* ================= HELPER ================= */

function parseNumber(val: any) {
  const num = Number(String(val || 0).replace(/[^\d-]/g, ""))
  return isNaN(num) ? 0 : num
}

/* ================= API ================= */

export async function POST(req: Request) {
  try {

    const body = await req.json()

    const { rab_id, package_id } = body

    if (!rab_id || !package_id) {
      return NextResponse.json(
        { success: false, error: "rab_id & package_id wajib" },
        { status: 400 }
      )
    }

    /* ================= AMBIL WORK LIBRARY ================= */

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${WORK_LIBRARY}!A2:R`
    })

    const rows = res.data.values || []

    const packageItems = rows.filter(
      row => row[LIB_COL.PACKAGE_ID] === package_id
    )

    if (packageItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Package tidak ditemukan"
      })
    }

    /* ================= GENERATE RAB ITEMS ================= */

    const now = new Date().toISOString()
    const createdBy = "SYSTEM"

    const newRows = packageItems.map(row => {

      const material = parseNumber(row[LIB_COL.MATERIAL])
      const labour = parseNumber(row[LIB_COL.LABOUR])

      const unitPrice = material + labour

      return [
        `ITEM-${uuidv4().slice(0,8)}`,     // item_id
        rab_id,                            // rab_id
        row[LIB_COL.SCOPE],                // scope
        row[LIB_COL.CATEGORY],             // category
        row[LIB_COL.JOB_NAME],             // item_name
        0,                                 // qty
        row[LIB_COL.UNIT],                 // unit
        material,                          // material_price
        labour,                            // labour_price
        0,                                 // equipment_price
        unitPrice,                         // unit_price
        0,                                 // total_price
        "active",                          // status
        createdBy,
        now
      ]
    })

    /* ================= INSERT RAB_ITEM ================= */

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM}!A2`,
      valueInputOption: "RAW",
      requestBody: {
        values: newRows
      }
    })

    return NextResponse.json({
      success: true,
      inserted_items: newRows.length,
      rab_id,
      package_id
    })

  } catch (error: any) {

    console.error("FROM LIBRARY ERROR:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Gagal generate RAB dari library"
      },
      { status: 500 }
    )
  }
}
