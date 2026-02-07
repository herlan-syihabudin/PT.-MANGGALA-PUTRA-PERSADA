import Link from "next/link"

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

/* ==============================
   FETCH PROJECT LIST (SERVER)
================================ */
async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      console.error("Failed fetch projects", res.status)
      return []
    }

    return (await res.json()) as Project[]
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

/* ==============================
   PAGE
================================ */
export default async function ProjectListPage() {
  const projects = await getProjects()

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Project List</h1>

        <Link
          href="/admin/projects/create"
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + Create Project
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Project</th>
              <th className="p-3">Client</th>
              <th className="p-3">Lokasi</th>
              <th className="p-3">Nilai Kontrak</th>
              <th className="p-3">Mulai</th>
              <th className="p-3">Selesai</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-gray-500"
                >
                  Belum ada project
                </td>
              </tr>
            )}

            {projects.map((p) => (
              <tr key={p.project_id} className="border-t">
                <td className="p-3 font-medium">{p.project_name}</td>
                <td className="p-3">{p.client}</td>
                <td className="p-3">{p.lokasi || "-"}</td>
                <td className="p-3">
                  {p.nilai_kontrak
                    ? `Rp ${p.nilai_kontrak.toLocaleString("id-ID")}`
                    : "-"}
                </td>
                <td className="p-3">{p.start_date || "-"}</td>
                <td className="p-3">{p.end_date || "-"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${
                      p.status === "running"
                        ? "bg-green-100 text-green-700"
                        : p.status === "planning"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
