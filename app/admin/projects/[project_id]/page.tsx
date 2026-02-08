// app/admin/projects/[project_id]/page.tsx
import Link from "next/link"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

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
  note: string
}

/* ================= FETCH HELPERS ================= */

async function fetcher<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

/* ================= PAGE ================= */

export default async function ProjectDetailPage({
  params,
}: {
  params: { project_id: string }
}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const { project_id } = params

  const [project, scope, termins, logs] = await Promise.all([
    fetcher<Project | null>(`${base}/api/projects/${project_id}`, null),
    fetcher<ScopeProgress | null>(
      `${base}/api/projects/${project_id}/progress`,
      null
    ),
    fetcher<Termin[]>(`${base}/api/projects/${project_id}/termin`, []),
    fetcher<ProjectLog[]>(`${base}/api/projects/${project_id}/logs`, []),
  ])

  if (!project) {
    return <div className="p-6 text-sm">Project tidak ditemukan</div>
  }

  /* ================= CORE CALC ================= */

  const scopeSafe: ScopeProgress = scope ?? {
    project_id,
    mep: 0,
    civil: 0,
    steel: 0,
    interior: 0,
    updated_at: null,
  }

  const scopeValues = [
    scopeSafe.mep,
    scopeSafe.civil,
    scopeSafe.steel,
    scopeSafe.interior,
  ]

  const activeCount = scopeValues.filter((v) => v > 0).length || 4

  const overallProgress = Math.round(
    scopeValues.reduce((a, b) => a + b, 0) / activeCount
  )

  const start = new Date(project.start_date)
  const end = new Date(project.end_date)
  const today = new Date()

  const totalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86400000)
  )

  const passedDays = Math.min(
    totalDays,
    Math.max(
      0,
      Math.ceil((today.getTime() - start.getTime()) / 86400000)
    )
  )

  const timeProgress = Math.round((passedDays / totalDays) * 100)

  /* ================= STATUS ================= */

  const autoStatus: "planning" | "running" | "finish" =
    overallProgress === 0
      ? "planning"
      : overallProgress >= 100
      ? "finish"
      : "running"

  const statusClass =
    autoStatus === "running"
      ? "bg-green-100 text-green-700"
      : autoStatus === "planning"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-200 text-gray-700"

  let health: "ontrack" | "risk" | "delay" | "notstarted" = "ontrack"

  if (timeProgress === 0 && overallProgress === 0) {
    health = "notstarted"
  } else {
    const diff = overallProgress - timeProgress
    if (diff >= -5) health = "ontrack"
    else if (diff >= -15) health = "risk"
    else health = "delay"
  }

  const healthMap = {
    ontrack: ["On Track", "bg-emerald-100 text-emerald-700"],
    risk: ["Berisiko Telat", "bg-amber-100 text-amber-700"],
    delay: ["Terlambat", "bg-red-100 text-red-700"],
    notstarted: ["Belum Mulai", "bg-gray-100 text-gray-700"],
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-xl font-semibold">{project.project_name}</h1>
          <p className="text-[11px] text-gray-500">{project.project_id}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded text-xs ${statusClass}`}>
            {autoStatus}
          </span>
          <span
            className={`px-2 py-1 rounded text-[11px] ${healthMap[health][1]}`}
          >
            {healthMap[health][0]} • Ideal {timeProgress}%
          </span>
        </div>
      </div>

      {/* OVERALL SUMMARY */}
      <Card>
        <Label>Overall Progress</Label>
        <ProgressBar value={overallProgress} />
        <p className="text-xs text-gray-500 mt-1">
          Update terakhir: {scopeSafe.updated_at || "-"}
        </p>
      </Card>

      {/* TIMELINE */}
      <Card>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Timeline Proyek</span>
          <span>
            Hari {passedDays} / {totalDays}
          </span>
        </div>
        <ProgressBar
          value={timeProgress}
          danger={timeProgress > overallProgress}
        />
        <p className="text-[11px] text-gray-500">
          Waktu {timeProgress}% • Progress {overallProgress}%
        </p>
      </Card>

      {/* FINANCIAL SNAPSHOT */}
      <div className="grid md:grid-cols-3 gap-4">
        <Info
          label="Nilai Kontrak"
          value={`Rp ${project.nilai_kontrak.toLocaleString("id-ID")}`}
          highlight
        />
        <Info
          label="Estimasi Terpakai"
          value={`Rp ${Math.round(
            (overallProgress / 100) * project.nilai_kontrak
          ).toLocaleString("id-ID")}`}
        />
        <Info
          label="Sisa Anggaran"
          value={`Rp ${Math.round(
            project.nilai_kontrak -
              (overallProgress / 100) * project.nilai_kontrak
          ).toLocaleString("id-ID")}`}
        />
      </div>

      {/* KPI DIVISI */}
      <div className="grid md:grid-cols-4 gap-4">
        {["MEP", "Civil", "Steel", "Interior"].map((label, i) => (
          <Card key={label} center>
            <Label>{label}</Label>
            <p className="text-lg font-semibold">{scopeValues[i]}%</p>
          </Card>
        ))}
      </div>

      {/* TERMIN */}
      <Section title="Termin Kontrak">
        {termins.length === 0 ? (
          <Empty />
        ) : (
          <SimpleTable
            headers={[
              "Termin",
              "Deskripsi",
              "% / Nilai",
              "Status",
              "Jatuh Tempo",
              "Dibayar",
            ]}
            rows={termins.map((t) => [
              t.termin_no,
              t.description,
              `${t.percent}% • Rp ${t.value.toLocaleString("id-ID")}`,
              t.status,
              t.due_date || "-",
              t.paid_date || "-",
            ])}
          />
        )}
      </Section>

      {/* LOGS */}
      <Section title="Activity Log" meta={`${logs.length} aktivitas`}>
        {logs.length === 0 ? (
          <Empty />
        ) : (
          <SimpleTable
            headers={["Tanggal", "Kategori", "Aktivitas", "PIC"]}
            rows={logs.map((l) => [
              l.log_date,
              l.category,
              l.activity,
              l.created_by,
            ])}
          />
        )}
      </Section>

      {/* ACTION */}
      <div className="flex gap-3">
        <Action href="contract" label="Kontrak" color="blue" />
        <Action href="rab" label="RAB" color="gray" />
        <Action href="progress" label="Progress" color="green" />
      </div>
    </div>
  )
}

/* ================= UI HELPERS ================= */

function Card({
  children,
  center,
}: {
  children: React.ReactNode
  center?: boolean
}) {
  return (
    <div
      className={`border rounded-lg p-4 bg-white ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-wide text-gray-500">
      {children}
    </p>
  )
}

