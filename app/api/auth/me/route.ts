import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    id: "admin-001",
    name: "Admin",
    role: "owner",
  })
}
