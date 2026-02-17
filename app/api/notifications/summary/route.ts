import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dummy data dulu (nanti bisa connect ke DB / Google Sheet)
    const data = {
      unread: 3,
      items: [
        {
          id: "notif-1",
          title: "Inquiry Baru Masuk",
          message: "Project Gudang Bekasi",
          type: "crm",
          created_at: new Date().toISOString(),
        },
        {
          id: "notif-2",
          title: "RAB Selesai",
          message: "RAB Project Office Jakarta",
          type: "estimator",
          created_at: new Date().toISOString(),
        },
        {
          id: "notif-3",
          title: "Approval HR Pending",
          message: "Karyawan Baru Menunggu Approval",
          type: "hr",
          created_at: new Date().toISOString(),
        },
      ],
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    )
  }
}
