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
const SHEET_ID = process.env.GSHEET_PROCUREMENT_ID!
const MATERIAL_SHEET = "MATERIAL_MASTER"

type MaterialStatus = "ACTIVE" | "INACTIVE"

type Material = {
  material_id: string
  material_code: string
  material_name: string
  spesifikasi?: string
  category?: string
  material_type?: string
  unit: string
  default_price?: number
  last_price?: number
  min_stock?: number
  location?: string
  status: MaterialStatus
  created_by?: string
  updated_by?: string
  deleted_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  keterangan?: string
}

// ================= HELPERS =================

function n(v: any) {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

// ================= GET BY ID =================

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const material_id = params.id

    console.log('Fetching material with ID:', material_id)

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!A2:S`,
    })

    const rows = res.data.values || []
    
    // Cari material by ID (kolom A) dan tidak terhapus
    const materialRow = rows.find(r => r[0] === material_id && !r[17])

    if (!materialRow) {
      console.log('Material not found for ID:', material_id)
      return NextResponse.json({
        success: false,
        data: null,
        error: "Material not found",
      }, { status: 404 })
    }

    console.log('Material found:', materialRow[1])

    const material: Material = {
      material_id: materialRow[0] || "",
      material_code: materialRow[1] || "",
      material_name: materialRow[2] || "",
      spesifikasi: materialRow[3] || undefined,
      category: materialRow[4] || undefined,
      material_type: materialRow[5] || undefined,
      unit: materialRow[6] || "",
      default_price: n(materialRow[7]),
      last_price: n(materialRow[8]),
      min_stock: n(materialRow[9]),
      location: materialRow[10] || undefined,
      status: materialRow[11] === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      created_by: materialRow[12] || undefined,
      updated_by: materialRow[13] || undefined,
      deleted_by: materialRow[14] || undefined,
      created_at: materialRow[15] || "",
      updated_at: materialRow[16] || "",
      deleted_at: materialRow[17] || null,
      keterangan: materialRow[18] || undefined,
    }

    return NextResponse.json({
      success: true,
      data: material,
      error: null,
    })

  } catch (err) {
    console.error("GET MATERIAL BY ID ERROR:", err)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to fetch material",
    }, { status: 500 })
  }
}

// ================= DELETE (SOFT DELETE) =================

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const material_id = params.id

    console.log('Deleting material with ID:', material_id)

    // Cari baris material
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!A:S`,
    })

    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[0] === material_id)

    if (rowIndex === -1) {
      return NextResponse.json({
        success: false,
        error: "Material not found",
      }, { status: 404 })
    }

    // Soft delete: set deleted_at (kolom R) dengan timestamp
    const now = new Date().toISOString()
    
    // Update baris dengan menambahkan deleted_at
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!R${rowIndex + 2}`, // +2 karena header di baris 1
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[now]]
      }
    })

    console.log('Material deleted successfully:', material_id)

    return NextResponse.json({
      success: true,
      data: { material_id, deleted_at: now },
      error: null,
    })

  } catch (err) {
    console.error("DELETE MATERIAL ERROR:", err)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to delete material",
    }, { status: 500 })
  }
}

// ================= UPDATE =================

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const material_id = params.id
    const body = await request.json()

    console.log('Updating material with ID:', material_id)

    // Cari baris material
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!A:S`,
    })

    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[0] === material_id)

    if (rowIndex === -1) {
      return NextResponse.json({
        success: false,
        error: "Material not found",
      }, { status: 404 })
    }

    const now = new Date().toISOString()

    // Update data
    const updatedValues = [
      material_id,                                   // A
      body.material_code || rows[rowIndex][1],      // B
      body.material_name || rows[rowIndex][2],      // C
      body.spesifikasi || rows[rowIndex][3] || "",  // D
      body.category || rows[rowIndex][4] || "",     // E
      body.material_type || rows[rowIndex][5] || "",// F
      body.unit || rows[rowIndex][6],               // G
      body.default_price ?? rows[rowIndex][7],      // H
      body.last_price ?? rows[rowIndex][8],         // I
      body.min_stock ?? rows[rowIndex][9],          // J
      body.location || rows[rowIndex][10] || "",    // K
      body.status || rows[rowIndex][11],            // L
      rows[rowIndex][12],                            // M created_by (jangan diubah)
      body.updated_by || "SYSTEM",                   // N updated_by
      rows[rowIndex][14],                            // O deleted_by
      rows[rowIndex][15],                            // P created_at (jangan diubah)
      now,                                            // Q updated_at
      rows[rowIndex][17],                             // R deleted_at
      body.keterangan || rows[rowIndex][18] || "",   // S keterangan
    ]

    // Update seluruh baris
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${MATERIAL_SHEET}!A${rowIndex + 2}:S${rowIndex + 2}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updatedValues]
      }
    })

    // Ambil data yang sudah diupdate
    const updatedMaterial: Material = {
      material_id,
      material_code: updatedValues[1],
      material_name: updatedValues[2],
      spesifikasi: updatedValues[3] || undefined,
      category: updatedValues[4] || undefined,
      material_type: updatedValues[5] || undefined,
      unit: updatedValues[6],
      default_price: n(updatedValues[7]),
      last_price: n(updatedValues[8]),
      min_stock: n(updatedValues[9]),
      location: updatedValues[10] || undefined,
      status: updatedValues[11] as MaterialStatus,
      created_by: updatedValues[12] || undefined,
      updated_by: updatedValues[13] || undefined,
      deleted_by: updatedValues[14] || undefined,
      created_at: updatedValues[15],
      updated_at: updatedValues[16],
      deleted_at: updatedValues[17] || null,
      keterangan: updatedValues[18] || undefined,
    }

    return NextResponse.json({
      success: true,
      data: updatedMaterial,
      error: null,
    })

  } catch (err) {
    console.error("UPDATE MATERIAL ERROR:", err)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to update material",
    }, { status: 500 })
  }
}
