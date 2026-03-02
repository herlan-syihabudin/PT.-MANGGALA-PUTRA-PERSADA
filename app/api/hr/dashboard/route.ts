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

const SHEET_ID = process.env.GSHEET_HR_ID!
const SHEET_NAME = "EMPLOYEE_MASTER"

/* ================= HELPERS ================= */

const isAktif = (v: any) => String(v).trim().toLowerCase() === "true"
const norm = (v: any) => String(v || "").trim().toLowerCase()

/* pakai tipe_karyawan, kalau kosong fallback ke status_karyawan */
const getTipe = (e: any) => {
  const tipe = norm(e.tipe_karyawan)
  if (tipe) return tipe
  return norm(e.status_karyawan)
}

/* ================= GET DASHBOARD ================= */

export async function GET() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:T`,
    })

    const [headers, ...rows] = res.data.values || []

    const employees = rows.map((row) => {
      const obj: any = {}
      headers.forEach((h: string, i: number) => {
        obj[h] = row[i] ?? ""
      })
      return obj
    })

    const total = employees.length

    const aktifEmployees = employees.filter((e) => isAktif(e.is_active))
    const aktif = aktifEmployees.length
    const nonaktif = total - aktif

    // ⬇️ sekarang pakai getTipe (tipe_karyawan || status_karyawan)
    const tetap = aktifEmployees.filter(
      (e) => getTipe(e) === "tetap"
    ).length

    const kontrak = aktifEmployees.filter(
      (e) => getTipe(e) === "kontrak"
    ).length

    const harian = aktifEmployees.filter(
      (e) => getTipe(e) === "harian"
    ).length

    return NextResponse.json({
      total,
      aktif,
      nonaktif,
      tetap,
      kontrak,
      harian,
    })
  } catch (err) {
    console.error("HR DASHBOARD ERROR:", err)
    return NextResponse.json(
      { error: "Failed load HR dashboard" },
      { status: 500 }
    )
  }
}
