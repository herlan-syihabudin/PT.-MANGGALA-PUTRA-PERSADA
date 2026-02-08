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

/* ==============================
   GET : PROJECT LIST (JOIN CUSTOMER + PROGRESS)
================================ */
export async function GET() {
  try {
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
    const customerMap = Object.fromEntries(
      customerRows.map((r) => [
        r[0], // customer_id
        {
          customer_id: r[0],
          company_name: r[1],
          city: r[9],
          province: r[10],
        },
      ])
    )

    // ===== MAP PROGRESS (by project_id)
    const progressMap = Object.fromEntries(
      progressRows.map((r) => {
        const mep = Number(r[1] || 0)
        const civil = Number(r[2] || 0)
        const steel = Number(r[3] || 0)
        const interior = Number(r[4] || 0)

        const overall =
          (mep + civil + steel + interior) === 0
            ? 0
            : Math.round((mep + civil + steel + interior) / 4)

        return [
          r[0], // project_id
          {
            mep,
            civil,
            steel,
            interior,
            overall,
          },
        ]
      })
    )

    // ===== BUILD RESPONSE PROJECT LIST
    const projects = projectRows.map((r) => {
      const project_id = r[0]
      const customer = customerMap[r[2]]
      const progress = progressMap[project_id]

      return {
        project_id,              // A
        project_name: r[1],      // B
        customer_id: r[2],       // C
        client: customer?.company_name || "-", // join dari CUSTOMERS
        lokasi: r[3],            // D
        nilai_kontrak: Number(r[4] || 0), // E
        start_date: r[5],        // F
        end_date: r[6],          // G
        status: r[7],            // H
        created_at: r[8],        // I
        project_type: (r[9] as "MEP" | "CIVIL" | "STEEL" | "INTERIOR") || null, // J
        // === PROGRESS UNTUK PAGE ===
        progress: progress?.overall ?? 0,
        // Kalau nanti mau dipakai di detail:
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

    // 1) generate ID & timestamp
    const project_id = project_code || `PRJ-${Date.now()}`
    const created_at = new Date().toISOString()

    // 2) simpan ke PROJECT MASTER
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PROJECT_SHEET}!A:J`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id,        // A
          project_name,      // B
          customer_id,       // C
          lokasi || "",      // D
          nilai_kontrak,     // E
          start_date,        // F
          end_date || "",    // G
          status,            // H
          created_at,        // I
          project_type,      // J
        ]],
      },
    })

    // 3) auto-create baris progress (0% semua)
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PROGRESS_SHEET}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id, // project_id
          0,          // mep_progress
          0,          // civil_progress
          0,          // steel_progress
          0,          // interior_progress
          created_at, // updated_at
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
