// app/admin/projects/[project_id]/page.tsx
import Link from "next/link"
import { Metadata } from "next"
import SCurveChart from "@/components/dashboard/charts/SCurveChart"
import {
  Building2,
  MapPin,
  Calendar,
  FileText,
  Edit,
  AlertCircle,
  AlertTriangle,
  DollarSign,
  BarChart3,
} from "lucide-react"

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
  client: string
  customer_id: string
  customer: Customer | null
  lokasi: string
  nilai_kontrak: number
  start_date: string
  end_date: string
  status: string
  created_at: string
  project_type: string
}

type ScopeProgress = {
  project_id: string
  mep_progress: number      // ← Sesuai sheet
  civil_progress: number    // ← Sesuai sheet
  steel_progress: number    // ← Sesuai sheet
  interior_progress: number // ← Sesuai sheet
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

type MonthlyProgress = {
  month: string
  target: number
  actual: number
}

/* ================= METADATA ================= */
export async function generateMetadata({ params }: { params: { project_id: string } }): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ""
  const project = await fetcher<any>(`${base}/api/projects/${params.project_id}`, null)

  return {
    title: `${project?.project_name || "Project"} | MPP ERP`,
    description: `Detail project ${project?.project_name || ""}`,
  }
}

/* ================= FETCH HELPER ================= */
async function fetcher<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { 
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    })
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

/* ================= HELPER FUNCTIONS ================= */
function formatIDR(value: number) {
  if (!value || isNaN(value)) return "Rp 0"
  return `Rp ${value.toLocaleString("id-ID")}`
}

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

// ===== GENERATE S-CURVE DATA =====
function generateSCurveData(
  startDate: string,
  endDate: string,
  timeProgress: number,
  physicalProgress: number
): MonthlyProgress[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalMonths = Math.max(3, Math.ceil((end.getTime() - start.getTime()) / (30 * 86400000)))
  
  const data: MonthlyProgress[] = []
  
  for (let i = 0; i <= totalMonths; i++) {
    const monthDate = new Date(start)
    monthDate.setMonth(monthDate.getMonth() + i)
    
    // Ideal S-Curve: slow start, fast middle, slow end
    const x = i / totalMonths
    const target = Math.round(100 * (1 / (1 + Math.exp(-10 * (x - 0.5)))))
    
    // Actual progress based on current physical progress
    let actual = 0
    if (i === 0) actual = 0
    else if (i === totalMonths) actual = physicalProgress
    else {
      const progressPerMonth = physicalProgress / totalMonths
      actual = Math.min(physicalProgress, Math.round(progressPerMonth * i))
    }
    
    data.push({
      month: monthDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      target,
      actual,
    })
  }
  
  return data
}

// ===== CALCULATE CASHFLOW PROJECTION =====
function calculateCashflowProjection(
  contractValue: number,
  totalPaid: number,
  termins: Termin[]
) {
  const remainingContract = contractValue - totalPaid
  const paidPercentage = contractValue > 0 ? Math.round((totalPaid / contractValue) * 100) : 0
  
  // Forecast based on termin schedule
  const upcomingTermins = termins
    .filter(t => t.status.toLowerCase() !== 'paid')
    .sort((a, b) => a.termin_no - b.termin_no)
  
  const nextPayment = upcomingTermins.length > 0 ? upcomingTermins[0].value : 0
  const nextPaymentDate = upcomingTermins.length > 0 ? upcomingTermins[0].due_date : '-'
  
  return {
    remainingContract,
    paidPercentage,
    nextPayment,
    nextPaymentDate,
    upcomingTerminsCount: upcomingTermins.length,
  }
}

