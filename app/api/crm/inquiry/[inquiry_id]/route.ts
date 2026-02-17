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

const SHEET_ID = process.env.GSHEET_CRM_ID!
const SHEET_NAME = "CRM_INQUIRY"

/* ===================================================== */
/* ====================== GET DETAIL =================== */
/* ===================================================== */

export async function GET(
  _: Request,
  { params }: { params: { inquiry_id: string } }
) {
  try {
    const inquiryId = params.inquiry_id

    if (!inquiryId) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:Q`,
    })

    const rows = res.data.values || []

    const normalize = (val: string) =>
  String(val).trim()

const rowIndex = rows.findIndex((r) =>
  normalize(r[0]) === normalize(inquiryId)
)

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const row = rows[rowIndex]

// ✅ BIKIN DULU DI LUAR OBJECT
const rawBudget = String(row[6] || "").replace(/[^\d]/g, "")

const data = {
  inquiry_id: row[0] || "",
  tanggal_masuk: row[1] || "",
  customer_id: row[2] || "",
  customer_name: row[3] || "",
  nama_pekerjaan: row[4] || "",
  layanan: row[5] || "",

  estimasi_nilai: rawBudget ? Number(rawBudget) : null,

  sumber: row[7] || "",
  assigned_to: row[8] || "",
  status: String(row[9] || "new").toLowerCase(),
  prioritas: row[10] || "",
  lokasi: row[11] || "",
  catatan: row[12] || "",
  converted_rab_id: row[13] || "",
  converted_project_id: row[14] || "",
  created_at: row[15] || "",
  created_by: row[16] || "",
}

    return NextResponse.json(data)
  } catch (error) {
    console.error("Detail Inquiry Error:", error)
    return NextResponse.json(
      { message: "Gagal load detail inquiry" },
      { status: 500 }
    )
  }
}

/* ===================================================== */
/* ====================== PATCH UPDATE ================= */
/* ===================================================== */

export async function PATCH(
  req: Request,
  { params }: { params: { inquiry_id: string } }
) {
  try {
    const inquiryId = params.inquiry_id
    const body = await req.json()

    if (!inquiryId) {
      return NextResponse.json(
        { message: "inquiry_id wajib" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:Q`,
    })

    const rows = res.data.values || []

   const normalize = (val: string) =>
  String(val).replace(/[\s-]/g, "").trim()

const rowIndex = rows.findIndex((r) =>
  normalize(r[0]) === normalize(inquiryId)
)

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    // karena data mulai dari A2
    const actualRowNumber = rowIndex + 2

    /* ================= COLUMN MAP ================= */

    const COLUMN_MAP: Record<string, string> = {
  assigned_to: "I",
  status: "J",
  prioritas: "K",
  lokasi: "L",
  catatan: "M",
  converted_rab_id: "N",
  converted_project_id: "O",
}

    /* ================= DYNAMIC UPDATE ================= */

    for (const key of Object.keys(body)) {
      if (COLUMN_MAP[key]) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${SHEET_NAME}!${COLUMN_MAP[key]}${actualRowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[body[key]]],
          },
        })
      }
    }

    return NextResponse.json({
      message: "Inquiry berhasil diperbarui",
    })
  } catch (error) {
    console.error("Update Inquiry Error:", error)
    return NextResponse.json(
      { message: "Gagal update inquiry" },
      { status: 500 }
    )
  }
}
