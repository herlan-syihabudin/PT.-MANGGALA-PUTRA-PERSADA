// app/admin/estimator/ve/page.tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  TrendingUp, 
  FileText, 
  Users, 
  Calendar,
  ChevronRight,
  BarChart3,
  Copy,
  Eye
} from "lucide-react"

interface RABForVE {
  rab_id: string
  project_name: string
  customer_name: string
  total_value: number
  created_at: string
  created_by: string
  versions: number
  status: string
}

async function fetchRABsForVE(): Promise<RABForVE[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  
  const res = await fetch(`${baseUrl}/api/estimator/rab?status=draft`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return []
  }

  const data = await res.json()
  
  // Mock data untuk demo
  return [
    {
      rab_id: "RAB-001",
      project_name: "Renovasi Gedung A",
      customer_name: "PT Maju Jaya",
      total_value: 525000000,
      created_at: "2026-02-20T10:00:00Z",
      created_by: "Andi Estimator",
      versions: 3,
      status: "draft"
    },
    {
      rab_id: "RAB-002",
      project_name: "Pembangunan Ruko 3 Lantai",
      customer_name: "PT Sukses Makmur",
      total_value: 1250000000,
      created_at: "2026-02-19T14:30:00Z",
      created_by: "Budi Estimator",
      versions: 2,
      status: "draft"
    },
    {
      rab_id: "RAB-003",
      project_name: "Interior Kantor",
      customer_name: "CV Karya Mandiri",
      total_value: 350000000,
      created_at: "2026-02-18T09:15:00Z",
      created_by: "Cici Estimator",
      versions: 4,
      status: "draft"
    }
  ]
}

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export default async function VEPage() {
  const rabs = await fetchRABsForVE()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-slate-800">
                Value Engineering
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Optimasi nilai proyek dengan berbagai opsi
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
            Total: {rabs.length} RAB
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total RAB</p>
            <p className="text-2xl font-light text-slate-800 mt-1">{rabs.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Versi</p>
            <p className="text-2xl font-light text-slate-800 mt-1">
              {rabs.reduce((sum, r) => sum + r.versions, 0)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Nilai</p>
            <p className="text-2xl font-light text-slate-800 mt-1">
              {formatIDR(rabs.reduce((sum, r) => sum + r.total_value, 0))}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Rata-rata Versi</p>
            <p className="text-2xl font-light text-slate-800 mt-1">
              {(rabs.reduce((sum, r) => sum + r.versions, 0) / rabs.length || 0).toFixed(1)}
            </p>
          </div>
        </div>

        {/* TABLE RAB */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase">
                  RAB ID
                </th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase">
                  Project
                </th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase">
                  Customer
                </th>
                <th className="p-4 text-right text-xs font-medium text-slate-500 uppercase">
                  Nilai
                </th>
                <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase">
                  Versi
                </th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase">
                  Estimator
                </th>
                <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rabs.map((rab) => (
                <tr key={rab.rab_id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono text-sm text-slate-600">
                    {rab.rab_id}
                  </td>
                  <td className="p-4 text-slate-800 font-medium">
                    {rab.project_name}
                  </td>
                  <td className="p-4 text-slate-600">
                    {rab.customer_name}
                  </td>
                  <td className="p-4 text-right font-semibold text-emerald-600">
                    {formatIDR(rab.total_value)}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {rab.versions} versi
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {rab.created_by}
                  </td>
                  <td className="p-4 text-center">
                    <Link
                      href={`/admin/estimator/ve/${rab.rab_id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-700 transition"
                    >
                      <Eye size={14} />
                      Detail VE
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* INFO CARD */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-emerald-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-800">
                Apa itu Value Engineering?
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Value Engineering adalah proses sistematis untuk meningkatkan nilai proyek 
                dengan menganalisis fungsi dan mencari alternatif yang lebih ekonomis 
                tanpa mengorbankan kualitas. Buat beberapa versi RAB untuk ditawarkan ke client.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
