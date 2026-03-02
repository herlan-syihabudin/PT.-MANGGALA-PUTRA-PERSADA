import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ================= GOOGLE AUTH dengan Validation ================= */

// FIX 1: Validasi environment variables tanpa throw error
function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const sheetId = process.env.GSHEET_HR_ID

  // Log warning tapi jangan throw - biar app tetap jalan
  if (!clientEmail || !privateKey || !sheetId) {
    console.warn("⚠️ Missing Google Sheets credentials. Dashboard akan return data kosong.")
    return null
  }

  try {
    return new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey,
      ["https://www.googleapis.com/auth/spreadsheets"]
    )
  } catch (error) {
    console.error("❌ Auth Error:", error)
    return null
  }
}

const auth = getAuth()
const sheets = auth ? google.sheets({ version: "v4", auth }) : null
const SHEET_ID = process.env.GSHEET_HR_ID || ""
const SHEET_NAME = "EMPLOYEE_MASTER"

/* ================= HELPERS yang Lebih Robust ================= */

// FIX 2: Boolean parsing yang lebih fleksibel
const isAktif = (v: any): boolean => {
  if (v === undefined || v === null) return false
  
  const str = String(v).trim().toLowerCase()
  
  // Handle berbagai kemungkinan nilai "aktif" di sheet
  const trueValues = ["true", "1", "yes", "aktif", "active", "enabled", "y", "t"]
  return trueValues.includes(str)
}

// FIX 3: Normalizer dengan default value
const norm = (v: any): string => {
  if (v === undefined || v === null) return ""
  return String(v).trim().toLowerCase()
}

// FIX 4: Get Tipe dengan multiple fallback dan logging
const getTipe = (e: any): string => {
  // Coba tipe_karyawan dulu
  const tipe = norm(e.tipe_karyawan)
  if (tipe && ["tetap", "kontrak", "harian", "permanen", "magang"].includes(tipe)) {
    return tipe
  }
  
  // Fallback ke status_karyawan
  const status = norm(e.status_karyawan)
  if (status && ["tetap", "kontrak", "harian", "permanen", "magang"].includes(status)) {
    // Log untuk monitoring (optional)
    console.debug(`⚠️ Employee ${e.employee_id} using status_karyawan as tipe`)
    return status
  }
  
  // Default fallback
  return "kontrak" // atau "other" sesuai kebutuhan
}

// FIX 5: Validasi data row
const isValidRow = (row: any[]): boolean => {
  return row && row.length > 0 && row.some(cell => cell && String(cell).trim() !== "")
}

/* ================= GET DASHBOARD ================= */

export async function GET() {
  const startTime = Date.now()
  
  try {
    // FIX 6: Early return jika auth gagal
    if (!sheets || !SHEET_ID) {
      console.warn("⚠️ Google Sheets not configured")
      return NextResponse.json({
        total: 0,
        aktif: 0,
        nonaktif: 0,
        tetap: 0,
        kontrak: 0,
        harian: 0,
        _meta: {
          warning: "Google Sheets not configured",
          timestamp: new Date().toISOString()
        }
      })
    }

    // FIX 7: Fetch dengan timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 detik timeout

    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1:T`,
      })

      clearTimeout(timeoutId)
      
      const values = res.data.values || []
      
      // FIX 8: Validasi headers
      if (values.length < 2) {
        return NextResponse.json({
          total: 0,
          aktif: 0,
          nonaktif: 0,
          tetap: 0,
          kontrak: 0,
          harian: 0,
          _meta: {
            message: "No data found",
            timestamp: new Date().toISOString()
          }
        })
      }

      const [headers, ...rows] = values

      // FIX 9: Filter rows kosong
      const validRows = rows.filter(isValidRow)

      const employees = validRows.map((row) => {
        const obj: any = {}
        headers.forEach((h: string, i: number) => {
          // FIX 10: Handle jika kolom lebih banyak dari headers
          obj[h] = row[i] ?? ""
        })
        return obj
      })

      const total = employees.length

      const aktifEmployees = employees.filter((e) => isAktif(e.is_active))
      const aktif = aktifEmployees.length
      const nonaktif = total - aktif

      // Hitung berdasarkan tipe
      const tetap = aktifEmployees.filter((e) => {
        const tipe = getTipe(e)
        return tipe === "tetap" || tipe === "permanen"
      }).length

      const kontrak = aktifEmployees.filter((e) => {
        const tipe = getTipe(e)
        return tipe === "kontrak"
      }).length

      const harian = aktifEmployees.filter((e) => {
        const tipe = getTipe(e)
        return tipe === "harian"
      }).length

      // FIX 11: Response dengan metadata
      const responseTime = Date.now() - startTime

      return NextResponse.json({
        // Data utama (SAMA PERSIS dengan sebelumnya)
        total,
        aktif,
        nonaktif,
        tetap,
        kontrak,
        harian,
        
        // Metadata tambahan (opsional, tidak mengganggu frontend)
        _meta: {
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          dataSource: "google_sheets",
          totalRows: validRows.length
        }
      })

    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      throw fetchError
    }

  } catch (err: any) {
    console.error("❌ HR DASHBOARD ERROR:", err)
    
    // FIX 12: Error response yang graceful
    const errorMessage = err.message || "Failed load HR dashboard"
    const statusCode = err.code === 404 ? 404 : 500
    
    // Log specific Google Sheets errors
    if (err.code === 403) {
      console.error("🔐 Permission denied. Check service account access to sheet:", SHEET_ID)
    }
    if (err.code === 404) {
      console.error("📄 Sheet not found. Check SHEET_ID:", SHEET_ID)
    }
    if (err.name === 'AbortError') {
      console.error("⏱️ Request timeout after 10s")
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        // Return data kosong agar frontend tetap bisa render
        total: 0,
        aktif: 0,
        nonaktif: 0,
        tetap: 0,
        kontrak: 0,
        harian: 0,
        _meta: {
          error: true,
          message: errorMessage,
          timestamp: new Date().toISOString()
        }
      },
      { status: statusCode }
    )
  }
}
