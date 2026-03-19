'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Search, RefreshCw, AlertCircle, Check } from 'lucide-react'

interface Vendor {
  vendor_id: string
  vendor_code: string
  vendor_name: string
  status?: 'ACTIVE' | 'INACTIVE'
  email?: string
  phone?: string
}

interface VendorSelectProps {
  value: string
  onChange: (vendorId: string) => void
  required?: boolean
  disabled?: boolean
  showCode?: boolean
  showStatus?: boolean
  placeholder?: string
  emptyMessage?: string
  filterByStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL'
  className?: string
  error?: string
  helperText?: string
  label?: string
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
let vendorsCache: { data: Vendor[]; timestamp: number } | null = null

export default function VendorSelect({
  value,
  onChange,
  required = false,
  disabled = false,
  showCode = true,
  showStatus = false,
  placeholder = "Pilih Vendor",
  emptyMessage = "Tidak ada vendor aktif",
  filterByStatus = 'ACTIVE',
  className = '',
  error,
  helperText,
  label,
}: VendorSelectProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load vendors with cache
  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function loadVendors() {
      // Check cache first
      if (vendorsCache && Date.now() - vendorsCache.timestamp < CACHE_TTL) {
        if (mounted) {
          setVendors(vendorsCache.data)
          setLoading(false)
          setFetchError(null)
        }
        return
      }

      try {
        setLoading(true)
        setFetchError(null)

        const statusParam = filterByStatus !== 'ALL' ? `&status=${filterByStatus}` : ''
        const res = await fetch(`/api/procurement/vendors?t=${Date.now()}${statusParam}`, {
          signal: controller.signal,
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch vendors (${res.status})`)
        }

        const data = await res.json()

        if (!mounted) return

        if (!data.success) {
          throw new Error(data.error || 'Failed to load vendors')
        }

        const vendorList = data.data || []
        
        // Sort by name
        vendorList.sort((a: Vendor, b: Vendor) => 
          a.vendor_name.localeCompare(b.vendor_name)
        )

        setVendors(vendorList)
        vendorsCache = { data: vendorList, timestamp: Date.now() }
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        if (mounted) {
          setFetchError(err?.message || 'Gagal memuat vendor')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadVendors()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [filterByStatus, retryKey])

  // Filter vendors based on search
  const filteredVendors = useMemo(() => {
    if (!search.trim()) return vendors
    
    const searchLower = search.toLowerCase()
    return vendors.filter(v => 
      v.vendor_name.toLowerCase().includes(searchLower) ||
      v.vendor_code.toLowerCase().includes(searchLower) ||
      v.email?.toLowerCase().includes(searchLower)
    )
  }, [vendors, search])

  // Get selected vendor name
  const selectedVendor = useMemo(() => {
    return vendors.find(v => v.vendor_id === value)
  }, [vendors, value])

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryKey(prev => prev + 1)
  }, [])

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Loading state
  if (loading) {
    return (
      <div className="space-y-1">
        {label && <Label text={label} required={required} />}
        <div className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span className="text-sm">Loading vendors...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (fetchError) {
    return (
      <div className="space-y-1">
        {label && <Label text={label} required={required} />}
        <div className="w-full border border-red-300 rounded-lg px-3 py-2 bg-red-50 text-red-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="text-sm">{fetchError}</span>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 rounded hover:bg-red-200"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && <Label text={label} required={required} />}

      {/* Custom Select */}
      <div className="relative" ref={dropdownRef}>
        {/* Selected Value Display */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full
            border
            rounded-lg
            px-3
            py-2
            text-left
            bg-white
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
            transition
            flex
            items-center
            justify-between
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:border-gray-400'}
            ${error ? 'border-red-400' : 'border-gray-300'}
            ${className}
          `}
        >
          <span className="truncate">
            {selectedVendor ? (
              <>
                {selectedVendor.vendor_name}
                {showCode && ` (${selectedVendor.vendor_code})`}
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {/* Search Input */}
            {vendors.length > 5 && (
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari vendor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-60 overflow-y-auto">
              {/* Empty option */}
              <button
                onClick={() => {
                  onChange('')
                  setIsOpen(false)
                  setSearch('')
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm border-b"
              >
                <span className="text-gray-500">-- None --</span>
              </button>

              {filteredVendors.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  {emptyMessage}
                </div>
              ) : (
                filteredVendors.map((vendor) => (
                  <button
                    key={vendor.vendor_id}
                    onClick={() => {
                      onChange(vendor.vendor_id)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-50 text-sm
                      ${vendor.vendor_id === value ? 'bg-blue-50' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">
                          {vendor.vendor_name}
                          {showCode && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({vendor.vendor_code})
                            </span>
                          )}
                        </div>
                        {vendor.email && (
                          <div className="text-xs text-gray-500">{vendor.email}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {showStatus && vendor.status && (
                          <span className={`
                            text-xs px-1.5 py-0.5 rounded-full
                            ${vendor.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'}
                          `}>
                            {vendor.status}
                          </span>
                        )}
                        {vendor.vendor_id === value && (
                          <Check size={16} className="text-blue-600" />
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-3 py-1.5 text-xs text-gray-400 bg-gray-50">
              {filteredVendors.length} of {vendors.length} vendors
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Helper Text */}
      {!error && helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  )
}

// Label Component
function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  )
}

// ========== UTILITY HOOK ==========
export function useVendorSelect(initialValue: string = "") {
  const [vendorId, setVendorId] = useState(initialValue)
  const [vendorDetails, setVendorDetails] = useState<Vendor | null>(null)

  useEffect(() => {
    if (!vendorId) {
      setVendorDetails(null)
      return
    }

    async function loadVendorDetails() {
      try {
        const res = await fetch(`/api/procurement/vendors/${vendorId}`)
        const data = await res.json()
        if (data.success) {
          setVendorDetails(data.data)
        }
      } catch {
        // Silently fail
      }
    }

    loadVendorDetails()
  }, [vendorId])

  return {
    vendorId,
    vendorDetails,
    setVendorId,
    clear: () => setVendorId(""),
  }
}
