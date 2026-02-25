import Link from "next/link"
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw,
  FolderOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Building2,
  ArrowUpRight,
  Bell,
  Shield
} from "lucide-react"
import { formatIDR } from "@/lib/format"

export const dynamic = "force-dynamic"

type RabProject = {
  rab_id: string
  project_id: string
  project_name: string | null
  customer_name?: string | null
  total_items: number | null
  total_value: number | null
  status: string | null
  inquiry_id?: string
  created_at?: string
  approved_at?: string
  margin?: number
  ppn?: number
}

type PendingInquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai?: number
  created_at?: string
}

async function fetchRABList(): Promise<RabProject[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const res = await fetch(`${base}/api/estimator/rab`, {
    cache: "no-store",
  })

  if (!res.ok) return []

  const result = await res.json()
  return result.data || []
}

async function fetchPendingInquiry(): Promise<PendingInquiry[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const res = await fetch(`${base}/api/estimator/inquiry/pending`, {
    cache: "no-store",
  })
  if (!res.ok) return []
  return res.json()
}

export default async function RABPage() {
  const [rawProjects, pending] = await Promise.all([
    fetchRABList(),
    fetchPendingInquiry(),
  ])

  const projects = (rawProjects ?? []).sort((a, b) => {
    // Prioritaskan draft
    const statusA = (a.status || "").toLowerCase()
    const statusB = (b.status || "").toLowerCase()
    if (statusA === "draft" && statusB !== "draft") return -1
    if (statusB === "draft" && statusA !== "draft") return 1
    
    // Kemudian berdasarkan tanggal (terbaru)
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateB - dateA
  })

  // Stats
  const totalValue = projects.reduce((sum, p) => sum + Number(p.total_value || 0), 0)
  const draftCount = projects.filter(p => p.status?.toLowerCase() === 'draft').length
  const approvedCount = projects.filter(p => p.status?.toLowerCase() === 'approved').length
  const lockedCount = projects.filter(p => p.status?.toLowerCase() === 'locked').length

  // Project dengan nilai terbesar
  const topProject = projects.length > 0 
    ? projects.reduce((max, p) => (p.total_value || 0) > (max.total_value || 0) ? p : max, projects[0])
    : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Premium Industrial */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-b border-slate-600/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <FileText size={28} className="text-slate-300" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">
                  RAB Project
                </h1>
                <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Workspace Estimator – Rencana Anggaran Biaya
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* To Estimate Button with Notification */}
              <Link
                href="/admin/estimator/to-estimate"
                className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                  pending.length > 0
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200"
                    : "bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10"
                }`}
              >
                <Bell size={16} />
                <span>To Estimate</span>
                {pending.length > 0 && (
                  <>
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                      {pending.length}
                    </span>
                    <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {pending.length} baru
                    </span>
                  </>
                )}
              </Link>

              {/* Create Button */}
              <Link
                href="/admin/estimator/rab/create"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-emerald-200"
              >
                <Plus size={16} />
                Buat RAB Baru
              </Link>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <StatCard 
              label="Total RAB" 
              value={projects.length} 
              icon={<FolderOpen size={16} />}
              color="slate"
            />
            <StatCard 
              label="Draft" 
              value={draftCount} 
              icon={<Clock size={16} />}
              color="amber"
            />
            <StatCard 
              label="Approved" 
              value={approvedCount} 
              icon={<CheckCircle size={16} />}
              color="emerald"
            />
            <StatCard 
              label="Locked" 
              value={lockedCount} 
              icon={<XCircle size={16} />}
              color="rose"
            />
            <StatCard 
              label="Total Nilai" 
              value={formatIDR(totalValue)} 
              icon={<DollarSign size={16} />}
              color="blue"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <InsightCard
            title="Rata-rata Nilai RAB"
            value={formatIDR(projects.length > 0 ? totalValue / projects.length : 0)}
            icon={<BarChart3 size={18} />}
            trend={+12.5}
            color="blue"
          />
          <InsightCard
            title="RAB Terbesar"
            value={topProject ? formatIDR(topProject.total_value || 0) : "-"}
            subtitle={topProject?.project_name || ""}
            icon={<TrendingUp size={18} />}
            color="purple"
          />
          <InsightCard
  title="Pending Estimate"
  value={pending.length}  // ✅ Langsung number, aman
  subtitle="Inquiry siap diproses"
  icon={<Bell size={18} />}
  color="amber"
  badge={pending.length > 0}
/>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari berdasarkan project atau customer..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none bg-white">
                <option>Semua Status</option>
                <option>Draft</option>
                <option>Approved</option>
                <option>Locked</option>
              </select>
              <button className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <Filter size={18} className="text-slate-500" />
              </button>
              <button className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <RefreshCw size={18} className="text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* RAB Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project Info</th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Margin</th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-400">Belum ada RAB project</p>
                    <Link 
                      href="/admin/estimator/rab/create"
                      className="inline-flex items-center gap-2 mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      <Plus size={16} />
                      Buat RAB Pertama
                    </Link>
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr
                    key={p.rab_id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    {/* Project Info */}
                    <td className="p-4">
                      <div className="font-medium text-slate-800">
                        {p.project_name || "Untitled Project"}
                      </div>
                      {p.customer_name && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Building2 size={12} />
                          {p.customer_name}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {p.project_id}
                        </span>
                        {p.inquiry_id && (
                          <Link
                            href={`/admin/crm/inquiry/${p.inquiry_id}`}
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <ArrowUpRight size={10} />
                            Inquiry
                          </Link>
                        )}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {p.total_items ?? 0}
                        </span>
                        <span className="text-xs text-slate-500">item</span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {formatIDR(p.total_value ?? 0)}
                      </div>
                      {p.ppn && p.ppn > 0 && (
                        <div className="text-[10px] text-slate-400">
                          PPN: {formatIDR(p.ppn)}
                        </div>
                      )}
                    </td>

                    {/* Margin */}
                    <td className="p-4">
                      {p.margin ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          p.margin >= 20 ? 'bg-emerald-100 text-emerald-700' :
                          p.margin >= 10 ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {p.margin}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={p.status || "Draft"} />
                    </td>

                   {/* Actions */}
<td className="p-4">
  <div className="flex items-center justify-center gap-2">

    {/* VIEW */}
    <Link
  href={`/admin/estimator/rab/${p.rab_id}`}
  className="p-2 hover:bg-slate-100 rounded-lg transition group"
  title="Lihat Detail"
>
  <Eye size={16} className="text-slate-400 group-hover:text-blue-600" />
</Link>

    {/* EDIT (hanya Draft) */}
    {p.status?.toLowerCase() === "draft" && (
      <Link
        href={`/admin/estimator/rab/${p.rab_id}`}
        className="p-2 hover:bg-slate-100 rounded-lg transition group"
        title="Edit"
      >
        <Edit size={16} className="text-slate-400 group-hover:text-emerald-600" />
      </Link>
    )}

    {/* BUAT PROPOSAL (Approved) */}
    {p.status?.toLowerCase() === "approved" && (
      <Link
        href={`/admin/estimator/proposal/create?rab_id=${p.rab_id}`}
        className="p-2 hover:bg-slate-100 rounded-lg transition group"
        title="Buat Proposal"
      >
        <FileText size={16} className="text-slate-400 group-hover:text-purple-600" />
      </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Security Note */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-slate-100/50 border border-slate-200 rounded-xl">
          <Shield size={18} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 leading-relaxed">
            <span className="font-medium text-slate-700">Security Note:</span> Data RAB dikontrol penuh oleh Estimator. 
            Project Management hanya memiliki akses baca (Read-Only) dan tidak dapat mengubah angka RAB setelah di-approve.
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Total {projects.length} RAB</span>
            <span>•</span>
            <span>{draftCount} draft</span>
            <span>•</span>
            <span>{approvedCount} approved</span>
            <span>•</span>
            <span>{lockedCount} locked</span>
          </div>
          <div>
            Last updated: {new Date().toLocaleString('id-ID')}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  
  const config: Record<string, { color: string; label: string; icon?: any }> = {
    draft: { 
      color: "bg-amber-100 text-amber-700 border-amber-200", 
      label: "Draft",
      icon: Clock
    },
    approved: { 
      color: "bg-emerald-100 text-emerald-700 border-emerald-200", 
      label: "Approved",
      icon: CheckCircle
    },
    locked: { 
      color: "bg-slate-100 text-slate-700 border-slate-200", 
      label: "Locked",
      icon: XCircle
    },
    rejected: { 
      color: "bg-rose-100 text-rose-700 border-rose-200", 
      label: "Rejected",
      icon: AlertCircle
    }
  }

  const { color, label, icon: Icon } = config[normalized] || config.draft

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
      {Icon && <Icon size={12} />}
      {label}
    </span>
  )
}

function StatCard({ label, value, icon, color }: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode;
  color: string;
}) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
    blue: "bg-blue-100 text-blue-600",
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colors[color as keyof typeof colors]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-base font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

// ================= INSIGHT CARD COMPONENT =================
function InsightCard({ title, value, icon, subtitle, trend, color, badge }: {
  title: string;
  value: string | number;  // ✅ Terima string atau number
  icon: React.ReactNode;
  subtitle?: string;
  trend?: number;
  color: string;
  badge?: boolean;
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50/50",
    purple: "border-purple-200 bg-purple-50/50",
    amber: "border-amber-200 bg-amber-50/50",
  }

  // Format number jika perlu
  const displayValue = typeof value === 'number' 
    ? value.toLocaleString('id-ID')
    : value

  return (
    <div className={`bg-white border ${colors[color as keyof typeof colors]} rounded-xl p-5 shadow-sm relative`}>
      {badge && (
        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          Baru
        </span>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-white border ${colors[color as keyof typeof colors]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-xl font-bold text-slate-800 mt-1">{displayValue}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>}
    </div>
  )
}
