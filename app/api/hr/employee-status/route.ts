import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

/* ================= GOOGLE AUTH ================= */
// Menggunakan service account yang lo kasih: mpp-erp-bot@mpp-erp.iam.gserviceaccount.com
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL, // Pakai env yang lo set di Vercel
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

// Spreadsheet ID dari URL yang lo kasih
const SHEET_ID = "1VtjabgrQ4uQx90pae6vdq0ueC_bmO6dqwjrDOSG9M_o";
const SHEET_NAME = "EMPLOYMENT_STATUS";

/* ================= GET ================= */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employee_id = searchParams.get("employee_id");

    if (!employee_id) {
      return NextResponse.json({ error: "employee_id required" }, { status: 400 });
    }

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:J`,
    });

    const [headers, ...rows] = res.data.values || [];

    // Ambil history status untuk ID tertentu
    const data = rows
      .filter((r) => r[0] === employee_id)
      .map((r) => {
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = r[i] ?? "";
        });
        return obj;
      });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("GET ERROR:", err.message);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employee_id,
      status,
      jenis_status,
      lokasi_kerja,
      start_date,
      updated_by,
      keterangan,
    } = body;

    if (!employee_id || !status || !jenis_status || !start_date) {
      return NextResponse.json({ error: "Data belum lengkap" }, { status: 400 });
    }

    // 1. Tarik data existing untuk proses "Close" status lama
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:J`,
    });

    const values = res.data.values || [];
    let updatedValues = [...values];
    let hasChanged = false;

    // 2. Cari baris yang is_current-nya "TRUE" untuk ID ini, lalu set ke "FALSE"
    for (let i = 1; i < updatedValues.length; i++) {
      const row = updatedValues[i];
      if (row[0] === employee_id && String(row[6]).toUpperCase() === "TRUE") {
        row[5] = start_date; // End date status lama adalah start date status baru
        row[6] = "FALSE";    // Nonaktifkan
        hasChanged = true;
      }
    }

    // 3. Jika ada perubahan (menutup status lama), update sheet-nya dulu
    if (hasChanged) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: updatedValues },
      });
    }

    // 4. Append baris status baru (is_current = TRUE)
    const newRow = [
      employee_id,
      status,
      jenis_status,
      lokasi_kerja || "",
      start_date,
      "",        // end_date (masih kosong karena baru mulai)
      "TRUE",    // is_current
      new Date().toLocaleString("id-ID"), // created_at
      updated_by || "system",
      keterangan || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newRow] },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST ERROR:", err.message);
    return NextResponse.json({ error: "Failed to save status" }, { status: 500 });
  }
}
