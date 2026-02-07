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

const SHEET_ID = process.env.GSHEET_PROJECT_ID! // 🔥 SATU ID
const PROJECT_SHEET = "PROJECT MASTER"
const CUSTOMER_SHEET = "CUSTOMERS"
const PROGRESS_SHEET = "PROJECT_SCOPE_PROGRESS"

/* ==============================
   GET : PROJECT LIST (JOIN CUSTOMER)
================================ */
export async function GET() {
  try {
    const [projectRes, customerRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${PROJECT_SHEET}!A:J`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID, // ✅ FIX
        range: `${CUSTOMER_SHEET}!A:P`,
      }),
    ])

    const projectRows = projectRes.data.values?.slice(1) || []
    const customerRows = customerRes.data.values?.slice(1) || []

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

    const projects = projectRows.map((r) => {
      const customer = customerMap[r[2]]

      return {
        project_id: r[0],
        project_name: r[1],
        customer_id: r[2],
        client: customer?.company_name || "-",
        lokasi: r[3],
        nilai_kontrak: Number(r[4] || 0),
        start_date: r[5],
        end_date: r[6],
        status: r[7],
        created_at: r[8],
         project_type: r[9] || null,
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

    // ==============================
    // GENERATE ID & TIME (WAJIB DI ATAS)
    // ==============================
    const project_id = project_code || `PRJ-${Date.now()}`
    const created_at = new Date().toISOString()

    // ==============================
    // INSERT PROJECT MASTER
    // ==============================
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

    // ==============================
    // AUTO CREATE PROJECT PROGRESS
    // ==============================
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PROGRESS_SHEET}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          project_id, // A
          0,          // B mep_progress
          0,          // C civil_progress
          0,          // D steel_progress
          0,          // E interior_progress
          created_at // F updated_at
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
