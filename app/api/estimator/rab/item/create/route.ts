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
const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

const RAB_ITEM_SHEET = "RAB_ITEM"
const RAB_PROJECT_SHEET = "RAB_PROJECT"

export async function POST(req: Request) {
  try {
    const {
      rab_id,
      project_id,
      scope,
      item_name,
      category,
      qty,
      unit,
      material_price,
      labour_price,
      created_by,
    } = await req.json()

    if (!rab_id || !project_id || !item_name) {
      return NextResponse.json(
        { message: "Data wajib belum lengkap" },
        { status: 400 }
      )
    }

    const created_at = new Date().toISOString()
    const updated_at = created_at

    const item_id = "ITEM-" + nanoid(8).toUpperCase()

    const qtyNum = Number(qty) || 0
    const materialNum = Number(material_price) || 0
    const labourNum = Number(labour_price) || 0

    const unit_price = materialNum + labourNum
    const total_price = qtyNum * unit_price

    /* ================= INSERT RAB ITEM ================= */

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${RAB_ITEM_SHEET}!A:O`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          item_id,
          rab_id,
          project_id,
          scope || "",
          item_name,
          category || "",
          qtyNum,
          unit || "",
          materialNum,
          labourNum,
          unit_price,
          total_price,
          "Draft",
          created_by || "Estimator",
          created_at,
          updated_at
        ]]
      }
    })

    /* ================= UPDATE RAB HEADER ================= */

    const rabRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT_SHEET}!A2:K1000`,
    })

    const rabRows = rabRes.data.values || []
    const rabIndex = rabRows.findIndex(r => r[0] === rab_id)

    if (rabIndex !== -1) {
      const row = rabIndex + 2

      const currentTotalItem = Number(rabRows[rabIndex][5]) || 0
      const currentTotalNilai = Number(rabRows[rabIndex][6]) || 0

      const newTotalItem = currentTotalItem + 1
      const newTotalNilai = currentTotalNilai + total_price

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${RAB_PROJECT_SHEET}!F${row}:G${row}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[newTotalItem, newTotalNilai]]
        }
      })
    }

    return NextResponse.json({
      message: "Item RAB berhasil ditambahkan",
      item_id,
      unit_price,
      total_price
    })

  } catch (error) {
    console.error("CREATE RAB ITEM ERROR:", error)
    return NextResponse.json(
      { message: "Gagal menambahkan item RAB" },
      { status: 500 }
    )
  }
}
