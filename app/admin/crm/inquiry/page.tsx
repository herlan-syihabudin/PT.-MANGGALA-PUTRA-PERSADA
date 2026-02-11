import Link from "next/link"
import { 
  Plus, Search, Filter, 
  UserPlus, FileCheck, ArrowUpRight 
} from "lucide-react"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

type Inquiry = {
  inquiry_id: string
  tanggal_masuk: string
  customer_name: string
  nama_pekerjaan: string
  layanan?: string
  estimasi_nilai?: number
  assigned_to?: string
  status: string
}

/* ================= FETCH ================= */

async function fetchInquiry(): Promise<Inquiry[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL

  const res = await fetch(`${base}/api/crm/inquiry`, {
    cache: "no-store",
  })

  if (!res.ok) return []
  return res.json()
}

/* ================= HELPER ================= */

const formatCurrency = (value?: number) => {
  if (!value) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

/* ================= PAGE ================= */

export default async function InquiryPage() {
  const rawData = await fetchInquiry()
  const data = rawData ?? []

  const normalized = data.map(i => ({
    ...i,
    status: i.status?.toLowerCase() || "new"
  }))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Inquiry & Leads
          </h1>
          <p className="text-gray-500 font-medium">
            Manajemen prospek dan peluang proyek PT MPP.
          </p>
        </div>

        <Link
          href="/admin/crm/inquiry/create"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={18} /> Tambah Inquiry Baru
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <KPIItem label="Total Leads" value={normalized.length} color="gray" />
        <KPIItem label="Status: New" value={normalized.filter(i => i.status === "new").length} color="blue" />
        <KPIItem label="Ongoing" value={normalized.filter(i => !["new","won","lost"].includes(i.status)).length} color="amber" />
        <KPIItem label="Closed: Won" value={normalized.filter(i => i.status === "won").length} color="emerald" />
        <KPIItem label="Closed: Lost" value={normalized.filter(i => i.status === "lost").length} color="red" />
      </div>

      {/* SEARCH BAR */}
      <div className="flex gap-4 items-center bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari customer atau nama pekerjaan..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-12 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <th className="px-6 py-5 text-left">Info Prospek</th>
                <th className="px-6 py-5 text-left">Pekerjaan</th>
                <th className="px-6 py-5 text-right">Est. Budget</th>
                <th className="px-6 py-5 text-left">Assigned</th>
                <th className="px-6 py-5 text-left">Status</th>
                <th className="px-6 py-5 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {normalized.length === 0 ? (
                <EmptyState />
              ) : (
                normalized.map((i) => (
                  <tr key={i.inquiry_id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{i.customer_name || "-"}</p>
                      <p className="text-[10px] text-gray-400">
                        Masuk: {i.tanggal_masuk ? new Date(i.tanggal_masuk).toLocaleDateString("id-ID") : "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700">{i.nama_pekerjaan || "-"}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">
                        {i.layanan || "Umum"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(i.estimasi_nilai)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                          {i.assigned_to ? i.assigned_to.substring(0,2).toUpperCase() : "?"}
                        </div>
                        <span className="text-xs text-gray-600">
                          {i.assigned_to || "Unassigned"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={i.status} />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/crm/inquiry/${i.inquiry_id}`} className="p-2 text-blue-600">
                          <ArrowUpRight size={16} />
                        </Link>
                        <Link href={`/admin/crm/inquiry/${i.inquiry_id}/assign`} className="p-2 text-amber-600">
                          <UserPlus size={16} />
                        </Link>
                        <Link href={`/admin/crm/inquiry/${i.inquiry_id}/convert`} className="p-2 text-green-600">
                          <FileCheck size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function KPIItem({ label, value, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    red: "text-red-600 bg-red-50",
    gray: "text-gray-600 bg-gray-50"
  }

  return (
    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <h3 className="text-2xl font-black text-gray-900">
        {value}
      </h3>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-gray-100 text-gray-700",
    survey: "bg-blue-100 text-blue-700",
    estimating: "bg-amber-100 text-amber-700",
    sent: "bg-indigo-100 text-indigo-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  )
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={6} className="py-20 text-center">
        <div className="flex flex-col items-center">
          <Search size={32} className="text-gray-300 mb-4" />
          <p className="text-sm font-bold text-gray-900">Belum ada inquiry</p>
          <Link href="/admin/crm/inquiry/create" className="mt-4 text-xs text-blue-600 underline">
            Buat Prospek Pertama
          </Link>
        </div>
      </td>
    </tr>
  )
}
