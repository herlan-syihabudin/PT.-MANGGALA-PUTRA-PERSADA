import { NextResponse } from "next/server"

export async function GET() {
  // Dummy data dulu
  const data = [
    {
      boq_id: "BOQ-001",
      project_id: "PRJ-001",
      project_name: "Gudang Bekasi",
      customer_name: "PT Sejahtera Abadi",
      status: "DRAFT",
      total_items: 12,
      created_at: new Date().toISOString(),
    },
    {
      boq_id: "BOQ-002",
      project_id: "PRJ-002",
      project_name: "Workshop Karawang",
      customer_name: "PT Maju Jaya",
      status: "LOCKED",
      total_items: 25,
      created_at: new Date().toISOString(),
    },
  ]

  return NextResponse.json(data)
}
