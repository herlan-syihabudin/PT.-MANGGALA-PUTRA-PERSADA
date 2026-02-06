"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

export const dynamic = "force-dynamic"

type Employee = {
  employee_id: string
  nama_lengkap: string
  divisi?: string
  jabatan?: string
}

type StatusRow = {
  employee_id: string
  status: string
  jenis_status: string
  lokasi_kerja: string
  start_date: string
  end_date: string
  is_current: string
  created_at: string
  updated_by: string
  keterangan: string
}

export default function EmployeeStatusPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [statuses, setStatuses] = useState<StatusRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)

        const [empRes, statusRes] = await Promise.all([
          fetch("/api/hr/employees", { cache: "no-store" }),
          fetch("/api/hr/employment-status", { cache: "no-store" }),
        ])

        const empData = await empRes.json()
        const statusData = await statusRes.json()

        setEmployees(empData || [])
        setStatuses(statusData.data || [])
      } catch (e) {
        console.error("LOAD EMPLOYEE STATUS PAGE ERROR:", e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Map employee_id -> current status (is_current === TRUE)
  const currentStatusMap = useMemo(() => {
    const map: Record<string, StatusRow> = {}
    for (const row of statuses) {
      if (String(row.is_current).toUpperCase() === "TRUE") {
        map[row.employee_id] = row
      }
    }
    return map
  }, [statuses])

  // Filter employees by search + status
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const text = (
        emp.employee_id +
        " " +
        emp.nama_lengkap +
        " " +
        (emp.divisi || "") +
        " " +
        (emp.jabatan || "")
      )
        .toLowerCase()
        .trim()

      const matchesSearch = text.includes(search.toLowerCase().trim())

      if (!matchesSearch) return false

      if (!statusFilter) return true

      const current = currentStatusMap[emp.employee_id]
      const currStatus = current?.status?.toLowerCase() || "belum diset"

      if (statusFilter === "no-status") {
        return !current
      }

      return currStatus === statusFilter.toLowerCase()
    })
  }, [employees, search, statusFilter, currentStatusMap])

  // Summary KPI
  const totalEmployee = employees.length
  const withStatus = Object.keys(currentStatusMap).length
  const withoutStatus = totalEmployee - withStatus

  return (
    <section className="p-6 md:p-10 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Employment Status
        </h1>
        <p className="text-sm text-gray-500">
          Kelola status kerja karyawan (aktif, mutasi, resign, dll)
        </p>
      </div>

      {/* SUMMARY KPI */}
      <div className="grid gap-4 sm:grid-cols-3 max-w-3xl">
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">
            Total Karyawan
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalEmployee}
          </p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">
            Punya Status Aktif
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {withStatus}
          </p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-500">
            Belum Diset
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {withoutStatus}
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari karyawan / divisi / jabatan..."
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="KONTRAK">Kontrak</option>
            <option value="MUTASI">Mutasi</option>
            <option value="RESIGN">Resign</option>
            <option value="no-status">Belum Diset</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading data karyawan...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="text-xs text-gray-500 uppercase tracking-wide">
                <th className="p-3">Employee ID</th>
                <th className="p-3">Nama</th>
                <th className="p-3">Divisi</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3">Status Aktif</th>
                <th className="p-3">Sejak</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((emp) => {
                const current = currentStatusMap[emp.employee_id]
                const status = current?.status || "Belum diset"
                const since = current?.start_date || "-"

                const isNoStatus = !current

                let badgeClass =
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"

                if (isNoStatus) {
                  badgeClass +=
                    " bg-amber-50 text-amber-700 border border-amber-100"
                } else {
                  const upper = status.toUpperCase()
                  if (upper === "AKTIF") {
                    badgeClass +=
                      " bg-emerald-50 text-emerald-700 border border-emerald-100"
                  } else if (upper === "KONTRAK") {
                    badgeClass +=
                      " bg-yellow-50 text-yellow-700 border border-yellow-100"
                  } else if (upper === "RESIGN") {
                    badgeClass +=
                      " bg-rose-50 text-rose-700 border border-rose-100"
                  } else {
                    badgeClass +=
                      " bg-blue-50 text-blue-700 border border-blue-100"
                  }
                }

                return (
                  <tr
                    key={emp.employee_id}
                    className="border-t hover:bg-gray-50/70"
                  >
                    <td className="p-3 font-mono text-xs text-gray-700">
                      {emp.employee_id}
                    </td>
                    <td className="p-3 text-gray-900">
                      {emp.nama_lengkap}
                    </td>
                    <td className="p-3 text-gray-700">
                      {emp.divisi || "-"}
                    </td>
                    <td className="p-3 text-gray-700">
                      {emp.jabatan || "-"}
                    </td>
                    <td className="p-3">
                      <span className={badgeClass}>{status}</span>
                    </td>
                    <td className="p-3 text-gray-600 text-xs">
                      {since}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/hr/employment-status/${emp.employee_id}`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Lihat Status →
                      </Link>
                    </td>
                  </tr>
                )
              })}

              {!loading && filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-gray-400 text-sm"
                  >
                    Tidak ada karyawan yang cocok dengan filter
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
