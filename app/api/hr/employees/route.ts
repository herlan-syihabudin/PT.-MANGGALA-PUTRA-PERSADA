import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= GOOGLE AUTH ================= */

// FIX: Better error handling for auth
function getAuth() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    if (!clientEmail || !privateKey) {
      throw new Error("Missing Google credentials")
    }

    return new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey,
      ["https://www.googleapis.com/auth/spreadsheets"]
    )
  } catch (error) {
    console.error("Auth Error:", error)
    throw new Error("Failed to initialize Google Auth")
  }
}

const auth = getAuth()
const sheets = google.sheets({ version: "v4", auth })

// FIX: Validate SHEET_ID
const SHEET_ID = process.env.GSHEET_HR_ID
if (!SHEET_ID) {
  throw new Error("Missing GSHEET_HR_ID environment variable")
}

const SHEET_NAME = "EMPLOYEE_MASTER"

// FIX: Define proper types
interface Employee {
  employee_id: string
  nama_lengkap: string
  nik_ktp: string
  jenis_kelamin?: string
  tgl_lahir?: string
  tempat_lahir?: string
  status_pernikahan?: string
  alamat_domisili?: string
  email?: string
  no_hp?: string
  divisi?: string
  jabatan?: string
  atasan_langsung?: string
  lokasi_kerja?: string
  status_karyawan: string
  tipe_karyawan: string
  tgl_masuk: string
  is_active: boolean
  created_at: string
  updated_at: string
  [key: string]: any // Index signature for dynamic access
}

/* ================= NORMALIZER ================= */

function normalizeEmployee(obj: any): Employee {
  return {
    ...obj,
    is_active: String(obj.is_active || "").trim().toLowerCase() === "true",
    tipe_karyawan: String(obj.tipe_karyawan || "").trim(),
    status_karyawan: String(obj.status_karyawan || "").trim(),
    nik_ktp: String(obj.nik_ktp || "").trim(),
    employee_id: String(obj.employee_id || "").trim(),
    nama_lengkap: String(obj.nama_lengkap || "").trim(),
    created_at: obj.created_at || new Date().toISOString(),
    updated_at: obj.updated_at || new Date().toISOString(),
  }
}

/* ================= UTIL ================= */