/* ================= COMPONENTS ================= */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    planning: { label: "Planning", className: "bg-yellow-100 text-yellow-700" },
    running: { label: "Running", className: "bg-blue-100 text-blue-700" },
    finish: { label: "Finish", className: "bg-green-100 text-green-700" },
    hold: { label: "On Hold", className: "bg-orange-100 text-orange-700" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  }

  const { label, className } = config[status] || { 
    label: status, 
    className: "bg-gray-100 text-gray-700" 
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function ProjectTabs({ projectId, active }: { projectId: string; active: string }) {
  const tabs = [
    { id: "overview", label: "Overview", href: `/admin/projects/${projectId}` },
    { id: "contract", label: "Kontrak", href: `/admin/projects/${projectId}/contract` },
    { id: "rab", label: "RAB", href: `/admin/projects/${projectId}/rab` },
    { id: "progress", label: "Progress", href: `/admin/projects/${projectId}/progress` },
    { id: "documents", label: "Dokumen", href: `/admin/projects/${projectId}/documents` },
    { id: "logs", label: "Logs", href: `/admin/projects/${projectId}/logs` },
  ]

  return (
    <div className="border-b flex gap-1 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            active === tab.id
              ? "border-b-2 border-red-600 text-red-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}

function Card({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`border rounded-lg p-4 bg-white ${center ? "text-center" : ""}`}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-wide text-gray-500">{children}</p>
}

function ProgressStack({ time, physical }: { time: number; physical: number }) {
  const danger = physical < time

  return (
    <div className="relative w-full h-3 bg-gray-200 rounded mt-2">
      <div
        className="absolute h-3 bg-gray-400 rounded"
        style={{ width: `${time}%` }}
      />
      <div
        className={`absolute h-3 rounded ${danger ? "bg-red-500" : "bg-green-600"}`}
        style={{ width: `${physical}%` }}
      />
    </div>
  )
}

// ===== DELAY WARNING COMPONENT =====
function DelayWarning({ 
  projectId,
  physical,
  time,
  diff
}: { 
  projectId: string
  physical: number
  time: number
  diff: number
}) {

  if (physical >= time - 5) return null

  const severity = diff < -15 ? 'critical' : 'warning'
  
  const config = {
    warning: {
      icon: AlertTriangle,
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      iconColor: 'text-amber-500',
      title: '⚠️ Project Berisiko Terlambat',
      message: `Progress fisik (${physical}%) tertinggal ${Math.abs(diff)}% dari jadwal (${time}%). Percepatan diperlukan.`,
    },
    critical: {
      icon: AlertCircle,
      color: 'bg-red-50 border-red-200 text-red-700',
      iconColor: 'text-red-500',
      title: '🔴 KRITIS: Project Terlambat',
      message: `Progress fisik (${physical}%) tertinggal JAUH ${Math.abs(diff)}% dari jadwal (${time}%). Evaluasi segera!`,
    },
  }

  const { icon: Icon, color, iconColor, title, message } = config[severity]

  return (
    <div className={`border rounded-lg p-4 ${color} flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm mt-1">{message}</p>
        <div className="mt-2 flex gap-2">
          <Link
            href={`/admin/projects/${projectId}/progress/update`}
            className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50"
          >
            Update Progress
          </Link>
          <Link
            href={`/admin/projects/${projectId}/logs`}
            className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50"
          >
            Lihat Log
          </Link>
        </div>
      </div>
    </div>
  )
}

// ===== CASHFLOW PROJECTION COMPONENT =====
function CashflowProjection({ 
  contractValue, 
  totalPaid, 
  projection 
}: { 
  contractValue: number
  totalPaid: number
  projection: any 
}) {
  const paidPercentage = projection.paidPercentage
  const remainingPercentage = 100 - paidPercentage

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <Label>Cashflow Projection</Label>
        <DollarSign size={16} className="text-gray-400" />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Telah Dibayar</span>
          <span className="font-medium text-green-600">{formatIDR(totalPaid)} ({paidPercentage}%)</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full" 
            style={{ width: `${paidPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Sisa Kontrak</p>
          <p className="font-semibold text-gray-800">{formatIDR(projection.remainingContract)}</p>
          <p className="text-xs text-gray-400">{remainingPercentage}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Pembayaran Berikutnya</p>
          <p className="font-semibold text-blue-600">{formatIDR(projection.nextPayment)}</p>
          <p className="text-xs text-gray-400">Jatuh tempo: {projection.nextPaymentDate}</p>
        </div>
      </div>

      {projection.upcomingTerminsCount > 0 && (
        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          {projection.upcomingTerminsCount} termin tersisa
        </div>
      )}
    </Card>
  )
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card>
      <Label>{label}</Label>
      <p className={`mt-1 ${highlight ? "text-red-600 font-semibold" : ""}`}>{value}</p>
    </Card>
  )
}

function Section({ title, meta, children }: { title: string; meta?: React.ReactNode; children: React.ReactNode }) {
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

function SimpleTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
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

function Action({ href, label, color }: { href: string; label: string; color: "blue" | "gray" | "green" }) {
  const map = {
    blue: "bg-blue-600",
    gray: "bg-gray-800",
    green: "bg-green-600",
  }

  return (
    <Link href={href} className={`px-4 py-2 text-white text-xs rounded ${map[color]}`}>
      {label}
    </Link>
  )
}

/* ================= PAGE ================= */
export default async function ProjectDetailPage({
  params,
}: {
  params: { project_id: string }
}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const { project_id } = params

  const [project, scope, termins, logs] = await Promise.all([
    fetcher<Project | null>(`${base}/api/projects/${project_id}`, null),
    fetcher<ScopeProgress | null>(`${base}/api/projects/${project_id}/progress`, null),
    fetcher<Termin[]>(`${base}/api/projects/${project_id}/termin`, []),
    fetcher<ProjectLog[]>(`${base}/api/projects/${project_id}/logs`, []),
  ])

  if (!project) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Project Tidak Ditemukan</h2>
        <p className="text-sm text-gray-600 mb-4">Project dengan ID {project_id} tidak ada</p>
        <Link
          href="/admin/projects"
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm inline-block"
        >
          Kembali ke Projects
        </Link>
      </div>
    )
  }

  /* ================= HEALTH CALCULATION ================= */
  const scopeSafe: ScopeProgress = scope ?? {
  project_id,
  mep_progress: 0,
  civil_progress: 0,
  steel_progress: 0,
  interior_progress: 0,
  updated_at: null
}

  const scopes = [
    { label: "MEP", value: scopeSafe.mep_progress },
    { label: "Civil", value: scopeSafe.civil_progress },
    { label: "Steel", value: scopeSafe.steel_progress },
    { label: "Interior", value: scopeSafe.interior_progress },
  ]

  const activeScopes = scopes.filter((s) => s.value > 0)

const overallProgress =
  activeScopes.length > 0
    ? Math.round(
        activeScopes.reduce((sum, s) => sum + s.value, 0) /
        activeScopes.length
      )
    : 0

  const contractValue = project.nilai_kontrak || 0
  const estimatedUsed = contractValue > 0 ? Math.round((overallProgress / 100) * contractValue) : 0
  const remainingBudget = contractValue > 0 ? contractValue - estimatedUsed : 0
  const totalPaid = termins
    .filter((t) => t.status.toLowerCase() === "paid")
    .reduce((sum, t) => sum + (t.value || 0), 0)

  /* ================= TIME ================= */
  const start = new Date(project.start_date)
  const end = new Date(project.end_date)
  const today = new Date()

  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))
  const passedDays = Math.min(totalDays, Math.max(0, Math.ceil((today.getTime() - start.getTime()) / 86400000)))
  const timeProgress = Math.round((passedDays / totalDays) * 100)

  /* ================= HEALTH STATUS ================= */
  let health: "ontrack" | "risk" | "delay" | "notstarted" = "ontrack"

  if (project.status === "planning") {
    health = "notstarted"
  } else if (timeProgress === 0 && overallProgress === 0) {
    health = "notstarted"
  } else {
    const diff = overallProgress - timeProgress
    if (diff >= -5) health = "ontrack"
    else if (diff >= -15) health = "risk"
    else health = "delay"
  }

  const healthMap = {
    ontrack: ["On Track", "bg-emerald-100 text-emerald-700"],
    risk: ["Berisiko", "bg-amber-100 text-amber-700"],
    delay: ["Terlambat", "bg-red-100 text-red-700"],
    notstarted: ["Belum Mulai", "bg-gray-100 text-gray-700"],
  }

  /* ================= S-CURVE DATA ================= */
  const sCurveData = generateSCurveData(project.start_date, project.end_date, timeProgress, overallProgress)

  /* ================= CASHFLOW PROJECTION ================= */
  const cashflowProjection = calculateCashflowProjection(contractValue, totalPaid, termins)

  /* ================= DELAY WARNING ================= */
  const progressDiff = overallProgress - timeProgress

  return (
    <div className="p-6 space-y-6">
      {/* Header with Tabs */}
      <div className="space-y-4">
        <ProjectTabs projectId={project_id} active="overview" />
        
        {/* Enhanced Project Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl font-bold">{project.project_name}</h1>
              <StatusBadge status={project.status} />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${healthMap[health][1]}`}>
                {healthMap[health][0]}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Building2 size={16} className="text-gray-400" />
                <span>{project.project_id}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-gray-400" />
                <span>{project.lokasi || "-"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  {new Date(project.start_date).toLocaleDateString("id-ID")} - {new Date(project.end_date).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={16} className="text-gray-400" />
                <span>{project.project_type || "OTHER"}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/admin/projects/${project_id}/edit`}
              className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"
            >
              <Edit size={14} />
              Edit
            </Link>
            <Link
              href={`/admin/projects/${project_id}/progress/update`}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Update Progress
            </Link>
          </div>
        </div>
      </div>

      {/* DELAY WARNING SYSTEM (UPGRADE #3) */}
      <DelayWarning 
 projectId={project_id}
 physical={overallProgress} 
 time={timeProgress} 
 diff={progressDiff} 
/>

      {/* CUSTOMER DETAIL */}
      {project.customer && (
        <Card>
          <Label>Customer Detail</Label>

          <div className="grid md:grid-cols-2 gap-4 mt-2 text-sm">
            <div>
              <p className="font-medium">{project.customer.company_name}</p>
              <p className="text-xs text-gray-500">{project.customer.customer_type}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">PIC</p>
              <p className="font-medium">
                {project.customer.pic_name} — {project.customer.pic_position}
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
                {project.customer.city}, {project.customer.province} {project.customer.postal_code}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* PROJECT HEALTH MONITOR */}
      <Card>
        <Label>Project Health Monitor</Label>
        <ProgressStack time={timeProgress} physical={overallProgress} />
        <p className="text-[11px] text-gray-500 mt-1">
          Waktu {timeProgress}% • Fisik {overallProgress}%
        </p>
      </Card>

      {/* S-CURVE PROGRESS CHART (UPGRADE #1) */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Label>S-Curve Progress Chart</Label>
          <BarChart3 size={16} className="text-gray-400" />
        </div>
        <SCurveChart data={sCurveData} />
      </Card>

      {/* FINANCIAL SNAPSHOT + CASHFLOW (UPGRADE #2) */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Info label="Nilai Kontrak" value={formatIDR(contractValue)} highlight />
          <Info label="Estimasi Terpakai" value={formatIDR(estimatedUsed)} />
          <Info label="Total Terbayar" value={formatIDR(totalPaid)} />
          <Info label="Sisa Anggaran" value={formatIDR(remainingBudget)} />
        </div>
        
        <CashflowProjection 
          contractValue={contractValue}
          totalPaid={totalPaid}
          projection={cashflowProjection}
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
<Section
  title="Termin Kontrak"
  meta={
    <Link
      href={`/admin/projects/${project_id}/termin`}
      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      + Tambah Termin
    </Link>
  }
>
  {termins.length === 0 ? (
    <Empty />
  ) : (
    <SimpleTable
      headers={["Termin", "Deskripsi", "% / Nilai", "Status", "Jatuh Tempo", "Dibayar"]}
      rows={termins.map((t) => [
        t.termin_no,
        t.description,
        `${t.percent}% • ${formatIDR(t.value)}`,
        <span
          key={`status-${t.termin_no}`}
          className={`px-2 py-0.5 rounded text-[11px] font-medium inline-block ${getTerminStatusBadge(t.status)}`}
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
        <Action href={`/admin/projects/${project_id}/contract`} label="Kontrak" color="blue" />
        <Action href={`/admin/projects/${project_id}/rab`} label="RAB" color="gray" />
        <Action href={`/admin/projects/${project_id}/progress`} label="Progress" color="green" />
      </div>
    </div>
  )
}
