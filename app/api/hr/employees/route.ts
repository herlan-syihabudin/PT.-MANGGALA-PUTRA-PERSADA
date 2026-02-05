import { NextRequest, NextResponse } from "next/server"

const SCRIPT_URL = process.env.HR_SCRIPT_URL!
const API_TOKEN = process.env.HR_API_TOKEN!

/* ======================================================
   GET : LIST & DETAIL KARYAWAN
====================================================== */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employee_id = searchParams.get("employee_id")

    let url = ""

    if (employee_id) {
      // DETAIL KARYAWAN
      url = `${SCRIPT_URL}?action=employee_detail&employee_id=${employee_id}&token=${API_TOKEN}`
    } else {
      // LIST KARYAWAN
      url = `${SCRIPT_URL}?action=employees&token=${API_TOKEN}`
    }

    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()

    return NextResponse.json(data)
  } catch (err) {
    console.error("HR GET ERROR:", err)
    return NextResponse.json(
      { error: "Failed to fetch employee data" },
      { status: 500 }
    )
  }
}

/* ======================================================
   POST : ADD / UPDATE / NONAKTIF / BULK NONAKTIF
====================================================== */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body.action || "add"

    /* ================= VALIDATION ================= */

    // aksi yg butuh employee_id tunggal
    const needEmployeeId = ["update", "nonaktif", "aktif"]

    if (needEmployeeId.includes(action) && !body.employee_id) {
      return NextResponse.json(
        { error: "employee_id wajib diisi" },
        { status: 400 }
      )
    }

    // BULK NONAKTIF
    if (action === "bulk_nonaktif") {
      if (
        !Array.isArray(body.employee_ids) ||
        body.employee_ids.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "employee_ids wajib berupa array dan tidak boleh kosong",
          },
          { status: 400 }
        )
      }
    }

    /* ============================================= */

    const res = await fetch(
      `${SCRIPT_URL}?action=${action}&token=${API_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )

    const data = await res.json()

    if (!res.ok || data?.error) {
      return NextResponse.json(
        { error: data?.error || "HR API error" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      action,
      data,
    })
  } catch (err) {
    console.error("HR POST ERROR:", err)
    return NextResponse.json(
      { error: "Failed to process HR request" },
      { status: 500 }
    )
  }
}
