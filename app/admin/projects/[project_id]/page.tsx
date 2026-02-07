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

type ScopeProgress = {
  project_id: string
  mep: number
  civil: number
  steel: number
  interior: number
  updated_at: string | null
}

type Termin = {
  project_id: string
  termin_no: number
  description: string
  percent: number
  value: number
  status: string
  due_date: string
  paid_date: string
}

type ProjectLog = {
  project_id: string
  log_date: string
  category: string
  activity: string
  created_by: string
  created_at: string
  note: string
}

/* ==============================
   FETCH HELPERS
================================ */
async function getProject(project_id: string): Promise<Project | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${project_id}`,
      { cache: "no-store" }
    )
    if (!res.ok) return null
    return (await res.json()) as Project
  } catch {
    return null
  }
}

async function getScopeProgress(
  project_id: string
): Promise<ScopeProgress | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${project_id}/progress`,
      { cache: "no-store" }
    )
    if (!res.ok) return null
    return (await res.json()) as ScopeProgress
  } catch {
    return null
  }
}

async function getTermins(project_id: string): Promise<Termin[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${project_id}/termin`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    return (await res.json()) as Termin[]
  } catch {
    return []
  }
}

async function getLogs(project_id: string): Promise<ProjectLog[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${project_id}/logs`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    return (await res.json()) as ProjectLog[]
  } catch {
    return []
  }
}

/* ==============================
   PAGE
================================ */
export default async function ProjectDetailPage({
  params,
}: {
  params: { project_id: string }
}) {
  const { project_id } = params

  const [project, scope, termins, logs] = await Promise.all([
    getProject(project_id),
    getScopeProgress(project_id),
    getTermins(project_id),
    getLogs(project_id),
  ])

  if (!project) {
    return <div className="p-6 text-sm">Project tidak ditemukan</div>
  }

  const scopeSafe: ScopeProgress = scope || {
    project_id,
    mep: 0,
    civil: 0,
    steel: 0,
    interior: 0,
    updated_at: null,
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {project.project_name}
          </h1>
          <p className="text-[11px] text-gray-500 mt-1">
            {project.project_id}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded text-xs capitalize ${
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

      {/* KPI DIVISI */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "MEP", value: scopeSafe.mep },
          { label: "Civil", value: scopeSafe.civil },
          { label: "Steel", value: scopeSafe.steel },
          { label: "Interior", value: scopeSafe.interior },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="border rounded-lg p-4 text-center bg-white"
          >
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              {kpi.label}
            </p>
            <p className="text-lg font-semibold mt-1">
              {kpi.value}%
            </p>
          </div>
        ))}
      </div>

      {/* OVERVIEW */}
      <div className="grid md:grid-cols-3 gap-4">
        <Info label="Customer" value={project.client} />
        <Info label="Lokasi" value={project.lokasi || "-"} />
        <Info
          label="Nilai Kontrak"
          value={`Rp ${project.nilai_kontrak.toLocaleString("id-ID")}`}
          highlight
        />
      </div>

      {/* TIMELINE */}
      <div className="border rounded-lg p-4 bg-white">
        <p className="text-sm font-semibold mb-3">Timeline</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[11px] text-gray-500">Mulai</p>
            <p>{project.start_date}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Selesai</p>
            <p>{project.end_date || "-"}</p>
          </div>
        </div>
      </div>

      {/* TERMIN KONTRAK */}
      <div className="border rounded-lg p-4 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Termin Kontrak</p>
        </div>

        {termins.length === 0 ? (
          <p className="text-xs text-gray-500">
            Belum ada data termin.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-2">Termin</th>
                  <th className="p-2">Deskripsi</th>
                  <th className="p-2">% / Nilai</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Jatuh Tempo</th>
                  <th className="p-2">Dibayar</th>
                </tr>
              </thead>
              <tbody>
                {termins.map((t) => (
                  <tr key={t.termin_no} className="border-t">
                    <td className="p-2 font-medium">
                      {t.termin_no}
                    </td>
                    <td className="p-2">{t.description}</td>
                    <td className="p-2">
                      {t.percent}% <br />
                      <span className="text-[11px] text-gray-500">
                        Rp {t.value.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-[10px] ${
                          t.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : t.status === "Invoiced"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-2">{t.due_date || "-"}</td>
                    <td className="p-2">{t.paid_date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACTIVITY LOG */}
      <div className="border rounded-lg p-4 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Activity Log</p>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-gray-500">
            Belum ada aktivitas yang dicatat.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-2">Tanggal</th>
                  <th className="p-2">Kategori</th>
                  <th className="p-2">Aktivitas</th>
                  <th className="p-2">PIC</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{log.log_date}</td>
                    <td className="p-2">{log.category}</td>
                    <td className="p-2">
                      {log.activity}
                      {log.note && (
                        <span className="block text-[11px] text-gray-500">
                          {log.note}
                        </span>
                      )}
                    </td>
                    <td className="p-2">{log.created_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK ACTION */}
      <div className="flex gap-3 pt-2">
        <Link
          href={`/admin/projects/${project.project_id}/contract`}
          className="px-4 py-2 bg-blue-600 text-white rounded text-xs"
        >
          Kontrak
        </Link>
        <Link
          href={`/admin/projects/${project.project_id}/rab`}
          className="px-4 py-2 bg-gray-800 text-white rounded text-xs"
        >
          RAB
        </Link>
        <Link
          href={`/admin/projects/${project.project_id}/progress`}
          className="px-4 py-2 bg-green-600 text-white rounded text-xs"
        >
          Progress
        </Link>
      </div>
    </div>
  )
}

/* ==============================
   SMALL INFO CARD
================================ */
function Info({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p
        className={`mt-1 text-sm ${
          highlight ? "text-red-600 font-semibold" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
