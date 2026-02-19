'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, RefreshCcw } from 'lucide-react'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import Money from '@/components/dashboard/procurement/Money'
import DateText from '@/components/dashboard/procurement/DateText'

interface PO {
  po_id: string
  po_code: string
  vendor_id: string
  vendor_name?: string
  project_id: string
  project_name?: string
  order_date: string
  delivery_date?: string
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'DELIVERED' | 'CLOSED'
  total_amount: number
  version?: number
}

export default function POListPage() {
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  const [pos, setPOs] = useState<PO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  async function fetchPOs() {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/procurement/po', {
        signal: controller.signal,
      })
      
      const data = await res.json()
      console.log('API Response:', data) // 👈 Debug

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load POs')
      }

      setPOs(data.data || [])
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error('Fetch error:', err)
      setError(err?.message || 'Failed to load POs')
      setPOs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPOs()
    return () => abortRef.current?.abort()
  }, [])

  // 🔥 Ambil data vendor & project (mock - nanti ganti dengan join)
  const computedPOs = useMemo(() => {
    return pos.map(po => ({
      ...po,
      _vendor: po.vendor_name || po.vendor_id, // Sementara pake ID
      _project: po.project_name || po.project_id,
    }))
  }, [pos])

  const filteredPOs = useMemo(() => {
    const q = search.trim().toLowerCase()
    const s = statusFilter.trim()

    return computedPOs.filter(po => {
      const matchesSearch =
        q === '' ||
        po.po_code?.toLowerCase().includes(q) ||
        po._vendor?.toLowerCase().includes(q) ||
        po._project?.toLowerCase().includes(q)

      const matchesStatus = s === '' || po.status === s
      return matchesSearch && matchesStatus
    })
  }, [computedPOs, search, statusFilter])

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-60 bg-gray-200 rounded" />
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-600 font-medium">{error}</div>
        <button
          onClick={() => fetchPOs()}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCcw size={16} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-sm text-gray-500">
            Total: {filteredPOs.length} PO
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchPOs()}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCcw size={16} />
          </button>

          {/* 🔥 FIX: Tambah /admin/ */}
          <Link
            href="/admin/procurement/po/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            New PO
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search PO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left">PO Number</th>
                <th className="p-4 text-left">Vendor</th>
                <th className="p-4 text-left">Project</th>
                <th className="p-4 text-left">Order Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    No Purchase Order found
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => (
                  <tr
                    key={po.po_id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/procurement/po/${po.po_id}`)} // 🔥 FIX
                  >
                    <td className="p-4 font-mono font-medium">
                      {po.po_code}
                    </td>

                    <td className="p-4">
                      {po._vendor}
                    </td>

                    <td className="p-4">
                      {po._project}
                    </td>

                    <td className="p-4">
                      <DateText date={po.order_date} />
                    </td>

                    <td className="p-4 text-right font-medium">
                      <Money value={po.total_amount || 0} />
                    </td>

                    <td className="p-4">
                      <StatusBadge status={po.status} type="po" />
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/procurement/po/${po.po_id}`} // 🔥 FIX
                          className="p-2 hover:bg-gray-100 rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye size={16} className="text-blue-600" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  )
}
