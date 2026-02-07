"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

export const dynamic = "force-dynamic"

type EmploymentRow = {
  employee_id: string
  nama_lengkap: string
  divisi?: string
  jabatan?: string
  tipe_karyawan?: string
  lokasi_kerja?: string
  status_aktif: string
  sejak: string
  is_current: boolean
}

export default function EmployeeStatusPage() {
  const [rows, setRows] = useState<EmploymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/hr/employment-status/join", {
          cache: "no-store",
        })
        const json = await res.json()
        setRows(json.data || [])
      } catch (err) {
        console.error("LOAD EMPLOYMENT STATUS ERROR:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const text = (
        r.employee_id +
        " " +
        r.nama_lengkap +
        " " +
        (r.divisi || "") +
        " " +
        (r.jabatan || "")
      )
        .toLowerCase()
        .trim()

      if (!text.includes(search.toLowerCase().trim())) return false

      if (!statusFilter) return true

      if (statusFilter === "no-status") {
        return r.status_aktif === "Belum diset"
      }

      return r.status_aktif === statusFilter
    })
  }, [rows, search, statusFilter])

  /* ================= KPI ================= */

  const totalEmployee = rows.length
  const withStatus = rows.filter(
    (r) => r.status_aktif !== "Belum diset"
  ).length
  const withoutStatus = totalEmployee - withStatus

  /* ================= BADGE ================= */

  function badgeClass(status: string) {
    let base =
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border"

    switch (status) {
      case "AKTIF":
        return `${base} bg-emerald-50 text-emerald-700 border-emerald-100`
      case "KONTRAK":
        return `${base} bg-yellow-50 text-yellow-700 border-yellow-100`
      case "RESIGN":
        return `${base} bg-rose-50 text-rose-700 border-rose-100`
      case "MUTASI":
        return `${base} bg-blue-50 text-blue-700 border-blue-100`
      default:
        return `${base} bg-amber-50 text-amber-700 border-amber-100`
    }
  }

  /* ================= RENDER ================= */

  return (
    <section className="p-6 md:p-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Employment Status
        </h1>
        <p className="text-sm text-gray-500">
          Kelola status kerja karyawan (aktif, mutasi, resign, dll)
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3 max-w-3xl">
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-xs text-gray-500">Total Karyawan</p>
          <p className="text-2xl font-bold">{totalEmployee}</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-xs text-gray-500">Punya Status Aktif</p>
          <p className="text-2xl font-bold text-emerald-600">
            {withStatus}
          </p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-xs text-gray-500">Belum Diset</p>
          <p className="text-2xl font-bold text-amber-600">
            {withoutStatus}
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari karyawan / divisi / jabatan..."
          className="w-full sm:max-w-md rounded-lg border px-3 py-2 text-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm bg-white"
        >
          <option value="">Semua Status</option>
          <option value="AKTIF">Aktif</option>
          <option value="KONTRAK">Kontrak</option>
          <option value="MUTASI">Mutasi</option>
          <option value="RESIGN">Resign</option>
          <option value="no-status">Belum Diset</option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading data...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Divisi</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Sejak</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.employee_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">
                    {r.employee_id}
                  </td>
                  <td className="p-3">{r.nama_lengkap}</td>
                  <td className="p-3">{r.divisi || "-"}</td>
                  <td className="p-3">{r.jabatan || "-"}</td>
                  <td className="p-3">
                    <span className={badgeClass(r.status_aktif)}>
                      {r.status_aktif}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-600">
                    {r.sejak}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/hr/employment-status/${r.employee_id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Lihat Status →
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-gray-400 text-sm"
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
