"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { 
  FileText, Search, Plus, Filter, 
  ExternalLink, Download, Send, AlertCircle,
  CheckCircle, Clock, XCircle
} from "lucide-react"

/* ================= TYPES ================= */

type Proposal = {
  proposal_id: string
  pipeline_id: string
  rab_id: string
  project_name?: string // Kita asumsi join project name
  total_value: number
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED"
  created_at: string
}

/* ================= CONFIG ================= */

const statusConfig: Record<string, { color: string, icon: any }> = {
  DRAFT: { color: "bg-gray-100 text-gray-600", icon: <Clock size={12} /> },
  SENT: { color: "bg-blue-100 text-blue-700", icon: <Send size={12} /> },
  APPROVED: { color: "bg-green-100 text-green-700", icon: <CheckCircle size={12} /> },
  REJECTED: { color: "bg-red-100 text-red-700", icon: <XCircle size={12} /> },
  EXPIRED: { color: "bg-orange-100 text-orange-700", icon: <AlertCircle size={12} /> },
}

export default function ProposalPage() {
  const [data, setData] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/crm/proposal")
        const json = await res.json()
        setData(json)
      } catch (e) {
        console.error("Gagal ambil proposal", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  /* ================= ANALYTICS ================= */
  const stats = useMemo(() => {
    return {
      totalPending: data.filter(p => p.status === "SENT").reduce((s, p) => s + p.total_value, 0),
      countApproved: data.filter(p => p.status === "APPROVED").length,
      totalValue: data.reduce((s, p) => s + p.total_value, 0)
    }
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter(p => 
      p.proposal_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  if (loading) return <div className="p-10 animate-pulse text-gray-400 font-bold tracking-widest text-center mt-20">PREPARING PROPOSALS...</div>

  return (
    <section className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen">
      
      {/* 1. HEADER & ACTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="text-blue-600" size={32} /> Proposal Management
          </h1>
          <p className="text-slate-500 font-medium">Kelola penawaran harga dan kontrak client.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Cari ID atau Project..."
              className="pl-10 pr-4 py-3 border rounded-2xl bg-white shadow-sm ring-blue-500/10 focus:ring-2 outline-none w-full md:w-72 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all">
            <Plus size={20} /> Create New
          </button>
        </div>
      </div>

      {/* 2. MINI STATS BARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-[1.5rem] p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Approval</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">Rp {stats.totalPending.toLocaleString("id-ID")}</h3>
        </div>
        <div className="bg-green-600 rounded-[1.5rem] p-6 shadow-lg shadow-green-100 text-white">
          <p className="text-[10px] font-black text-green-100 uppercase tracking-widest">Total Approved</p>
          <h3 className="text-2xl font-black mt-1">{stats.countApproved} Proposals</h3>
        </div>
        <div className="bg-slate-900 rounded-[1.5rem] p-6 shadow-sm text-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</p>
          <h3 className="text-2xl font-black mt-1">Rp {stats.totalValue.toLocaleString("id-ID")}</h3>
        </div>
      </div>

      {/* 3. PROPOSAL TABLE */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold">
                <th className="p-5 text-left uppercase tracking-tighter text-xs">Proposal Detail</th>
                <th className="p-5 text-left uppercase tracking-tighter text-xs">Linked RAB & Pipeline</th>
                <th className="p-5 text-left uppercase tracking-tighter text-xs">Total Value</th>
                <th className="p-5 text-left uppercase tracking-tighter text-xs">Status</th>
                <th className="p-5 text-center uppercase tracking-tighter text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((p) => (
                <tr key={p.proposal_id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5">
  {statusConfig[p.status] ? (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${statusConfig[p.status].color}`}
    >
      {statusConfig[p.status].icon}
      {p.status}
    </span>
  ) : (
    <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-gray-100 text-gray-400">
      {p.status || "UNKNOWN"}
    </span>
  )}
</td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <Link href={`/admin/estimator/rab/${p.rab_id}`} className="text-xs font-bold text-slate-600 flex items-center gap-1 hover:text-blue-500">
                        <ExternalLink size={12} /> RAB Source
                      </Link>
                      <Link href={`/admin/crm/pipeline`} className="text-[10px] font-medium text-slate-400 hover:text-slate-600">
                        View in Pipeline
                      </Link>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="font-black text-slate-800 text-base">
                      Rp {p.total_value.toLocaleString("id-ID")}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${statusConfig[p.status]?.color}`}>
                      {statusConfig[p.status]?.icon}
                      {p.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <button title="Download PDF" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
                        <Download size={18} />
                      </button>
                      <button title="Send to Client" className="p-2 text-slate-400 hover:text-green-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
                        <Send size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-800">No proposals found</h3>
            <p className="text-slate-400 text-sm">Coba ganti kata kunci pencarian lo bro.</p>
          </div>
        )}
      </div>
    </section>
  )
}
