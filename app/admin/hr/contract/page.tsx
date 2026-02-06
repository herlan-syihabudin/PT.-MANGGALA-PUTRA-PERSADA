"use client"

import { useEffect, useState } from "react"

type Contract = {
  contract_id: string
  employee_id: string
  nama_lengkap: string
  type_karyawan: string
  jabatan: string
  project_code: string
  lokasi_kerja: string
  start_date: string
  end_date: string
  status_kontrak: string
  sistem_bayar: string
  rate: string
  keterangan: string
}

export default function ContractPage() {
  const [data, setData] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("AKTIF")

  useEffect(() => {
    loadData()
  }, [status])

  async function loadData() {
    setLoading(true)
    const res = await fetch(`/api/hr/contract?status=${status}`)
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
          Kontrak karyawan, tenaga harian, mandor, dan tim lapangan
        </p>
      </div>

      {/* FILTER */}
      <div className="flex gap-3">
        <button
          onClick={() => setStatus("AKTIF")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            status === "AKTIF"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Aktif
        </button>
        <button
          onClick={() => setStatus("NONAKTIF")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            status === "NONAKTIF"
              ? "bg-gray-900 text-white"
              : "bg-gray-200"
          }`}
        >
          Nonaktif
        </button>
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
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-400">
                  Loading data...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-400">
                  Tidak ada kontrak
                </td>
              </tr>
            )}

            {data.map((c) => (
              <tr
                key={c.contract_id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-left font-medium">
                  {c.nama_lengkap}
                  <div className="text-xs text-gray-400">
                    {c.employee_id}
                  </div>
                </td>
                <td className="px-4 py-3">{c.type_karyawan}</td>
                <td className="px-4 py-3">{c.jabatan}</td>
                <td className="px-4 py-3">{c.project_code}</td>
                <td className="px-4 py-3">{c.start_date}</td>
                <td className="px-4 py-3">
                  {c.end_date || "-"}
                </td>
                <td className="px-4 py-3">{c.sistem_bayar}</td>
                <td className="px-4 py-3">
                  Rp {Number(c.rate).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      c.status_kontrak === "AKTIF"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {c.status_kontrak}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
