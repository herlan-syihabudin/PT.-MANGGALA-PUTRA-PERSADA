export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

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
}

type Project = {
  project_id: string
  project_name: string
  status: string
  nilai_kontrak?: number
  created_at?: string
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

/* ================= FETCH CUSTOMER ================= */

async function getCustomer(id: string): Promise<Customer | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm/customers/${id}`,
    { cache: "no-store" }
  )

  if (!res.ok) return null
  return res.json()
}

/* ================= FETCH SUMMARY ================= */

async function getSummary(customerId: string): Promise<ExtendedSummary> {
  try {
    const [inqRes, projRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm/inquiry?customer_id=${customerId}`,
        { cache: "no-store" }
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects?customer_id=${customerId}`,
        { cache: "no-store" }
      ),
    ])

    const inquiries: Inquiry[] = inqRes.ok ? await inqRes.json() : []
    const projects: Project[] = projRes.ok ? await projRes.json() : []

    const active = projects.filter(p => p.status === "Active")
    const completed = projects.filter(p => p.status === "Completed")

    const totalRevenue = completed.reduce(
      (acc, p) => acc + (Number(p.nilai_kontrak) || 0),
      0
    )

    const totalPipeline = active.reduce(
      (acc, p) => acc + (Number(p.nilai_kontrak) || 0),
      0
    )

    const conversionRate =
      inquiries.length > 0
        ? Math.round((projects.length / inquiries.length) * 100)
        : 0

    /* ===== HEALTH STATUS ===== */
    const healthStatus =
      inquiries.length === 0
        ? "New Lead"
        : conversionRate > 50
        ? "Loyal Partner"
        : conversionRate > 20
        ? "Active"
        : "Low Conversion"

    /* ===== RISK INDICATOR ===== */
    const riskLevel =
      conversionRate > 50
        ? "Low Risk"
        : conversionRate > 20
        ? "Medium Risk"
        : "High Risk"

    /* ===== AVG DEAL SIZE ===== */
    const avgDealSize =
      completed.length > 0
        ? Math.round(totalRevenue / completed.length)
        : 0

    /* ===== DAYS TO CLOSE (Simple Estimation) ===== */
    const avgDaysToClose =
      completed.length > 0
        ? 30 // sementara asumsi default
        : 0

    /* ===== PAYMENT SCORE (Dummy Logic) ===== */
    const paymentScore =
      conversionRate > 50
        ? 90
        : conversionRate > 20
        ? 70
        : 40

    const sortedProject = [...projects].sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
    )

    const sortedInquiry = [...inquiries].sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
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
  } catch {
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

/* ================= PAGE ================= */

export default async function CustomerDetailPage({
  params,
}: {
  params: { customer_id: string }
}) {
  const customer = await getCustomer(params.customer_id)
  if (!customer) return <div className="p-6">Customer tidak ditemukan</div>

  const summary = await getSummary(customer.customer_id)

  const badgeMap: any = {
    "New Lead": "bg-gray-100 text-gray-700",
    "Low Conversion": "bg-red-100 text-red-700",
    "Active": "bg-blue-100 text-blue-700",
    "Loyal Partner": "bg-green-100 text-green-700",
  }

  return (
    <div className="p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{customer.company_name}</h1>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeMap[summary.healthStatus]}`}
            >
              {summary.healthStatus}
            </span>
          </div>
          <p className="text-sm text-gray-500">{customer.customer_id}</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Total Inquiry" value={summary.totalInquiry} />
        <StatCard label="Total Project" value={summary.totalProject} />
        <StatCard label="Conversion Rate" value={`${summary.conversionRate}%`} />
        <StatCard label="Risk Level" value={summary.riskLevel} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <MoneyCard label="Total Revenue" value={summary.totalRevenue} />
        <MoneyCard label="Pipeline Value" value={summary.totalPipeline} />
        <MoneyCard label="Avg Deal Size" value={summary.avgDealSize} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Days to Close" value={`${summary.avgDaysToClose} days`} />
        <StatCard label="Payment Score" value={`${summary.paymentScore}/100`} />
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold mt-2">{value}</p>
    </div>
  )
}

function MoneyCard({ label, value }: { label: string; value: number }) {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

  return (
    <div className="border rounded p-4 bg-green-50 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-green-700 mt-2">
        {formatted}
      </p>
    </div>
  )
}
