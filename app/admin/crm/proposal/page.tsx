"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  FileText,
  Search,
  Plus,
  ExternalLink,
  Download,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"

/* ================= TYPES ================= */

type Proposal = {
  proposal_id: string
  pipeline_id: string
  rab_id: string
  total_value: number
  status: string
  created_at: string
}

/* ================= STATUS CONFIG ================= */

const statusConfig: Record<
  string,
  { color: string; icon: JSX.Element }
> = {
  DRAFT: {
    color: "bg-gray-100 text-gray-600",
    icon: <Clock size={12} />,
  },
  SENT: {
    color: "bg-blue-100 text-blue-700",
    icon: <Send size={12} />,
  },
  APPROVED: {
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={12} />,
  },
  REJECTED: {
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={12} />,
  },
  EXPIRED: {
    color: "bg-orange-100 text-orange-700",
    icon: <AlertCircle size={12} />,
  },
}

/* ================= COMPONENT ================= */

export default function ProposalPage() {
  const [data, setData] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/crm/proposal")
        const json = await res.json()
        setData(json || [])
      } catch (e) {
        console.error("Gagal ambil proposal", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  /* ================= STATS ================= */

  const stats = useMemo(() => {
    return {
      totalPending: data
        .filter((p) => p.status === "SENT")
        .reduce((s, p) => s + p.total_value, 0),
      countApproved: data.filter((p) => p.status === "APPROVED").length,
      totalValue: data.reduce((s, p) => s + p.total_value, 0),
    }
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter((p) =>
      p.proposal_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  if (loading)
    return (
      <div className="p-10 text-center text-gray-400 font-bold tracking-widest">
        LOADING PROPOSALS...
      </div>
    )

  return (
    <section className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            Proposal Management
          </h1>
          <p className="text-sm text-gray-500">
            Kelola penawaran harga dan kontrak client.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari Proposal ID..."
              className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none w-60"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg font-semibold flex items-center gap-2 shadow">
            <Plus size={16} />
            Create
          </button>
        </div>
      </div>

      {/* MINI STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-400 uppercase font-bold">
            Awaiting Approval
          </p>
          <h3 className="text-lg font-bold mt-1">
            Rp {stats.totalPending.toLocaleString("id-ID")}
          </h3>
        </div>

        <div className="bg-green-600 text-white p-4 rounded-xl shadow">
          <p className="text-xs uppercase font-bold text-green-100">
            Approved
          </p>
          <h3 className="text-lg font-bold mt-1">
            {stats.countApproved} Proposal
          </h3>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl shadow">
          <p className="text-xs uppercase font-bold text-slate-400">
            Total Value
          </p>
          <h3 className="text-lg font-bold mt-1">
            Rp {stats.totalValue.toLocaleString("id-ID")}
          </h3>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="p-4 text-left">Proposal</th>
                <th className="p-4 text-left">RAB</th>
                <th className="p-4 text-left">Value</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((p) => (
                <tr
                  key={p.proposal_id}
                  className="border-b hover:bg-gray-50"
                >
                  {/* Proposal ID */}
                  <td className="p-4 font-semibold text-blue-600">
                    <Link href={`/admin/crm/proposal/${p.proposal_id}`}>
                      {p.proposal_id}
                    </Link>
                    <div className="text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString("id-ID")}
                    </div>
                  </td>

                  {/* RAB */}
                  <td className="p-4">
                    <Link
                      href={`/admin/estimator/rab/${p.rab_id}`}
                      className="text-gray-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      {p.rab_id}
                    </Link>
                  </td>

                  {/* Value */}
                  <td className="p-4 font-bold">
                    Rp {p.total_value.toLocaleString("id-ID")}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        statusConfig[p.status]?.color ||
                        "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {statusConfig[p.status]?.icon}
                      {p.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600">
                        <Send size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            No proposals found.
          </div>
        )}
      </div>
    </section>
  )
}
