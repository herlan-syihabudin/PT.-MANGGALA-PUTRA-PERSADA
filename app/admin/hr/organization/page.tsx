"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type OrgRow = {
  employee_id: string
  nama_lengkap: string
  divisi: string
  jabatan: string
  atasan: string
  status: "AKTIF" | "BELUM DISET"
}

export default function OrganizationPage() {
  const [rows, setRows] = useState<OrgRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/hr/organization", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRows(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Organization Structure</h1>
        <p className="text-sm text-gray-500">
          Struktur organisasi karyawan berdasarkan Employee Master
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Divisi</th>
                <th className="p-3 text-left">Jabatan</th>
                <th className="p-3 text-left">Atasan</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.employee_id} className="border-t">
                  {/* EMPLOYEE */}
                  <td className="p-3">
                    <div className="font-semibold text-gray-900">
                      {r.nama_lengkap}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {r.employee_id}
                    </div>
                  </td>

                  {/* DIVISI */}
                  <td className="p-3">{r.divisi || "-"}</td>

                  {/* JABATAN */}
                  <td className="p-3">{r.jabatan || "-"}</td>

                  {/* ATASAN */}
                  <td className="p-3">{r.atasan || "-"}</td>

                  {/* STATUS */}
                  <td className="p-3">
                    {r.status === "AKTIF" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                        AKTIF
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                        BELUM DISET
                      </span>
                    )}
                  </td>

                  {/* AKSI */}
                  <td className="p-3">
                    <Link
                      href={`/admin/hr/organization/${r.employee_id}`}
                      className="text-blue-600 text-xs font-semibold hover:underline"
                    >
                      Atur →
                    </Link>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-gray-500">
                    Belum ada data karyawan
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
