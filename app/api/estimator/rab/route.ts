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
const CRM_SHEET_ID = process.env.GSHEET_CRM_ID!

const RAB_PROJECT = "RAB_PROJECT"
const CRM_INQUIRY = "CRM_INQUIRY"

function n(x: any) {
  const v = Number(x)
  return Number.isFinite(v) ? v : 0
}

// ===================== GET ALL RAB =====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 50

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A2:K`,
    })

    let rows = res.data.values || []
    let data = rows
      .filter(r => r[0]) // minimal harus ada rab_id
      .map((r) => ({
        rab_id: r[0],
        inquiry_id: r[1],
        project_id: r[2],
        project_name: r[3],
        customer_name: r[4],
        total_items: n(r[5]),
        total_value: n(r[6]),
        status: r[7] || "Draft",
        created_by: r[8] || "",
        created_at: r[9] || "",
      }))

    // Filter by status
    if (status) {
      const statusList = status.split(',')
      data = data.filter(item => statusList.includes(item.status.toLowerCase()))
    }

    // Search by project name or customer
    if (search) {
      const s = search.toLowerCase()
      data = data.filter(item => 
        item.project_name?.toLowerCase().includes(s) ||
        item.customer_name?.toLowerCase().includes(s)
      )
    }

    // Sort by created_at desc
    data.sort((a, b) => b.created_at.localeCompare(a.created_at))

    // Pagination
    const start = (page - 1) * limit
    const paginated = data.slice(start, start + limit)

    return NextResponse.json({
      data: paginated,
      pagination: {
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit)
      }
    })

  } catch (e) {
    console.error("GET RAB ERROR:", e)
    return NextResponse.json(
      { message: "Gagal load RAB" },
      { status: 500 }
    )
  }
}

// ===================== CREATE RAB =====================
export async function POST(req: Request) {
  try {
    const { inquiry_id, created_by = "Estimator" } = await req.json()

    if (!inquiry_id) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    // ===== CEK INQUIRY =====
    const crmRes = await sheets.spreadsheets.values.get({
      spreadsheetId: CRM_SHEET_ID,
      range: `${CRM_INQUIRY}!A2:Q`,
    })

    const rows = crmRes.data.values || []
    const inquiryRow = rows.find(r => r[0] === inquiry_id)

    if (!inquiryRow) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    // Cek apakah sudah pernah di-convert
    if (inquiryRow[13]) {
      return NextResponse.json(
        { message: "Inquiry sudah memiliki RAB", rab_id: inquiryRow[13] },
        { status: 400 }
      )
    }

    // ===== GENERATE ID =====
    const rab_id = "RAB-" + nanoid(8).toUpperCase()
    const project_id = "PRJ-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    const project_name = inquiryRow[4] || "Tanpa Nama Project"
    const customer_name = inquiryRow[3] || "-"

    // ===== INSERT RAB =====
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${RAB_PROJECT}!A:K`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rab_id,
          inquiry_id,
          project_id,
          project_name,
          customer_name,
          0,  // total_items
          0,  // total_value
          "Draft",
          created_by,
          now,
          "",  // kolom K (kosong)
        ]]
      }
    })

    // ===== UPDATE INQUIRY =====
    const rowIndex = rows.findIndex(r => r[0] === inquiry_id)
    const sheetRowNumber = rowIndex + 2

    await sheets.spreadsheets.values.update({
      spreadsheetId: CRM_SHEET_ID,
      range: `${CRM_INQUIRY}!N${sheetRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[rab_id]]
      }
    })

    return NextResponse.json({
      success: true,
      message: "RAB berhasil dibuat",
      rab_id,
      project_id
    })

  } catch (e) {
    console.error("CREATE RAB ERROR:", e)
    return NextResponse.json(
      { message: "Gagal membuat RAB" },
      { status: 500 }
    )
  }
}
