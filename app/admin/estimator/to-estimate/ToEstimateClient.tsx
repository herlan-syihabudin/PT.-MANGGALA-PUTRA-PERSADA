"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { formatIDR } from "@/lib/format"

type Inquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai: number
  tanggal_masuk: string
  prioritas?: string
}

export default function ToEstimateClient({ data }: { data: Inquiry[] }) {
  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState("all")

  const filtered = useMemo(() => {
    return data.filter(i => {
      const matchSearch =
        i.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        i.nama_pekerjaan?.toLowerCase().includes(search.toLowerCase())

      const matchPriority =
        priority === "all" ||
        i.prioritas?.toLowerCase() === priority

      return matchSearch && matchPriority
    })
  }, [data, search, priority])

  return (
    <div className="space-y-6">

      {/* FILTER SECTION */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Cari client atau proyek..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm flex-1"
        />

        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">Semua Prioritas</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Client & Proyek</th>
              <th className="p-4 text-right">Estimasi</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map(i => {
              const daysOld = Math.floor(
                (Date.now() - new Date(i.tanggal_masuk).getTime()) /
                (1000 * 3600 * 24)
              )

              return (
                <tr key={i.inquiry_id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-600">
                    {new Date(i.tanggal_masuk).toLocaleDateString("id-ID")}
                    {daysOld > 7 && (
                      <span className="text-xs text-red-500 ml-2">
                        {daysOld} hari
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="font-semibold">
                      {i.customer_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {i.nama_pekerjaan}
                    </div>
                  </td>

                  <td className="p-4 text-right font-bold text-blue-700">
                    {formatIDR(i.estimasi_nilai || 0)}
                  </td>

                  <td className="p-4 text-center">
                    <Link
                      href={`/admin/estimator/rab/create?from=${i.inquiry_id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md"
                    >
                      Buat RAB
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {filtered.map(i => (
          <div key={i.inquiry_id} className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">
              {new Date(i.tanggal_masuk).toLocaleDateString("id-ID")}
            </p>
            <p className="font-bold mt-2">{i.customer_name}</p>
            <p className="text-sm text-gray-600">{i.nama_pekerjaan}</p>
            <p className="text-blue-600 font-bold mt-2">
              {formatIDR(i.estimasi_nilai)}
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}
