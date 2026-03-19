'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Edit,
  RefreshCcw,
  Trash2,
  History,
  Copy,
  Check,
  Power
} from 'lucide-react'
import { toast } from 'sonner'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'

interface Vendor {
  vendor_id: string
  vendor_code: string
  vendor_name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  bank_name?: string
  bank_account?: string
  npwp?: string
  status: 'ACTIVE' | 'INACTIVE'
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

// ========== UTILITIES ==========
function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function maskAccount(value?: string) {
  if (!value) return '-'
  if (value.length <= 4) return value
  return '•••• ' + value.slice(-4)
}

function maskNPWP(value?: string) {
  if (!value) return '-'
  if (value.length <= 4) return value
  return '••••••' + value.slice(-4)
}

// ========== COPYABLE COMPONENT ==========
function CopyableText({ text, label }: { text?: string; label: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopied(false), 2000)
  }
  
  if (!text) return <span className="text-gray-400">-</span>
  
  return (
    <div className="flex items-center gap-2 group">
      <span className="font-medium break-words">{text}</span>
      <button
        onClick={handleCopy}
        className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title={`Copy ${label}`}
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>
    </div>
  )
}

// ========== DELETE CONFIRMATION MODAL ==========
function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  vendorName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: (permanent: boolean) => void
  loading: boolean
  vendorName: string
}) {
  const [permanent, setPermanent] = useState(false)
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Delete Vendor</h3>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-medium">{vendorName}</span>?
          </p>
          
          <label className="flex items-center gap-2 mt-4 text-sm">
            <input
              type="checkbox"
              checked={permanent}
              onChange={(e) => setPermanent(e.target.checked)}
              className="rounded"
            />
            <span>Permanently delete (cannot be restored)</span>
          </label>
        </div>
        
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(permanent)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ========== MAIN COMPONENT ==========
export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  async function fetchVendor() {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/procurement/vendors/${params.id}`, {
        signal: controller.signal
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load vendor')
      }

      setVendor(data.data)
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setError(err?.message || 'Failed to load vendor')
      setVendor(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendor()
    return () => abortRef.current?.abort()
  }, [params.id])

  // 🔥 Toggle Status
  const handleToggleStatus = async () => {
    if (!vendor) return
    
    const newStatus = vendor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setStatusUpdating(true)
    
    try {
      const res = await fetch(`/api/procurement/vendors/${vendor.vendor_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!res.ok) throw new Error('Failed to update status')
      
      toast.success(`Vendor ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`)
      fetchVendor() // refresh
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  // 🔥 Delete Handler
  const handleDelete = async (permanent: boolean) => {
    if (!vendor) return
    
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/procurement/vendors/${vendor.vendor_id}?permanent=${permanent}&deleted_by=SYSTEM`,
        { method: 'DELETE' }
      )
      
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success(`Vendor ${permanent ? 'permanently deleted' : 'deactivated'}`)
      router.push('/procurement/vendors')
    } catch (err) {
      toast.error('Failed to delete vendor')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((section) => (
              <div key={section} className="bg-white border rounded-xl p-6">
                <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                      <div className="h-5 w-32 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-600 font-medium">
          {error || 'Vendor not found'}
        </div>
        <button
          onClick={fetchVendor}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCcw size={16} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        vendorName={vendor.vendor_name}
      />

      <div className="p-6 space-y-6">

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
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{vendor.vendor_name}</h1>
                <StatusBadge status={vendor.status} type="vendor" />
              </div>
              <p className="text-sm text-gray-500">
                Code: <span className="font-mono">{vendor.vendor_code}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchVendor}
              className="p-2 border rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCcw size={16} />
            </button>

            <Link
              href={`/procurement/vendors/${vendor.vendor_id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={16} />
              Edit
            </Link>

            <button
              onClick={handleToggleStatus}
              disabled={statusUpdating}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 ${
                vendor.status === 'ACTIVE' 
                  ? 'text-yellow-600 border-yellow-200 hover:bg-yellow-50' 
                  : 'text-green-600 border-green-200 hover:bg-green-50'
              }`}
              title={vendor.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            >
              <Power size={16} />
              {vendor.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            <Link
              href={`/procurement/vendors/${vendor.vendor_id}/history`}
              className="p-2 border rounded-lg hover:bg-gray-50"
              title="View History"
            >
              <History size={16} />
            </Link>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            <Section title="Company Information">
              <div className="grid md:grid-cols-2 gap-6">
                <InfoItem 
                  icon={Building2} 
                  label="Company Name" 
                  value={<CopyableText text={vendor.vendor_name} label="Company name" />}
                />
                <InfoItem 
                  icon={MapPin} 
                  label="City" 
                  value={<CopyableText text={vendor.city} label="City" />}
                />
                <InfoItem icon={MapPin} label="Address" value={vendor.address || '-'} />
                <InfoItem icon={Phone} label="Phone" value={
                  vendor.phone ? (
                    <a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      {vendor.phone}
                      <Phone size={12} />
                    </a>
                  ) : '-'
                } />
                <InfoItem icon={Mail} label="Email" value={
                  vendor.email ? (
                    <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      {vendor.email}
                      <Mail size={12} />
                    </a>
                  ) : '-'
                } />
              </div>
            </Section>

            <Section title="Bank & Tax Information">
              <div className="grid md:grid-cols-2 gap-6">
                <InfoItem icon={CreditCard} label="Bank Name" value={vendor.bank_name || '-'} />
                <InfoItem icon={CreditCard} label="Account Number" value={maskAccount(vendor.bank_account)} />
                <InfoItem icon={FileText} label="NPWP" value={maskNPWP(vendor.npwp)} />
              </div>
            </Section>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            <Section title="System Information">
              <div className="space-y-3 text-sm">
                <MetaItem label="Created At" value={formatDate(vendor.created_at)} />
                <MetaItem label="Updated At" value={formatDate(vendor.updated_at)} />
                {vendor.created_by && (
                  <MetaItem label="Created By" value={vendor.created_by} />
                )}
                {vendor.updated_by && (
                  <MetaItem label="Updated By" value={vendor.updated_by} />
                )}
              </div>
            </Section>

            {/* Quick Actions */}
            <Section title="Quick Actions">
              <div className="space-y-2">
                <Link
                  href={`/procurement/purchase-orders?vendor=${vendor.vendor_id}`}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  📦 View Purchase Orders
                </Link>
                <Link
                  href={`/procurement/rfq/create?vendor=${vendor.vendor_id}`}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  📄 Create RFQ
                </Link>
              </div>
            </Section>

          </div>

        </div>
      </div>
    </>
  )
}

/* ---------- Sub Components ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value
}: {
  icon: any
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="font-medium break-words">{value}</div>
      </div>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
