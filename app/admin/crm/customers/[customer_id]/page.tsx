import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock,
  DollarSign,
  Target,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Plus
} from "lucide-react"

export const dynamic = "force-dynamic"

// ================= TYPES =================
type Customer = {
  customer_id: string
  company_name: string
  customer_type: string
  pic_name: string
  pic_position: string
  phone: string
  email: string
  npwp: string
  address: string
  city: string
  province: string
  postal_code: string
  status: string
  notes: string
  created_at: string
  created_by: string
  updated_at?: string
}

type Project = {
  project_id: string
  project_name: string
  status: string
  nilai_kontrak?: number
  created_at?: string
  completed_at?: string
}

type Inquiry = {
  inquiry_id: string
  nama_pekerjaan: string
  created_at?: string
}

type ExtendedSummary = {
  totalInquiry: number
  totalProject: number
  activeProject: number
  completedProject: number
  totalRevenue: number
  totalPipeline: number
  lastProject?: Project
  lastInquiry?: Inquiry
  conversionRate: number
  healthStatus: string
  riskLevel: string
  avgDealSize: number
  avgDaysToClose: number
  paymentScore: number
}

// ================= FETCH CUSTOMER =================
async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const res = await fetch(
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm/customers/${id}`,
  { cache: "no-store" }
)

    if (!res.ok) {
      console.error(`Failed to fetch customer ${id}: ${res.status}`)
      return null
    }

    return res.json()
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error)
    return null
  }
}

// ================= FETCH SUMMARY =================
async function getSummary(customerId: string): Promise<ExtendedSummary> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

const [inqRes, projRes] = await Promise.all([
  fetch(`${baseUrl}/api/crm/inquiry?customer_id=${customerId}`, { cache: "no-store" }),
  fetch(`${baseUrl}/api/projects?customer_id=${customerId}`, { cache: "no-store" }),
])

    const inqJson = inqRes.ok ? await inqRes.json() : { data: [] }
const inquiries: Inquiry[] = inqJson.data || []

const projJson = projRes.ok ? await projRes.json() : { data: [] }
const projects: Project[] = projJson.data || []

    const active = projects.filter(p => p.status === "Active" || p.status === "On Going")
    const completed = projects.filter(p => p.status === "Completed" || p.status === "Done")

    const totalRevenue = completed.reduce(
      (acc, p) => acc + (Number(p.nilai_kontrak) || 0),
      0
    )

    const totalPipeline = active.reduce(
      (acc, p) => acc + (Number(p.nilai_kontrak) || 0),
      0
    )

    const conversionRate = inquiries.length > 0
      ? Math.round((projects.length / inquiries.length) * 100)
      : 0

    // Health Status
    const healthStatus = inquiries.length === 0
      ? "New Lead"
      : conversionRate > 50
      ? "Loyal Partner"
      : conversionRate > 20
      ? "Active"
      : "Low Conversion"

    // Risk Level
    const riskLevel = conversionRate > 50
      ? "Low Risk"
      : conversionRate > 20
      ? "Medium Risk"
      : "High Risk"

    // Average Deal Size
    const avgDealSize = completed.length > 0
      ? Math.round(totalRevenue / completed.length)
      : 0

    // Average Days to Close (using completed_at)
    const avgDaysToClose = completed.length > 0
      ? Math.round(
          completed.reduce((acc, p) => {
            if (!p.created_at || !p.completed_at) return acc
            const start = new Date(p.created_at).getTime()
            const end = new Date(p.completed_at).getTime()
            return acc + (end - start) / (1000 * 60 * 60 * 24)
          }, 0) / completed.length
        )
      : 0

    // Payment Score
    const paymentScore = riskLevel === "Low Risk"
      ? 90
      : riskLevel === "Medium Risk"
      ? 70
      : 40

    // Sort untuk last activity
    const sortedProject = [...projects].sort(
      (a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
    )

    const sortedInquiry = [...inquiries].sort(
      (a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
    )

    return {
      totalInquiry: inquiries.length,
      totalProject: projects.length,
      activeProject: active.length,
      completedProject: completed.length,
      totalRevenue,
      totalPipeline,
      lastProject: sortedProject[0],
      lastInquiry: sortedInquiry[0],
      conversionRate,
      healthStatus,
      riskLevel,
      avgDealSize,
      avgDaysToClose,
      paymentScore,
    }
  } catch (error) {
    console.error("Error fetching summary:", error)
    return {
      totalInquiry: 0,
      totalProject: 0,
      activeProject: 0,
      completedProject: 0,
      totalRevenue: 0,
      totalPipeline: 0,
      conversionRate: 0,
      healthStatus: "New Lead",
      riskLevel: "High Risk",
      avgDealSize: 0,
      avgDaysToClose: 0,
      paymentScore: 0,
    }
  }
}

// ================= PAGE =================
export default async function CustomerDetailPage(
  { params }: { params: { customer_id: string } }
) {
  const { customer_id } = params

  const customer = await getCustomer(customer_id)
  if (!customer) return notFound()

  const summary = await getSummary(customer_id)

  // Badge colors sesuai theme industrial
  const badgeMap: Record<string, string> = {
    "New Lead": "bg-slate-100 text-slate-700",
    "Low Conversion": "bg-rose-100 text-rose-700",
    "Active": "bg-blue-100 text-blue-700",
    "Loyal Partner": "bg-emerald-100 text-emerald-700",
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Premium Industrial */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/admin/crm/customers"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Customer List
          </Link>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <Building2 size={28} className="text-slate-300" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl lg:text-3xl font-light tracking-tight">
                    {customer.company_name}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeMap[summary.healthStatus]}`}>
                    {summary.healthStatus}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mt-1">
                  ID: {customer.customer_id} • {customer.customer_type} • Customer sejak {new Date(customer.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link
                href={`/admin/crm/customers/${customer.customer_id}/edit`}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 border border-white/10"
              >
                <Edit size={16} />
                Edit
              </Link>
              <Link
                href={`/admin/crm/inquiry/create?customer_id=${customer.customer_id}`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                <Plus size={16} />
                + Inquiry
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            label="Total Inquiry" 
            value={summary.totalInquiry} 
            icon={<FileText size={18} className="text-slate-600" />}
          />
          <StatCard 
            label="Total Project" 
            value={summary.totalProject} 
            icon={<Briefcase size={18} className="text-slate-600" />}
          />
          <StatCard 
            label="Conversion Rate" 
            value={`${summary.conversionRate}%`} 
            icon={<TrendingUp size={18} className="text-slate-600" />}
          />
          <StatCard 
            label="Risk Level" 
            value={summary.riskLevel} 
            icon={<AlertCircle size={18} className="text-slate-600" />}
          />
        </div>

        {/* Money Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MoneyCard 
            label="Total Revenue" 
            value={summary.totalRevenue} 
            icon={<DollarSign size={18} />}
          />
          <MoneyCard 
            label="Pipeline Value" 
            value={summary.totalPipeline} 
            icon={<Target size={18} />}
          />
          <MoneyCard 
            label="Avg Deal Size" 
            value={summary.avgDealSize} 
            icon={<TrendingUp size={18} />}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatCard 
            label="Days to Close (Avg)" 
            value={`${summary.avgDaysToClose} hari`} 
            icon={<Clock size={18} className="text-slate-600" />}
          />
          <StatCard 
            label="Payment Score" 
            value={`${summary.paymentScore}/100`} 
            icon={<CheckCircle size={18} className="text-slate-600" />}
          />
        </div>

        {/* Last Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ActivityCard
            title="Project Terakhir"
            name={summary.lastProject?.project_name}
            date={summary.lastProject?.created_at}
            icon={<Briefcase size={16} />}
          />
          <ActivityCard
            title="Inquiry Terakhir"
            name={summary.lastInquiry?.nama_pekerjaan}
            date={summary.lastInquiry?.created_at}
            icon={<FileText size={16} />}
          />
        </div>

        {/* Customer Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-slate-500" />
            Informasi Customer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoField 
              label="PIC" 
              value={customer.pic_name} 
              icon={<Users size={14} />}
            />
            <InfoField 
              label="Jabatan" 
              value={customer.pic_position || "-"} 
              icon={<Briefcase size={14} />}
            />
            <InfoField 
              label="Telepon" 
              value={customer.phone} 
              icon={<Phone size={14} />}
            />
            <InfoField 
              label="Email" 
              value={customer.email || "-"} 
              icon={<Mail size={14} />}
            />
            <InfoField 
              label="NPWP" 
              value={customer.npwp || "-"} 
              icon={<FileText size={14} />}
            />
            <InfoField 
              label="Kota" 
              value={customer.city || "-"} 
              icon={<MapPin size={14} />}
            />
            <InfoField 
              label="Provinsi" 
              value={customer.province || "-"} 
              icon={<MapPin size={14} />}
            />
            <InfoField 
              label="Kode Pos" 
              value={customer.postal_code || "-"} 
              icon={<MapPin size={14} />}
            />
          </div>

          {customer.address && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Alamat Lengkap</p>
              <p className="text-sm text-slate-700">{customer.address}</p>
            </div>
          )}

          {customer.notes && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Catatan</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
            <p>Created: {new Date(customer.created_at).toLocaleString('id-ID')} by {customer.created_by}</p>
            {customer.updated_at && (
              <p className="mt-1">Last Updated: {new Date(customer.updated_at).toLocaleString('id-ID')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ================= COMPONENTS =================

function StatCard({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        {icon && <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

function MoneyCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        {icon && <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">{icon}</div>}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-emerald-600">{formatted}</p>
    </div>
  )
}

function InfoField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <div className="text-slate-400 mt-0.5">{icon}</div>}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function ActivityCard({ title, name, date, icon }: { title: string; name?: string; date?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center gap-2 mb-3">
        {icon && <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">{icon}</div>}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      </div>
      <p className="font-medium text-slate-800">{name || "-"}</p>
      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
        <Calendar size={12} />
        {date ? new Date(date).toLocaleDateString("id-ID", { 
          day: "numeric", 
          month: "long", 
          year: "numeric" 
        }) : "-"}
      </p>
    </div>
  )
}
