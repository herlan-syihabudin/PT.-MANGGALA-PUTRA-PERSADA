"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function OrganizationPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/hr/organization", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRows(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Organization Structure</h1>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Divisi</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3">Atasan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.employee_id} className="border-t">
                  <td className="p-3">
                    <div className="font-semibold">{r.nama_lengkap}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {r.employee_id}
                    </div>
                  </td>
                  <td className="p-3">{r.divisi}</td>
                  <td className="p-3">{r.jabatan}</td>
                  <td className="p-3">{r.atasan}</td>
                  <td className="p-3">
                    {r.is_assigned ? (
                      <span className="text-emerald-600 text-xs font-semibold">
                        AKTIF
                      </span>
                    ) : (
                      <span className="text-amber-600 text-xs font-semibold">
                        BELUM DISET
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/hr/organization/${r.employee_id}`}
                      className="text-blue-600 text-xs font-semibold"
                    >
                      Atur →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
