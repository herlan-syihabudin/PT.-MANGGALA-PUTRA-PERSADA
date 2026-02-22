"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, Plus, RefreshCw, Eye } from "lucide-react"

type BoqHeader = {
  boq_id: string
  project_id: string
  project_name: string
  customer_name: string
  status: string
  total_items: number
  created_at: string
}

export default function BoqListPage() {
  const [data, setData] = useState<BoqHeader[]>([])
  const [loading, setLoading] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch("/api/estimator/boq")
      const json = await res.json()
      setData(json || [])
    } catch (err) {
      console.error("Error load BOQ list:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 rounded-xl">
              <FileText className="text-slate-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-light text-slate-800">
                BOQ List
              </h1>
              <p className="text-xs text-slate-500">
                Daftar Bill of Quantity Project
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <RefreshCw size={16} />
            </button>

            <Link
              href="/admin/estimator/boq/new"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700"
            >
              <Plus size={16} />
              New BOQ
            </Link>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 text-left text-xs uppercase text-slate-500">
                  BOQ ID
                </th>
                <th className="p-3 text-left text-xs uppercase text-slate-500">
                  Project
                </th>
                <th className="p-3 text-left text-xs uppercase text-slate-500">
                  Customer
                </th>
                <th className="p-3 text-center text-xs uppercase text-slate-500">
                  Items
                </th>
                <th className="p-3 text-center text-xs uppercase text-slate-500">
                  Status
                </th>
                <th className="p-3 text-center text-xs uppercase text-slate-500">
                  Created
                </th>
                <th className="p-3 text-center text-xs uppercase text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Belum ada BOQ
                  </td>
                </tr>
              )}

              {data.map((boq) => (
                <tr
                  key={boq.boq_id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="p-3 font-mono text-slate-600">
                    {boq.boq_id}
                  </td>
                  <td className="p-3 text-slate-700">
                    {boq.project_name}
                  </td>
                  <td className="p-3 text-slate-600">
                    {boq.customer_name}
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-700">
                    {boq.total_items}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-lg ${
                      boq.status === "DRAFT"
                        ? "bg-amber-100 text-amber-600"
                        : boq.status === "LOCKED"
                        ? "bg-slate-200 text-slate-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}>
                      {boq.status}
                    </span>
                  </td>
                  <td className="p-3 text-center text-slate-500 text-xs">
                    {new Date(boq.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/admin/estimator/boq/${boq.boq_id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50"
                    >
                      <Eye size={14} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
