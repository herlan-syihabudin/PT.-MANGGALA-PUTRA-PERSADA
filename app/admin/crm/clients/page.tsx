"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export const dynamic = "force-dynamic"

type Customer = {
  customer_id: string
  company_name: string
  customer_type: string
  pic_name: string
  phone: string
  email: string
  city: string
  status: string
}

/* ==============================
   PAGE
================================ */
export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers", { cache: "no-store" })
      const data = await res.json()
      setCustomers(data || [])
    } catch (e) {
      console.error("Failed fetch customers", e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers.filter((c) =>
    `${c.company_name} ${c.pic_name} ${c.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customer</h1>
          <p className="text-sm text-gray-500">
            Master data customer / owner proyek
          </p>
        </div>

        <Link
          href="/admin/crm/clients/create"
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + Tambah Customer
        </Link>
      </div>

      {/* SEARCH */}
      <div>
        <input
          placeholder="Cari nama perusahaan / PIC / telepon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border rounded px-4 py-2"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Perusahaan</th>
              <th className="p-3">PIC</th>
              <th className="p-3">Telepon</th>
              <th className="p-3">Kota</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Data customer tidak ditemukan
                </td>
              </tr>
            )}

            {filtered.map((c) => (
              <tr key={c.customer_id} className="border-t">
                <td className="p-3 font-medium">
                  <Link
                    href={`/admin/crm/customers/${c.customer_id}`}
                    className="text-red-600 hover:underline"
                  >
                    {c.company_name}
                  </Link>
                </td>
                <td className="p-3">{c.pic_name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.city || "-"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <Link
                    href={`/admin/crm/customers/${c.customer_id}`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Detail
                  </Link>
                  <Link
                    href={`/admin/crm/customers/${c.customer_id}/edit`}
                    className="text-gray-700 hover:underline text-xs"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
