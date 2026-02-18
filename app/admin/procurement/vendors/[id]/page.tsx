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
  RefreshCcw
} from 'lucide-react'
import StatusBadge from '@/components/procurement/StatusBadge'

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

function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID')
}

function maskAccount(value?: string) {
  if (!value) return '-'
  if (value.length <= 4) return value
  return '•••• ' + value.slice(-4)
}

function maskNPWP(value?: string) {
  if (!value) return '-'
  return value.replace(/.(?=.{4})/g, '*')
}

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-60 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-gray-100 rounded-xl" />
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-60 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 font-medium mb-4">
          {error || 'Vendor not found'}
        </div>
        <button
          onClick={() => fetchVendor()}
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
            onClick={() => fetchVendor()}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
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
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          <Section title="Company Information">
            <div className="grid md:grid-cols-2 gap-6">
              <InfoItem icon={Building2} label="Company Name" value={vendor.vendor_name} />
              <InfoItem icon={MapPin} label="City" value={vendor.city} />
              <InfoItem icon={MapPin} label="Address" value={vendor.address} />
              <InfoItem icon={Phone} label="Phone" value={vendor.phone} />
              <InfoItem icon={Mail} label="Email" value={vendor.email} />
            </div>
          </Section>

          <Section title="Bank & Tax Information">
            <div className="grid md:grid-cols-2 gap-6">
              <InfoItem icon={CreditCard} label="Bank Name" value={vendor.bank_name} />
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

        </div>

      </div>
    </div>
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
  value?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium break-words">{value || '-'}</p>
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
