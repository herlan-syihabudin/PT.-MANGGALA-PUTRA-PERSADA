'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, RefreshCcw } from 'lucide-react'

interface GR {
  gr_id: string
  gr_code: string
  po_id: string
  po_code?: string
  receive_date: string
  created_by: string
  notes?: string
  status?: string
  item_count?: number
}

export default function GRListPage() {
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  const [grs, setGRs] = useState<GR[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  /* ================= FETCH ================= */

  async function fetchGRs() {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/procurement/gr', {
        signal: controller.signal,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load GR')
      }

      setGRs(data.data || [])
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setError(err?.message || 'Failed to load GR')
      setGRs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGRs()
    return () => abortRef.current?.abort()
  }, [])

  /* ================= FILTER ================= */

  const filteredGRs = useMemo(() => {
    return grs.filter(gr => {
      const matchesSearch =
        search === '' ||
        gr.gr_code?.toLowerCase().includes(search.toLowerCase()) ||
        gr.po_code?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === '' ||
        (gr.status || 'RECEIVED') === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [grs, search, statusFilter])

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-60 bg-gray-200 rounded" />
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-600 font-medium">
          {error}
        </div>
        <button
          onClick={() => fetchGRs()}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCcw size={16} />
          Retry
        </button>
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Goods Receipt
          </h1>
          <p className="text-sm text-gray-500">
            Total: {filteredGRs.length} GR
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchGRs()}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCcw size={16} />
          </button>

          <Link
            href="/admin/procurement/gr/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            New GR
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
            placeholder="Search GR or PO..."
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
          <option value="RECEIVED">Received</option>
          <option value="PARTIAL">Partial</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left">GR Code</th>
                <th className="p-4 text-left">PO Code</th>
                <th className="p-4 text-left">Receive Date</th>
                <th className="p-4 text-left">Created By</th>
                <th className="p-4 text-left">Items</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredGRs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    No Goods Receipt found
                  </td>
                </tr>
              ) : (
                filteredGRs.map((gr) => (
                  <tr
                    key={gr.gr_id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/procurement/gr/${gr.gr_id}`)
                    }
                  >
                    <td className="p-4 font-mono font-medium">
                      {gr.gr_code}
                    </td>

                    <td className="p-4">
                      {gr.po_code || gr.po_id}
                    </td>

                    <td className="p-4">
                      {new Date(gr.receive_date).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      {gr.created_by}
                    </td>

                    <td className="p-4">
                      {gr.item_count || 0}
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        gr.status === 'PARTIAL'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {gr.status || 'RECEIVED'}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/procurement/gr/${gr.gr_id}`}
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
