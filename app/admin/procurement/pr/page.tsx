'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, RefreshCcw } from 'lucide-react'
import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import Money from '@/components/dashboard/procurement/Money'
import DateText from '@/components/dashboard/procurement/DateText'

interface PR {
  pr_id: string
  pr_code: string
  project_id: string
  project_name?: string
  requested_by: string
  request_date: string
  needed_date?: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ORDERED'
  items: any[]
}

export default function PRListPage() {
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  const [prs, setPRs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  async function fetchPRs() {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/procurement/pr', {
        signal: controller.signal
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load PRs')
      }

      setPRs(data.data || [])
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setError(err?.message || 'Failed to load PRs')
      setPRs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPRs()
    return () => abortRef.current?.abort()
  }, [])

  const computedPRs = useMemo(() => {
    return prs.map(pr => ({
      ...pr,
      total: pr.items?.reduce(
        (sum, item) => sum + (item.subtotal || 0),
        0
      ) || 0
    }))
  }, [prs])

  const filteredPRs = useMemo(() => {
    return computedPRs.filter(pr => {
      const matchesSearch =
        search === '' ||
        pr.pr_code.toLowerCase().includes(search.toLowerCase()) ||
        pr.project_name?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === '' || pr.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [computedPRs, search, statusFilter])

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
          onClick={() => fetchPRs()}
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
          <h1 className="text-2xl font-bold">Purchase Requests</h1>
          <p className="text-sm text-gray-500">
            Total: {filteredPRs.length} PR
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchPRs()}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCcw size={16} />
          </button>

          <Link
            href="/procurement/pr/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            New PR
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
            placeholder="Search PR..."
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
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ORDERED">Ordered</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left">PR Number</th>
                <th className="p-4 text-left">Project</th>
                <th className="p-4 text-left">Request Date</th>
                <th className="p-4 text-left">Need By</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPRs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-gray-500"
                  >
                    No Purchase Request found
                  </td>
                </tr>
              ) : (
                filteredPRs.map((pr) => (
                  <tr
                    key={pr.pr_id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/procurement/pr/${pr.pr_id}`)
                    }
                  >
                    <td className="p-4 font-mono font-medium">
                      {pr.pr_code}
                    </td>

                    <td className="p-4">
                      {pr.project_name || pr.project_id}
                    </td>

                    <td className="p-4">
                      <DateText date={pr.request_date} />
                    </td>

                    <td className="p-4">
                      {pr.needed_date ? (
                        <DateText date={pr.needed_date} />
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="p-4 text-right font-medium">
                      <Money value={pr.total} />
                    </td>

                    <td className="p-4">
                      <StatusBadge
                        status={pr.status}
                        type="pr"
                      />
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center">
                        <Link
                          href={`/procurement/pr/${pr.pr_id}`}
                          className="p-2 hover:bg-gray-100 rounded"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          <Eye
                            size={16}
                            className="text-blue-600"
                          />
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
