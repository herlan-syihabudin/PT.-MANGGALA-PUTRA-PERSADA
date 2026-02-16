import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= SAFE AUTH FACTORY ================= */
function getSheetsClient() {
  if (
    !process.env.GOOGLE_CLIENT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY ||
    !process.env.GOOGLE_SHEET_ID
  ) {
    throw new Error("Missing Google ENV variables")
  }

  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  return {
    sheets: google.sheets({ version: "v4", auth }),
    sheetId: process.env.GOOGLE_SHEET_ID,
  }
}

const EMPLOYEE_SHEET = "EMPLOYEE_MASTER"
const STATUS_SHEET = "EMPLOYMENT_STATUS"

/* ================= GET ================= */
export async function GET(req: NextRequest) {
  try {
    const { sheets, sheetId } = getSheetsClient()
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")

    /* ===== GET STATUS ===== */
    const statRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${STATUS_SHEET}!A1:J`,
    })

    const values = statRes.data.values || []
    if (values.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const headers = values[0]
    const rows = values.slice(1)

    const statuses = rows.map((r) => {
      const obj: any = {}
      headers.forEach((h, i) => {
        obj[h] = r[i] ?? ""
      })
      return obj
    })

    if (employee_id) {
      return NextResponse.json({
        data: statuses.filter(
          (s) => s.employee_id === employee_id
        ),
      })
    }

    /* ===== GET EMPLOYEE MASTER ===== */
    const empRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${EMPLOYEE_SHEET}!A1:T`,
    })

    const empValues = empRes.data.values || []
    if (empValues.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const empHeaders = empValues[0]
    const empRows = empValues.slice(1)

    const employees = empRows.map((r) => {
      const obj: any = {}
      empHeaders.forEach((h, i) => {
        obj[h] = r[i] ?? ""
      })
      return obj
    })

    const data = employees.map((e) => {
      const current = statuses.find(
        (s) =>
          s.employee_id === e.employee_id &&
          s.is_current === "TRUE"
      )

      return {
        employee_id: e.employee_id,
        nama_lengkap: e.nama_lengkap,
        divisi: e.divisi,
        jabatan: e.jabatan,
        tipe_karyawan: e.tipe_karyawan,
        status_aktif: current?.status || "Belum diset",
        sejak: current?.start_date || "-",
        is_current: Boolean(current),
      }
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error("EMP STATUS ERROR:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const { sheets, sheetId } = getSheetsClient()
    const body = await req.json()

    if (!body.employee_id) {
      return NextResponse.json(
        { error: "employee_id wajib" },
        { status: 400 }
      )
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${STATUS_SHEET}!A1:J`,
    })

    const values = res.data.values || []
    if (values.length === 0) {
      return NextResponse.json(
        { error: "Sheet kosong / header tidak ditemukan" },
        { status: 500 }
      )
    }

    const headers = values[0]
    const rows = values.slice(1)

    const idxEmployee = headers.indexOf("employee_id")
    const idxIsCurrent = headers.indexOf("is_current")

    // nonaktifkan status lama
    for (let i = 0; i < rows.length; i++) {
      if (
        rows[i][idxEmployee] === body.employee_id &&
        rows[i][idxIsCurrent] === "TRUE"
      ) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${STATUS_SHEET}!${String.fromCharCode(
            65 + idxIsCurrent
          )}${i + 2}`,
          valueInputOption: "RAW",
          requestBody: { values: [["FALSE"]] },
        })
      }
    }

    // append status baru
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: STATUS_SHEET,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          body.employee_id,
          body.status,
          body.jenis_status,
          body.lokasi_kerja || "",
          body.start_date,
          "",
          "TRUE",
          new Date().toISOString(),
          body.updated_by || "SYSTEM",
          body.keterangan || "",
        ]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("POST STATUS ERROR:", err)
    return NextResponse.json({ error: "Failed save" }, { status: 500 })
  }
}