async function getAllRows(): Promise<Employee[]> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:T`,
    })

    const [headers, ...rows] = res.data.values || []
    
    if (!headers || headers.length === 0) {
      return []
    }

    return rows.map((r) => {
      const obj: any = {}
      headers.forEach((h: string, i: number) => {
        obj[h] = r[i] ?? ""
      })
      return normalizeEmployee(obj)
    })
  } catch (error) {
    console.error("Error fetching rows:", error)
    throw new Error("Failed to fetch data from Google Sheets")
  }
}

// FIX: Add validation helper
function validateRequiredFields(body: any, fields: string[]): string | null {
  for (const field of fields) {
    if (!body[field] || String(body[field]).trim() === "") {
      return `${field.replace(/_/g, " ")} wajib diisi`
    }
  }
  return null
}

/* ================= GET ================= */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")
    const active_only = searchParams.get("active_only") === "true"
    
    const rows = await getAllRows()

    // Filter active employees if requested
    let filteredRows = rows
    if (active_only) {
      filteredRows = rows.filter(r => r.is_active === true)
    }

    if (employee_id) {
      const emp = filteredRows.find((r) => r.employee_id === employee_id)
      if (!emp) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        )
      }
      return NextResponse.json({ data: emp })
    }

    return NextResponse.json({ data: filteredRows })
  } catch (err: any) {
    console.error("GET EMPLOYEES ERROR:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch employees" },
      { status: 500 }
    )
  }
}

/* ================= POST ================= */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body.action || "add"
    
    // FIX: Validate action
    const validActions = ["add", "update", "nonaktif", "bulk_nonaktif", "bulk_delete"]
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be one of: " + validActions.join(", ") },
        { status: 400 }
      )
    }

    const rows = await getAllRows()

    /* ================= ADD ================= */
    if (action === "add") {
      // Validate required fields
      const missingField = validateRequiredFields(body, ["employee_id", "nama_lengkap", "nik_ktp"])
      if (missingField) {
        return NextResponse.json({ error: missingField }, { status: 400 })
      }

      // Check duplicates
      if (rows.some(r => r.employee_id === body.employee_id)) {
        return NextResponse.json(
          { error: "Employee ID sudah ada" },
          { status: 409 } // Conflict
        )
      }

      if (rows.some(r => r.nik_ktp === body.nik_ktp)) {
        return NextResponse.json(
          { error: "NIK sudah terdaftar" },
          { status: 409 }
        )
      }

      const now = new Date().toISOString()
      const values = [[
        body.employee_id,
        body.nama_lengkap,
        body.nik_ktp,
        body.jenis_kelamin || "",
        body.tgl_lahir || "",
        body.tempat_lahir || "",
        body.status_pernikahan || "",
        body.alamat_domisili || "",
        body.email || "",
        body.no_hp || "",
        body.divisi || "",
        body.jabatan || "",
        body.atasan_langsung || "",
        body.lokasi_kerja || "",
        body.status_karyawan ?? "Aktif",
        body.tipe_karyawan ?? "",
        body.tgl_masuk ?? new Date().toISOString().slice(0, 10),
        "TRUE",
        now,
        now,
      ]]

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:T`,
        valueInputOption: "USER_ENTERED", // Better for dates
        requestBody: { values },
      })

      return NextResponse.json({ 
        success: true, 
        message: "Employee added successfully",
        employee_id: body.employee_id 
      })
    }

    /* ================= UPDATE ================= */
    if (action === "update") {
      // Validate employee_id
      if (!body.employee_id) {
        return NextResponse.json(
          { error: "Employee ID wajib diisi" },
          { status: 400 }
        )
      }

      const index = rows.findIndex((r) => r.employee_id === body.employee_id)

      if (index === -1) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        )
      }

      // Check NIK duplicate (excluding current employee)
      if (body.nik_ktp) {
        const nikExists = rows.some(r => 
          r.nik_ktp === body.nik_ktp && r.employee_id !== body.employee_id
        )
        if (nikExists) {
          return NextResponse.json(
            { error: "NIK sudah digunakan karyawan lain" },
            { status: 409 }
          )
        }
      }

      const rowNumber = index + 2
      const existing = rows[index]
      const now = new Date().toISOString()

      // FIX: Use partial update, only update fields that are provided
      const values = [[
        body.nama_lengkap ?? existing.nama_lengkap,
        body.nik_ktp ?? existing.nik_ktp,
        body.jenis_kelamin ?? existing.jenis_kelamin || "",
        body.tgl_lahir ?? existing.tgl_lahir || "",
        body.tempat_lahir ?? existing.tempat_lahir || "",
        body.status_pernikahan ?? existing.status_pernikahan || "",
        body.alamat_domisili ?? existing.alamat_domisili || "",
        body.email ?? existing.email || "",
        body.no_hp ?? existing.no_hp || "",
        body.divisi ?? existing.divisi || "",
        body.jabatan ?? existing.jabatan || "",
        body.atasan_langsung ?? existing.atasan_langsung || "",
        body.lokasi_kerja ?? existing.lokasi_kerja || "",
        body.status_karyawan ?? existing.status_karyawan,
        body.tipe_karyawan ?? existing.tipe_karyawan,
        body.tgl_masuk ?? existing.tgl_masuk,
        existing.is_active ? "TRUE" : "FALSE",
        existing.created_at,
        now,
      ]]

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!B${rowNumber}:T${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      })

      return NextResponse.json({ 
        success: true, 
        message: "Employee updated successfully" 
      })
    }

    /* ================= NONAKTIF ================= */
    if (action === "nonaktif") {
      if (!body.employee_id) {
        return NextResponse.json(
          { error: "Employee ID wajib diisi" },
          { status: 400 }
        )
      }

      const index = rows.findIndex((r) => r.employee_id === body.employee_id)

      if (index === -1) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        )
      }

      const rowNumber = index + 2
      const now = new Date().toISOString()

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!R${rowNumber}:T${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            "FALSE",
            rows[index].created_at,
            now,
          ]],
        },
      })

      return NextResponse.json({ 
        success: true, 
        message: "Employee deactivated successfully" 
      })
    }

    /* ================= BULK NONAKTIF ================= */
    if (action === "bulk_nonaktif") {
      if (!body.employee_ids || !Array.isArray(body.employee_ids) || body.employee_ids.length === 0) {
        return NextResponse.json(
          { error: "employee_ids array wajib diisi" },
          { status: 400 }
        )
      }

      let count = 0
      const now = new Date().toISOString()

      for (let i = 0; i < rows.length; i++) {
        if (body.employee_ids.includes(rows[i].employee_id)) {
          const rowNumber = i + 2
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!R${rowNumber}:T${rowNumber}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [[
                "FALSE",
                rows[i].created_at,
                now,
              ]],
            },
          })
          count++
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: `${count} employees deactivated successfully`,
        total: count 
      })
    }

    /* ================= BULK DELETE (KEEP FEATURE) ================= */
    if (action === "bulk_delete") {
      if (!body.employee_ids || !Array.isArray(body.employee_ids) || body.employee_ids.length === 0) {
        return NextResponse.json(
          { error: "employee_ids array wajib diisi" },
          { status: 400 }
        )
      }

      const remaining = rows.filter(
        (r) => !body.employee_ids.includes(r.employee_id)
      )

      // Clear the sheet
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:T`,
      })

      // Re-append remaining rows
      if (remaining.length > 0) {
        const values = remaining.map((r) => [
          r.employee_id,
          r.nama_lengkap,
          r.nik_ktp,
          r.jenis_kelamin || "",
          r.tgl_lahir || "",
          r.tempat_lahir || "",
          r.status_pernikahan || "",
          r.alamat_domisili || "",
          r.email || "",
          r.no_hp || "",
          r.divisi || "",
          r.jabatan || "",
          r.atasan_langsung || "",
          r.lokasi_kerja || "",
          r.status_karyawan,
          r.tipe_karyawan,
          r.tgl_masuk,
          r.is_active ? "TRUE" : "FALSE",
          r.created_at,
          r.updated_at,
        ])

        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: `${SHEET_NAME}!A2`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values },
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: `${body.employee_ids.length} employees deleted successfully` 
      })
    }

    // This should never happen due to validation at the top
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )

  } catch (err: any) {
    console.error("HR API ERROR:", err)
    
    // Handle specific Google Sheets errors
    if (err.code === 404) {
      return NextResponse.json(
        { error: "Google Sheet not found. Check SHEET_ID" },
        { status: 500 }
      )
    }
    
    if (err.code === 403) {
      return NextResponse.json(
        { error: "Permission denied. Check Google service account access" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: err.message || "HR API error" },
      { status: 500 }
    )
  }
}
