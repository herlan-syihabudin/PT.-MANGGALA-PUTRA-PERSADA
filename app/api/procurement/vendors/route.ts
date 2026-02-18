import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_PROCUREMENT_ID!
const VENDOR_SHEET = "VENDORS"

type Vendor = {
  vendor_id: string
  vendor_code: string
  vendor_name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  bank_name?: string
  bank_account?: string
  npwp?: string
  status: "ACTIVE" | "INACTIVE"
  created_by?: string
  updated_by?: string
  deleted_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// ================= HELPERS =================

function normalize(str: any): string {
  return String(str || "").trim().toLowerCase()
}

function sanitize(str: any): string | undefined {
  if (!str) return undefined
  return String(str).trim()
}

function isValidEmail(email?: string) {
  if (!email) return true
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// ================= GET ALL =================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const includeDeleted = searchParams.get("include_deleted") === "true"

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${VENDOR_SHEET}!A2:Q`,
    })

    let rows = res.data.values || []

    if (!includeDeleted) {
      rows = rows.filter(r => !r[16])
    }

    const vendors: Vendor[] = rows.map(r => ({
      vendor_id: r[0] || "",
      vendor_code: r[1] || "",
      vendor_name: r[2] || "",
      phone: r[3] || undefined,
      email: r[4] || undefined,
      address: r[5] || undefined,
      city: r[6] || undefined,
      bank_name: r[7] || undefined,
      bank_account: r[8] || undefined,
      npwp: r[9] || undefined,
      status: r[10] === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      created_by: r[11] || undefined,
      updated_by: r[12] || undefined,
      deleted_by: r[13] || undefined,
      created_at: r[14] || "",
      updated_at: r[15] || "",
      deleted_at: r[16] || null,
    }))

    let filtered = vendors

    if (status === "ACTIVE" || status === "INACTIVE") {
      filtered = filtered.filter(v => v.status === status)
    }

    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(v =>
        v.vendor_name?.toLowerCase().includes(s) ||
        v.vendor_code?.toLowerCase().includes(s) ||
        v.email?.toLowerCase().includes(s)
      )
    }

    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      success: true,
      data: filtered,
      error: null,
    })

  } catch (error) {
    console.error("GET VENDORS ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to fetch vendors",
    }, { status: 500 })
  }
}

// ================= CREATE =================

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const vendor_code = sanitize(body.vendor_code)
    const vendor_name = sanitize(body.vendor_name)

    if (!vendor_code) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "vendor_code is required",
      }, { status: 400 })
    }

    if (!vendor_name) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "vendor_name is required",
      }, { status: 400 })
    }

    const email = sanitize(body.email)
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Invalid email format",
      }, { status: 400 })
    }

    // Soft-delete aware duplicate check
    const checkRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${VENDOR_SHEET}!A2:Q`,
    })

    const rows = checkRes.data.values || []
    const exists = rows.some(r =>
      normalize(r[1]) === normalize(vendor_code) && !r[16]
    )

    if (exists) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "vendor_code must be unique",
      }, { status: 400 })
    }

    const allowedStatus = ["ACTIVE", "INACTIVE"]
    const status = allowedStatus.includes(body.status)
      ? body.status
      : "ACTIVE"

    const vendor_id = "VEN-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    const newVendor: Vendor = {
      vendor_id,
      vendor_code,
      vendor_name,
      phone: sanitize(body.phone),
      email,
      address: sanitize(body.address),
      city: sanitize(body.city),
      bank_name: sanitize(body.bank_name),
      bank_account: sanitize(body.bank_account),
      npwp: sanitize(body.npwp),
      status,
      created_by: body.created_by || "SYSTEM",
      updated_by: body.created_by || "SYSTEM",
      created_at: now,
      updated_at: now,
      deleted_at: null,
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${VENDOR_SHEET}!A:Q`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          newVendor.vendor_id,
          newVendor.vendor_code,
          newVendor.vendor_name,
          newVendor.phone || "",
          newVendor.email || "",
          newVendor.address || "",
          newVendor.city || "",
          newVendor.bank_name || "",
          newVendor.bank_account || "",
          newVendor.npwp || "",
          newVendor.status,
          newVendor.created_by,
          newVendor.updated_by,
          "",
          now,
          now,
          "",
        ]]
      }
    })

    return NextResponse.json({
      success: true,
      data: newVendor,
      error: null,
    }, { status: 201 })

  } catch (error) {
    console.error("CREATE VENDOR ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to create vendor",
    }, { status: 500 })
  }
}
