import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= GOOGLE AUTH ================= */

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CRM_INQUIRY"

/* ================= GET ================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number(searchParams.get("page") || 1))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)))
    const filterStatus = searchParams.get("status")
    const filterCustomerId = searchParams.get("customer_id")

    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:Q`,
    })

    const rows = (inquiryRes.data.values || []).filter(row => row[0])

    const normalize = (val: any) =>
      String(val || "").replace(/\s+/g, "").trim()

    let data = rows.map((row) => {
      const rawBudget = String(row[6] || "").replace(/[^\d]/g, "")

      return {
        inquiry_id: row[0] || "",
        tanggal_masuk: row[1] || "",
        customer_id: row[2] || "",
        customer_name: row[3] || "",
        nama_pekerjaan: row[4] || "",
        layanan: row[5] || "",
        estimasi_nilai: rawBudget ? Number(rawBudget) : null,
        sumber: row[7] || "",
        assigned_to: row[8] || "",
        status: String(row[9] || "new").toLowerCase().trim(),
        prioritas: row[10] || "normal",
        lokasi: row[11] || "",
        catatan: row[12] || "",
        converted_rab_id: row[13] || "",
        converted_project_id: row[14] || "", // 👉 penentu WON
        created_at: row[15] || "",
        created_by: row[16] || "",
      }
    })

    /* ================= FILTER ================= */

    if (filterCustomerId) {
      data = data.filter(i =>
        normalize(i.customer_id) === normalize(filterCustomerId)
      )
    }

    if (filterStatus) {
      data = data.filter(i =>
        i.status === filterStatus.toLowerCase()
      )
    }

    /* ================= SORT ================= */

    data.sort((a, b) => {
      const dateA = a.tanggal_masuk ? new Date(a.tanggal_masuk).getTime() : 0
      const dateB = b.tanggal_masuk ? new Date(b.tanggal_masuk).getTime() : 0
      return dateB - dateA
    })

    /* ================= KPI ================= */

    const total = data.length
    const newCount = data.filter(i => i.status === "new").length
    const lost = data.filter(i => i.status === "lost").length

    // ✅ WON dihitung dari project_id (artinya sudah PO)
    const won = data.filter(i => i.converted_project_id).length

    const ongoingStatuses = ["survey", "estimating", "sent"]
    const ongoing = data.filter(i =>
      ongoingStatuses.includes(i.status)
    ).length

    // ✅ Pipeline hanya yang belum lost & belum PO
    const pipelineValue = data
      .filter(i => !i.converted_project_id && i.status !== "lost")
      .reduce((acc, i) =>
        acc + (i.estimasi_nilai || 0), 0
      )

    /* ================= PAGINATION ================= */

    const start = (page - 1) * limit
    const paginated = data.slice(start, start + limit)

    return NextResponse.json({
      data: paginated,
      summary: {
        total,
        new: newCount,
        ongoing,
        won,
        lost,
        pipeline_value: pipelineValue,
      },
      page,
      totalPages: Math.ceil(total / limit),
    })

  } catch (error) {
    console.error("GET Inquiry Error:", error)
    return NextResponse.json(
      { message: "Gagal load inquiry" },
      { status: 500 }
    )
  }
}

/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.customer_id || !body.nama_pekerjaan) {
      return NextResponse.json(
        { message: "Customer & Nama Pekerjaan wajib diisi" },
        { status: 400 }
      )
    }

    const inquiryId = `INQ-${Date.now()}`
    const now = new Date().toISOString()

    const budget = body.estimasi_nilai
      ? Number(String(body.estimasi_nilai).replace(/[^\d]/g, ""))
      : ""

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:Q`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          inquiryId,
          body.tanggal_masuk || new Date().toISOString().split("T")[0],
          String(body.customer_id).trim(),
          String(body.customer_name || "").trim(),
          String(body.nama_pekerjaan).trim(),
          String(body.layanan || "").trim(),
          budget,
          String(body.sumber || "").trim(),
          String(body.assigned_to || "").trim(),
          "new",
          String(body.prioritas || "normal").trim(),
          String(body.lokasi || "").trim(),
          String(body.catatan || "").trim(),
          "", // converted_rab_id
          "", // converted_project_id
          now,
          String(body.created_by || "Marketing").trim(),
        ]],
      },
    })

    return NextResponse.json({
      success: true,
      inquiry_id: inquiryId,
    })

  } catch (error) {
    console.error("POST Inquiry Error:", error)
    return NextResponse.json(
      { success: false },
      { status: 500 }
    )
  }
}
