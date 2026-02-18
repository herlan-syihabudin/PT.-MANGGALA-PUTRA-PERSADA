import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { inquiry_id, created_by } = await req.json()

    if (!inquiry_id) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    /* ================= ENV CHECK ================= */

    if (
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GSHEET_CRM_ID ||
      !process.env.GSHEET_PROJECT_ID ||
      !process.env.GSHEET_ESTIMATOR_ID
    ) {
      return NextResponse.json(
        { message: "Environment variables belum diset" },
        { status: 500 }
      )
    }

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    )

    const sheets = google.sheets({ version: "v4", auth })

    const CRM_SHEET_ID = process.env.GSHEET_CRM_ID
    const PROJECT_SHEET_ID = process.env.GSHEET_PROJECT_ID
    const ESTIMATOR_SHEET_ID = process.env.GSHEET_ESTIMATOR_ID

    const INQUIRY_SHEET = "CRM_INQUIRY"
    const PROJECT_SHEET = "PROJECT MASTER"
    const RAB_PROJECT = "RAB_PROJECT"
    const SALES_PIPELINE = "SALES_PIPELINE"

    /* ================= GET INQUIRY ================= */

    const inquiryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: CRM_SHEET_ID,
      range: `${INQUIRY_SHEET}!A2:Q1000`,
    })

    const inquiryRows = inquiryRes.data.values || []

    const inquiryIndex = inquiryRows.findIndex(
      (r) => r[0] === inquiry_id
    )

    if (inquiryIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const inquiry = inquiryRows[inquiryIndex]

    /* 🔥 Prevent Double Create */
    if (inquiry[13]) {
      return NextResponse.json(
        { message: "Inquiry sudah pernah dibuat RAB" },
        { status: 400 }
      )
    }

    const customer_id = inquiry[2] || ""
    const customer_name = inquiry[3] || ""
    const nama_pekerjaan = inquiry[4] || ""
    const lokasi = inquiry[11] || ""

    const estimasi_nilai = Number(
      String(inquiry[6] || "0").replace(/[^\d]/g, "")
    )

    const created_at = new Date().toISOString()
    const year = new Date().getFullYear()

    /* ================= AUTO NUMBER PROJECT ================= */

    const projectRes = await sheets.spreadsheets.values.get({
      spreadsheetId: PROJECT_SHEET_ID,
      range: `${PROJECT_SHEET}!A2:A1000`,
    })

    const existingProjects = projectRes.data.values || []
    const nextProjectNumber = existingProjects.length + 1

    const project_id = `PRJ-${year}-${String(nextProjectNumber).padStart(3, "0")}`

    await sheets.spreadsheets.values.append({
      spreadsheetId: PROJECT_SHEET_ID,
      range: `${PROJECT_SHEET}!A:J`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id,
          nama_pekerjaan,
          customer_id,
          lokasi,
          0,
          "",
          "",
          "planning",
          created_at,
          "MEP"
        ]]
      }
    })

    /* ================= AUTO NUMBER RAB ================= */

    const rabRes = await sheets.spreadsheets.values.get({
      spreadsheetId: ESTIMATOR_SHEET_ID,
      range: `${RAB_PROJECT}!A2:A1000`,
    })

    const existingRabs = rabRes.data.values || []
    const nextRabNumber = existingRabs.length + 1

    const rab_id = `RAB-${year}-${String(nextRabNumber).padStart(3, "0")}`

    await sheets.spreadsheets.values.append({
      spreadsheetId: ESTIMATOR_SHEET_ID,
      range: `${RAB_PROJECT}!A:K`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          rab_id,
          inquiry_id,
          project_id,
          nama_pekerjaan,
          customer_name,
          0,
          0,
          "Draft",
          created_by || "System",
          created_at
        ]]
      }
    })

    /* ================= UPDATE CRM ================= */

    const row = inquiryIndex + 2

    await sheets.spreadsheets.values.update({
      spreadsheetId: CRM_SHEET_ID,
      range: `${INQUIRY_SHEET}!J${row}:O${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          "estimating",
          inquiry[10] || "",
          inquiry[11] || "",
          inquiry[12] || "",
          rab_id,
          project_id
        ]]
      }
    })

    /* ================= UPDATE SALES PIPELINE ================= */

    const pipelineRes = await sheets.spreadsheets.values.get({
      spreadsheetId: CRM_SHEET_ID,
      range: `${SALES_PIPELINE}!A2:I2000`,
    })

    const pipelineRows = pipelineRes.data.values || []
    const pIndex = pipelineRows.findIndex((r) => r[0] === inquiry_id)

    if (pIndex === -1) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: CRM_SHEET_ID,
        range: `${SALES_PIPELINE}!A:I`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            inquiry_id,
            customer_id,
            nama_pekerjaan,
            "PENAWARAN",
            estimasi_nilai,
            rab_id,
            "",
            created_at,
            created_at
          ]]
        }
      })
    } else {
      const prow = pIndex + 2

      await sheets.spreadsheets.values.update({
        spreadsheetId: CRM_SHEET_ID,
        range: `${SALES_PIPELINE}!D${prow}:I${prow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            "PENAWARAN",
            estimasi_nilai,
            rab_id,
            "",
            created_at,
            new Date().toISOString()
          ]]
        }
      })
    }

    return NextResponse.json({
      message: "RAB berhasil dibuat",
      rab_id,
      project_id,
    })

  } catch (error) {
    console.error("CREATE RAB ERROR:", error)
    return NextResponse.json(
      { message: "Gagal membuat RAB" },
      { status: 500 }
    )
  }
}
