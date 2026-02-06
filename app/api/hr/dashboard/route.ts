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

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SHEET_NAME = "EMPLOYEE_MASTER"

/* ================= HELPERS ================= */

const isAktif = (v: any) =>
  String(v).trim().toLowerCase() === "true"

const norm = (v: any) =>
  String(v || "").trim().toLowerCase()

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

    const aktifEmployees = employees.filter((e) =>
      isAktif(e.is_active)
    )

    const aktif = aktifEmployees.length
    const nonaktif = total - aktif

    const tetap = aktifEmployees.filter(
      (e) => norm(e.tipe_karyawan) === "tetap"
    ).length

    const kontrak = aktifEmployees.filter(
      (e) => norm(e.tipe_karyawan) === "kontrak"
    ).length

    const harian = aktifEmployees.filter(
      (e) => norm(e.tipe_karyawan) === "harian"
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
