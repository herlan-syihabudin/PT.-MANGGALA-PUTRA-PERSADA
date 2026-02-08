// app/admin/projects/[project_id]/page.tsx
import Link from "next/link"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */
type Customer = {
  customer_id: string
  company_name: string
  customer_type: string
  pic_name: string
  pic_position: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
  status: string
}

type Project = {
  project_id: string
  project_name: string

  // legacy (biar UI lama gak jebol)
  client: string

  // relational (INI YANG DIPAKAI)
  customer_id: string
  customer: Customer | null

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

/* ================= FETCH HELPER ================= */

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

  const scopes = [
    { label: "MEP", value: scopeSafe.mep },
    { label: "Civil", value: scopeSafe.civil },
    { label: "Steel", value: scopeSafe.steel },
    { label: "Interior", value: scopeSafe.interior },
  ]

  const activeScopes = scopes.filter((s) => s.value > 0)
  const divisor = activeScopes.length || scopes.length

  const overallProgress =
    divisor > 0
      ? Math.round(scopes.reduce((sum, s) => sum + s.value, 0) / divisor)
      : 0

  const contractValue = project.nilai_kontrak || 0

  const estimatedUsed =
    contractValue > 0
      ? Math.round((overallProgress / 100) * contractValue)
      : 0

  const remainingBudget =
    contractValue > 0 ? contractValue - estimatedUsed : 0

  const totalPaid = termins
    .filter((t) => t.status.toLowerCase() === "paid")
    .reduce((sum, t) => sum + (t.value || 0), 0)

  /* ================= TIME ================= */

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
          <h1 className="text-xl font-semibold">
            {project.project_name}
          </h1>

          <p className="text-xs text-gray-500">
            {project.project_id} • {project.lokasi}
          </p>

          <p className="text-xs text-gray-400">
            Deadline:{" "}
            {new Date(project.end_date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${healthMap[health][1]}`}
        >
          {healthMap[health][0]} • Ideal {timeProgress}%
        </span>
      </div>

      {/* CUSTOMER DETAIL */}
      {project.customer && (
        <Card>
          <Label>Customer Detail</Label>

          <div className="grid md:grid-cols-2 gap-4 mt-2 text-sm">
            <div>
              <p className="font-medium">
                {project.customer.company_name}
              </p>
              <p className="text-xs text-gray-500">
                {project.customer.customer_type}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">PIC</p>
              <p className="font-medium">
                {project.customer.pic_name} —{" "}
                {project.customer.pic_position}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Kontak</p>
              <p>{project.customer.phone}</p>
              <p className="text-xs">{project.customer.email}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Alamat</p>
              <p className="text-xs leading-relaxed">
                {project.customer.address}
                <br />
                {project.customer.city}, {project.customer.province}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* PROJECT HEALTH MONITOR */}
      <Card>
        <Label>Project Health Monitor</Label>

        {/* MINI GANTT */}
        <ProgressStack time={timeProgress} physical={overallProgress} />

        <p className="text-[11px] text-gray-500 mt-1">
          Waktu {timeProgress}% • Fisik {overallProgress}%
        </p>
      </Card>

      {/* FINANCIAL SNAPSHOT */}
      <div className="grid md:grid-cols-4 gap-4">
        <Info
          label="Nilai Kontrak"
          value={formatIDR(contractValue)}
          highlight
        />
        <Info
          label="Estimasi Terpakai"
          value={formatIDR(estimatedUsed)}
        />
        <Info
          label="Total Terbayar"
          value={formatIDR(totalPaid)}
        />
        <Info
          label="Sisa Anggaran"
          value={formatIDR(remainingBudget)}
        />
      </div>

      {/* KPI DIVISI */}
      <div className="grid md:grid-cols-4 gap-4">
        {scopes.map((s) => (
          <Card key={s.label} center>
            <Label>{s.label}</Label>
            <p className="text-lg font-semibold">{s.value}%</p>
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
              `${t.percent}% • ${formatIDR(t.value)}`,
              <span
                key={`status-${t.termin_no}`}
                className={`px-2 py-0.5 rounded text-[11px] font-medium inline-block ${getTerminStatusBadge(
                  t.status
                )}`}
              >
                {t.status}
              </span>,
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

/* ================= UI COMPONENTS ================= */

function getTerminStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-700"
    case "pending":
      return "bg-amber-100 text-amber-700"
    case "overdue":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

function formatIDR(value: number) {
  if (!value || isNaN(value)) return "Rp 0"
  return `Rp ${value.toLocaleString("id-ID")}`
}

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

/* === MINI GANTT === */
function ProgressStack({
  time,
  physical,
}: {
  time: number
  physical: number
}) {
  const danger = physical < time

  return (
    <div className="relative w-full h-3 bg-gray-200 rounded mt-2">
      <div
        className="absolute h-3 bg-gray-400 rounded"
        style={{ width: `${time}%` }}
      />
      <div
        className={`absolute h-3 rounded ${
          danger ? "bg-red-500" : "bg-green-600"
        }`}
        style={{ width: `${physical}%` }}
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
  rows: React.ReactNode[][]
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
