"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type ContractRow = {
  employee_id: string
  nama: string
  type: string
  jabatan: string
  project: string
  mulai: string
  akhir: string
  sistem: string
  rate: string
  status: "AKTIF" | "BELUM ADA KONTRAK"
}

export default function ContractPage() {
  const [data, setData] = useState<ContractRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const res = await fetch("/api/hr/contract-management", {
      cache: "no-store",
    })
    const json = await res.json()
    setData(json.data || [])
    setLoading(false)
  }

  return (
    <section className="p-6 md:p-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Contract Management
        </h1>
        <p className="text-gray-600">
          Kontrak karyawan tetap, kontrak, tenaga harian, mandor, dan tim lapangan
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Mulai</th>
              <th className="px-4 py-3">Akhir</th>
              <th className="px-4 py-3">Sistem</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-gray-400">
                  Loading data...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-gray-400">
                  Tidak ada data karyawan
                </td>
              </tr>
            )}

            {data.map((row) => (
              <tr
                key={row.employee_id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-left font-medium">
                  {row.nama}
                  <div className="text-xs text-gray-400">
                    {row.employee_id}
                  </div>
                </td>

                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.jabatan}</td>
                <td className="px-4 py-3">{row.project}</td>
                <td className="px-4 py-3">{row.mulai}</td>
                <td className="px-4 py-3">{row.akhir}</td>
                <td className="px-4 py-3">{row.sistem}</td>

                <td className="px-4 py-3">
                  {row.rate !== "-" ? (
                    <>Rp {Number(row.rate).toLocaleString("id-ID")}</>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      row.status === "AKTIF"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  {row.status === "BELUM ADA KONTRAK" ? (
                    <Link
                      href={`/admin/hr/contract/${row.employee_id}`}
                      className="text-blue-600 hover:underline text-xs font-semibold"
                    >
                      + Buat Kontrak
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/hr/contract/${row.employee_id}`}
                      className="text-gray-700 hover:underline text-xs"
                    >
                      Lihat / Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
