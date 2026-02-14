import { NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = "force-dynamic"

/* ==============================
   GOOGLE AUTH
================================ */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })

// 🔥 SATU SHEET ID UNTUK SEMUA
const SHEET_ID = process.env.GSHEET_PROJECT_ID!

const PROJECT_SHEET = "PROJECT MASTER"
const CUSTOMER_SHEET = "CUSTOMERS"
const PROGRESS_SHEET = "PROJECT_SCOPE_PROGRESS"

const normalize = (val: any) => String(val || "").trim()
const toNumber = (val: any) =>
  Number(String(val || "0").replace(/[^\d]/g, "")) || 0

/* ==============================
   GET : PROJECT LIST (JOIN CUSTOMER + PROGRESS)
   ✅ SUPPORT ?customer_id=
================================ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const filterCustomerId = normalize(searchParams.get("customer_id"))

    const [projectRes, customerRes, progressRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${PROJECT_SHEET}!A:J`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${CUSTOMER_SHEET}!A:P`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${PROGRESS_SHEET}!A:F`,
      }),
    ])

    const projectRows = projectRes.data.values?.slice(1) || []
    const customerRows = customerRes.data.values?.slice(1) || []
    const progressRows = progressRes.data.values?.slice(1) || []

    // ===== MAP CUSTOMER (by customer_id)
    const customerMap: Record<string, any> = Object.fromEntries(
      customerRows
        .filter((r) => r?.[0])
        .map((r) => [
          normalize(r[0]), // customer_id
          {
            customer_id: normalize(r[0]),
            company_name: r[1],
            city: r[9],
            province: r[10],
          },
        ])
    )

    // ===== MAP PROGRESS (by project_id)
    const progressMap: Record<string, any> = Object.fromEntries(
      progressRows
        .filter((r) => r?.[0])
        .map((r) => {
          const mep = toNumber(r[1])
          const civil = toNumber(r[2])
          const steel = toNumber(r[3])
          const interior = toNumber(r[4])

          const overall =
            mep + civil + steel + interior === 0
              ? 0
              : Math.round((mep + civil + steel + interior) / 4)

          return [
            normalize(r[0]), // project_id
            { mep, civil, steel, interior, overall },
          ]
        })
    )

    // ✅ FILTER BY customer_id (kalau param ada)
    const filteredProjectRows = projectRows.filter((r) => {
      if (!filterCustomerId) return true
      return normalize(r[2]) === filterCustomerId // C = customer_id
    })

    // ===== BUILD RESPONSE PROJECT LIST
    const projects = filteredProjectRows.map((r) => {
      const project_id = normalize(r[0])
      const customer_id = normalize(r[2])

      const customer = customerMap[customer_id]
      const progress = progressMap[project_id]

      return {
        project_id,                 // A
        project_name: r[1] || "",   // B
        customer_id,                // C
        client: customer?.company_name || "-", // join dari CUSTOMERS
        lokasi: r[3] || "",         // D
        nilai_kontrak: toNumber(r[4]), // E
        start_date: r[5] || "",     // F
        end_date: r[6] || "",       // G
        status: r[7] || "",         // H
        created_at: r[8] || "",     // I
        project_type: (r[9] as "MEP" | "CIVIL" | "STEEL" | "INTERIOR") || null, // J

        progress: progress?.overall ?? 0,
        mep_progress: progress?.mep ?? 0,
        civil_progress: progress?.civil ?? 0,
        steel_progress: progress?.steel ?? 0,
        interior_progress: progress?.interior ?? 0,
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("GET PROJECT ERROR:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data project" },
      { status: 500 }
    )
  }
}

/* ==============================
   POST : CREATE PROJECT
================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      project_code,
      project_name,
      customer_id,
      project_type,
      lokasi,
      nilai_kontrak,
      start_date,
      end_date,
      status,
    } = body

    if (
      !project_name ||
      !customer_id ||
      !project_type ||
      !nilai_kontrak ||
      !start_date ||
      !status
    ) {
      return NextResponse.json(
        { message: "Field wajib belum lengkap" },
        { status: 400 }
      )
    }

    const project_id = project_code || `PRJ-${Date.now()}`
    const created_at = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PROJECT_SHEET}!A:J`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id,
          project_name,
          customer_id,
          lokasi || "",
          nilai_kontrak,
          start_date,
          end_date || "",
          status,
          created_at,
          project_type,
        ]],
      },
    })

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PROGRESS_SHEET}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id,
          0,
          0,
          0,
          0,
          created_at,
        ]],
      },
    })

    return NextResponse.json(
      { project_id, message: "Project berhasil dibuat" },
      { status: 201 }
    )
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error)
    return NextResponse.json(
      { message: "Gagal menyimpan project" },
      { status: 500 }
    )
  }
}