function ProgressBar({
  value,
  danger,
}: {
  value: number
  danger?: boolean
}) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded overflow-hidden mt-2">
      <div
        className={`h-2 ${danger ? "bg-red-500" : "bg-green-600"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

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
    <Card>
      <Label>{label}</Label>
      <p className={`mt-1 ${highlight ? "text-red-600 font-semibold" : ""}`}>
        {value}
      </p>
    </Card>
  )
}

function Section({
  title,
  meta,
  children,
}: {
  title: string
  meta?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <div className="flex justify-between mb-2">
        <p className="text-sm font-semibold">{title}</p>
        {meta && <p className="text-[11px] text-gray-500">{meta}</p>}
      </div>
      {children}
    </Card>
  )
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | number)[][]
}) {
  return (
    <table className="w-full text-xs">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((h) => (
            <th key={h} className="p-2 text-left">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t">
            {r.map((c, j) => (
              <td key={j} className="p-2">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Empty() {
  return <p className="text-xs text-gray-500">Belum ada data.</p>
}

function Action({
  href,
  label,
  color,
}: {
  href: string
  label: string
  color: "blue" | "gray" | "green"
}) {
  const map = {
    blue: "bg-blue-600",
    gray: "bg-gray-800",
    green: "bg-green-600",
  }

  return (
    <Link
      href={href}
      className={`px-4 py-2 text-white text-xs rounded ${map[color]}`}
    >
      {label}
    </Link>
  )
}
