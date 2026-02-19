'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, RefreshCcw, AlertCircle } from 'lucide-react'

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
  notes?: string
  created_at?: string
  updated_at?: string
}

export default function POListPage() {
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  const [pos, setPOs] = useState<PO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<any>(null)

  async function fetchPOs() {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      setError(null)
      setDebugInfo(null)

      console.log('🔍 Fetching POs...')
      const res = await fetch('/api/procurement/po', {
        signal: controller.signal,
      })
      
      console.log('🔍 Response status:', res.status)
      
      let data
      try {
        data = await res.json()
      } catch (e) {
        throw new Error('Invalid JSON response from server')
      }
      
      console.log('🔍 API Response:', data)
      setDebugInfo(data)

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'API returned unsuccessful')
      }

      if (!Array.isArray(data.data)) {
        console.warn('⚠️ data.data is not an array:', data.data)
        setPOs([])
      } else {
        console.log(`🔍 Received ${data.data.length} POs`)
        setPOs(data.data)
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('🔍 Fetch aborted')
        return
      }
      console.error('❌ Fetch error:', err)
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

  const computedPOs = useMemo(() => {
    return pos.map(po => ({
      ...po,
      _vendor: po.vendor_name || po.vendor_id,
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
      <div className="p-8 space-y-6">
        <div className="h-8 w-60 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-red-600 font-medium">{error}</div>
          
          {debugInfo && (
            <div className="mt-4 p-4 bg-white rounded-lg text-left">
              <p className="text-xs font-mono text-gray-600 mb-2">Debug Info:</p>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <button
            onClick={() => fetchPOs()}
            className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <RefreshCcw size={16} />
            Retry
          </button>
        </div>
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
            Total: {filteredPOs.length} PO • 
            <span className="ml-1">
              {filteredPOs.filter(p => p.status === 'DRAFT').length} Draft
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchPOs()}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCcw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/admin/procurement/po/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New PO</span>
            <span className="sm:hidden">New</span>
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
            placeholder="Search by PO number, vendor, or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white min-w-[150px]"
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-medium text-gray-600">PO Number</th>
                <th className="p-4 text-left font-medium text-gray-600">Vendor</th>
                <th className="p-4 text-left font-medium text-gray-600">Project</th>
                <th className="p-4 text-left font-medium text-gray-600">Order Date</th>
                <th className="p-4 text-right font-medium text-gray-600">Amount</th>
                <th className="p-4 text-left font-medium text-gray-600">Status</th>
                <th className="p-4 text-center font-medium text-gray-600">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <div className="space-y-2">
                      <p className="text-lg">📦</p>
                      <p className="font-medium">No Purchase Order found</p>
                      {search && (
                        <p className="text-sm text-gray-400">
                          No results for "{search}". Try different keywords.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => (
                  <tr
                    key={po.po_id}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/procurement/po/${po.po_id}`)}
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
                          href={`/admin/procurement/po/${po.po_id}`}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
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

        {/* Footer */}
        {filteredPOs.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500 flex justify-between">
            <span>Showing {filteredPOs.length} of {pos.length} POs</span>
            <span>Last updated: {new Date().toLocaleTimeString('id-ID')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
