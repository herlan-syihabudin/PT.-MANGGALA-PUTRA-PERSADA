'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  Tag, 
  Box,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  Building2,
  RefreshCcw,
  AlertCircle,
  Trash2
} from 'lucide-react'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import Money from '@/components/dashboard/procurement/Money'
import DateText from '@/components/dashboard/procurement/DateText'

interface Material {
  material_id: string
  material_code: string
  material_name: string
  category?: string
  unit: string
  default_price?: number
  last_price?: number
  min_stock?: number
  location?: string
  status: 'ACTIVE' | 'INACTIVE'
  created_by?: string
  updated_by?: string
  deleted_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export default function MaterialDetailPage() {
  const params = useParams()
  const router = useRouter()
  const material_id = params.id as string

  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchMaterial()
  }, [material_id])

  async function fetchMaterial() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/procurement/materials/${material_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load material')
      }

      setMaterial(data.data)
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/procurement/materials/${material_id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete material')
      }

      router.push('/admin/procurement/materials')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-red-600 font-medium">{error || 'Material not found'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{material.material_name}</h1>
              <StatusBadge status={material.status} type="vendor" />
            </div>
            <p className="text-sm text-gray-500">
              Code: {material.material_code}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/procurement/materials/${material_id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Edit</span>
          </Link>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            onClick={fetchMaterial}
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCcw size={16} className={actionLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info Card */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Material Information</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <DetailItem
                icon={Package}
                label="Material Name"
                value={material.material_name}
              />
              <DetailItem
                icon={Tag}
                label="Category"
                value={material.category || '-'}
              />
              <DetailItem
                icon={Box}
                label="Unit"
                value={material.unit}
              />
              <DetailItem
                icon={MapPin}
                label="Location"
                value={material.location || '-'}
              />
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-blue-600" />
              Pricing Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500">Default Price</p>
                <p className="text-xl font-bold text-blue-600">
                  {material.default_price ? <Money value={material.default_price} /> : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Price</p>
                <p className="text-xl font-bold text-gray-900">
                  {material.last_price ? <Money value={material.last_price} /> : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Minimum Stock</p>
                <p className="text-lg font-semibold">
                  {material.min_stock ? `${material.min_stock} ${material.unit}` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">

          {/* Summary Card */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={material.status} type="vendor" />
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{material.category || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Unit</span>
                <span className="font-medium">{material.unit}</span>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <TimelineItem
                icon={Calendar}
                label="Created"
                date={material.created_at}
                user={material.created_by}
              />
              {material.updated_at && material.updated_at !== material.created_at && (
                <TimelineItem
                  icon={Clock}
                  label="Last Updated"
                  date={material.updated_at}
                  user={material.updated_by}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Delete Material</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{material.material_name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
function DetailItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    </div>
  )
}

function TimelineItem({ icon: Icon, label, date, user }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-gray-100 rounded-lg">
        <Icon size={14} className="text-gray-600" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {date && (
          <p className="text-xs text-gray-600">
            <DateText date={date} format="long" />
          </p>
        )}
        {user && <p className="text-xs text-gray-400">by {user}</p>}
      </div>
    </div>
  )
}
