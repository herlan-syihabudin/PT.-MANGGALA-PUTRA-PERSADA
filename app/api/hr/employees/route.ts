import { NextRequest, NextResponse } from "next/server"
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
const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SHEET_NAME = "EMPLOYEE_MASTER"

/* ================= NORMALIZER ================= */

function normalizeEmployee(obj: any) {
  return {
    ...obj,
    is_active:
      String(obj.is_active).trim().toLowerCase() === "true",
    tipe_karyawan: String(obj.tipe_karyawan || "").trim(),
    status_karyawan: String(obj.status_karyawan || "").trim(),
  }
}

/* ================= UTIL ================= */

async function getAllRows() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:T`,
  })

  const [headers, ...rows] = res.data.values || []

  return rows.map((r) => {
    const obj: any = {}
    headers.forEach((h: string, i: number) => {
      obj[h] = r[i] ?? ""
    })
    return normalizeEmployee(obj)
  })
}

/* ================= GET ================= */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")

    const rows = await getAllRows()

    if (employee_id) {
      const emp = rows.find((r) => r.employee_id === employee_id)
      if (!emp) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        )
      }
      return NextResponse.json(emp)
    }

    return NextResponse.json(rows)
  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err)
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    )
  }
}

/* ================= POST ================= */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body.action || "add"

    const rows = await getAllRows()

    /* ===== ADD ===== */
    if (action === "add") {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: SHEET_NAME,
        valueInputOption: "RAW",
        requestBody: {
          values: [[
            body.employee_id,
            body.nama_lengkap,
            body.nik_ktp,
            body.jenis_kelamin,
            body.tgl_lahir,
            body.tempat_lahir,
            body.status_pernikahan,
            body.alamat_domisili,
            body.email,
            body.no_hp,
            body.divisi,
            body.jabatan,
            body.atasan_langsung,
            body.lokasi_kerja,
            body.status_karyawan ?? "",
            body.tipe_karyawan ?? "",
            body.tgl_masuk,
            "TRUE", // ⬅ konsisten STRING
            new Date().toISOString(),
            new Date().toISOString(),
          ]],
        },
      })

      return NextResponse.json({ success: true })
    }

    /* ===== UPDATE ===== */
    if (action === "update") {
      const index = rows.findIndex(
        (r) => r.employee_id === body.employee_id
      )
      if (index === -1) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        )
      }

      const rowNumber = index + 2

      await sheets.spreadsheets.values.update({
  spreadsheetId: SHEET_ID,
  range: `${SHEET_NAME}!B${rowNumber}:T${rowNumber}`,
  valueInputOption: "RAW",
  requestBody: {
    values: [[
      body.nama_lengkap,
      body.nik_ktp,
      body.jenis_kelamin,
      body.tgl_lahir,
      body.tempat_lahir,
      body.status_pernikahan,
      body.alamat_domisili,
      body.email,
      body.no_hp,
      body.divisi,
      body.jabatan,
      body.atasan_langsung,
      body.lokasi_kerja,
      body.status_karyawan ?? "",
      body.tipe_karyawan ?? "",
      body.tgl_masuk ?? "",
      rows[index].is_active ? "TRUE" : "FALSE",
      rows[index].created_at,
      new Date().toISOString(), // ✅ updated_at
    ]],
  },
})

      return NextResponse.json({ success: true })
    }

    /* ===== NONAKTIF ===== */
    if (action === "nonaktif") {
      const index = rows.findIndex(
        (r) => r.employee_id === body.employee_id
      )
      if (index === -1) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }

      const rowNumber = index + 2

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!R${rowNumber}:T${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[
            "FALSE",
            "",
            new Date().toISOString()
          ]],
        },
      })

      return NextResponse.json({ success: true })
    }

    /* ===== BULK NONAKTIF ===== */
    if (action === "bulk_nonaktif") {
      let count = 0

      for (let i = 0; i < rows.length; i++) {
        if (body.employee_ids.includes(rows[i].employee_id)) {
          const rowNumber = i + 2
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!R${rowNumber}:T${rowNumber}`,
            valueInputOption: "RAW",
            requestBody: {
              values: [[
                "FALSE",
                "",
                new Date().toISOString()
              ]],
            },
          })
          count++
        }
      }

      return NextResponse.json({ success: true, total: count })
    }

    /* ===== BULK DELETE ===== */
if (action === "bulk_delete") {
  const remaining = rows.filter(
    (r) => !body.employee_ids.includes(r.employee_id)
  )

  // rewrite sheet (AMAN kalau jumlah kecil)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A2:T`,
  })

  if (remaining.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2`,
      valueInputOption: "RAW",
      requestBody: {
        values: remaining.map((r) => [
          r.employee_id,
          r.nama_lengkap,
          r.nik_ktp,
          r.jenis_kelamin,
          r.tgl_lahir,
          r.tempat_lahir,
          r.status_pernikahan,
          r.alamat_domisili,
          r.email,
          r.no_hp,
          r.divisi,
          r.jabatan,
          r.atasan_langsung,
          r.lokasi_kerja,
          r.status_karyawan,
          r.tipe_karyawan,
          r.tgl_masuk,
          r.is_active ? "TRUE" : "FALSE",
          r.created_at,
          r.updated_at,
        ]),
      },
    })
  }

  return NextResponse.json({ success: true })
}
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err) {
    console.error("HR API ERROR:", err)
    return NextResponse.json(
      { error: "HR API error" },
      { status: 500 }
    )
  }
}
