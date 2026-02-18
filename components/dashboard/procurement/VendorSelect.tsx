import { useEffect, useState, useMemo } from 'react'

interface Vendor {
  vendor_id: string
  vendor_code: string
  vendor_name: string
  status?: 'ACTIVE' | 'INACTIVE'
}

interface VendorSelectProps {
  value: string
  onChange: (vendorId: string) => void
  required?: boolean
  disabled?: boolean
  showCode?: boolean
  className?: string
}

export default function VendorSelect({
  value,
  onChange,
  required = false,
  disabled = false,
  showCode = true,
  className = ''
}: VendorSelectProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchVendors() {
      try {
        const res = await fetch('/api/procurement/vendors?status=ACTIVE')
        const data = await res.json()

        if (!data.success) throw new Error('Failed to load vendors')

        if (mounted) setVendors(data.data || [])
      } catch (err) {
        if (mounted) setError('Gagal memuat vendor')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchVendors()

    return () => {
      mounted = false
    }
  }, [])

  const sortedVendors = useMemo(() => {
    return [...vendors].sort((a, b) =>
      a.vendor_name.localeCompare(b.vendor_name)
    )
  }, [vendors])

  if (loading) {
    return (
      <select
        disabled
        className={`w-full border rounded-lg px-3 py-2 bg-gray-50 ${className}`}
      >
        <option>Loading vendor...</option>
      </select>
    )
  }

  if (error) {
    return (
      <select
        disabled
        className={`w-full border rounded-lg px-3 py-2 bg-red-50 text-red-600 ${className}`}
      >
        <option>{error}</option>
      </select>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={`
        w-full
        border
        rounded-lg
        px-3
        py-2
        bg-white
        focus:ring-2
        focus:ring-blue-500
        focus:border-blue-500
        transition
        ${className}
      `}
    >
      <option value="">Pilih Vendor</option>

      {sortedVendors.length === 0 && (
        <option disabled>Tidak ada vendor aktif</option>
      )}

      {sortedVendors.map(v => (
        <option key={v.vendor_id} value={v.vendor_id}>
          {v.vendor_name}
          {showCode && ` (${v.vendor_code})`}
        </option>
      ))}
    </select>
  )
}
