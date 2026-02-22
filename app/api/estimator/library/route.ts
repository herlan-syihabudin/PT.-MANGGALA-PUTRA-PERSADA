import { NextResponse } from "next/server"

export async function GET() {
  // TODO: ganti dengan query ke DB / Google Sheets lu
  const items = [
    {
      job_id: "JOB-001",
      job_code: "DND-001",
      job_name: "Pasang bata ringan 10cm",
      scope: "Pekerjaan Dinding",
      kategori: "Dinding",
      unit: "m2",
      material_price: 75250,
      labour_price: 20000,
      is_active: true,
    },
    // dst...
  ]

  return NextResponse.json({ data: items })
}
