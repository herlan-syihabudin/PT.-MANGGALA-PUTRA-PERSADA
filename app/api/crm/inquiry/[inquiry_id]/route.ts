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

    const rowIndex = rows.findIndex((r) => r[0] === inquiryId)

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    const row = rows[rowIndex]

    const data = {
      inquiry_id: row[0],
      tanggal_masuk: row[1],
      customer_id: row[2],
      customer_name: row[3],
      nama_pekerjaan: row[4],
      layanan: row[5],
      estimasi_nilai: Number(
        String(row[6] || 0).replace(/[^\d]/g, "")
      ),
      sumber: row[7],
      status: row[8],
      assigned_to: row[9],
      prioritas: row[10],
      lokasi: row[11],
      catatan: row[12],
      estimasi_deal_date: row[13],
      created_by: row[14],
      created_at: row[15],
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

    const rowIndex = rows.findIndex((r) => r[0] === inquiryId)

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "Inquiry tidak ditemukan" },
        { status: 404 }
      )
    }

    // +2 karena sheet mulai dari row ke-2 (A2)
    const actualRowNumber = rowIndex + 2

    /* ================= UPDATE STATUS ================= */

    if (body.status) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!I${actualRowNumber}`, // kolom STATUS (I)
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[body.status]],
        },
      })
    }

    /* ================= UPDATE ASSIGNED ================= */

    if (body.assigned_to) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!J${actualRowNumber}`, // kolom ASSIGNED (J)
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[body.assigned_to]],
        },
      })
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
