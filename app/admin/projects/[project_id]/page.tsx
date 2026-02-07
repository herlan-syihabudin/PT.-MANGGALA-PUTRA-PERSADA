// app/admin/projects/[project_id]/page.tsx
import Link from "next/link"

export const dynamic = "force-dynamic"

type Project = {
  project_id: string
  project_name: string
  client: string
  lokasi: string
  nilai_kontrak: number
  start_date: string
  end_date: string
  status: string
  created_at: string
}

async function getProject(project_id: string): Promise<Project | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${project_id}`,
      { cache: "no-store" }
    )

    if (!res.ok) return null
    return (await res.json()) as Project
  } catch (e) {
    console.error(e)
    return null
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { project_id: string }
}) {
  const project = await getProject(params.project_id)

  if (!project) {
    return <div className="p-6">Project tidak ditemukan</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{project.project_name}</h1>
          <p className="text-gray-500">{project.project_id}</p>
        </div>

        <span
          className={`px-3 py-1 rounded text-sm capitalize ${
            project.status === "running"
              ? "bg-green-100 text-green-700"
              : project.status === "planning"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {project.status}
        </span>
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <p className="text-xs text-gray-500">Client</p>
          <p className="font-medium">{project.client}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-xs text-gray-500">Lokasi</p>
          <p className="font-medium">{project.lokasi}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-xs text-gray-500">Nilai Kontrak</p>
          <p className="font-bold text-red-600">
            Rp {project.nilai_kontrak.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="border rounded p-4">
        <p className="font-semibold mb-2">Timeline</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Mulai</p>
            <p>{project.start_date}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Selesai</p>
            <p>{project.end_date || "-"}</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTION */}
      <div className="flex gap-3">
        <Link
          href={`/admin/projects/${project.project_id}/contract`}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Kontrak
        </Link>
        <Link
          href={`/admin/projects/${project.project_id}/rab`}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          RAB
        </Link>
        <Link
          href={`/admin/projects/${project.project_id}/progress`}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Progress
        </Link>
      </div>
    </div>
  )
}
