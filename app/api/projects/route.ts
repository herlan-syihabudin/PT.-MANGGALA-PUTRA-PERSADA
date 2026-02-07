import { NextResponse } from "next/server"

// sementara pakai in-memory / bisa ganti DB nanti TANPA ubah form
const PROJECTS: any[] = []

export async function POST(req: Request) {
  const body = await req.json()

  const {
    project_name,
    client,
    lokasi,
    nilai_kontrak,
    start_date,
    end_date,
    status,
  } = body

  if (!project_name || !client || !nilai_kontrak || !start_date || !status) {
    return NextResponse.json(
      { message: "Field wajib belum lengkap" },
      { status: 400 }
    )
  }

  const project = {
    project_id: `PRJ-${Date.now()}`,
    project_name,
    client,
    lokasi,
    nilai_kontrak: Number(nilai_kontrak),
    start_date,
    end_date,
    status,
    created_at: new Date().toISOString(),
  }

  PROJECTS.push(project)

  return NextResponse.json(project, { status: 201 })
}
