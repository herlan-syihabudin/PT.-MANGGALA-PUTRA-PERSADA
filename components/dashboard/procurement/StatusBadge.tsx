'use client'

import { 
  Clock, CheckCircle, XCircle, 
  Package, Truck, AlertCircle,
  Send, Check, X, Archive
} from 'lucide-react'

// ========== TYPES ==========
type PRStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ORDERED"
type POStatus = "DRAFT" | "SENT" | "CONFIRMED" | "DELIVERED" | "CLOSED"
type GRStatus = "RECEIVED" | "PARTIAL"
type VendorStatus = "ACTIVE" | "INACTIVE"

type StatusType = "pr" | "po" | "gr" | "vendor"

interface StatusBadgeProps {
  status: string
  type?: StatusType
  size?: "sm" | "md" | "lg"
  variant?: "solid" | "outline"
  showLabel?: boolean
  showIcon?: boolean
  dot?: boolean
  className?: string
}

// ========== CONSTANTS ==========
const STATUS_LABELS: Record<StatusType, Record<string, string>> = {
  pr: {
    DRAFT: "Draft",
    SUBMITTED: "Menunggu",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
    ORDERED: "Diproses",
  },
  po: {
    DRAFT: "Draft",
    SENT: "Terkirim",
    CONFIRMED: "Dikonfirmasi",
    DELIVERED: "Terkirim",
    CLOSED: "Selesai",
  },
  gr: {
    RECEIVED: "Diterima",
    PARTIAL: "Sebagian",
  },
  vendor: {
    ACTIVE: "Aktif",
    INACTIVE: "Nonaktif",
  },
}

const STATUS_ICONS = {
  DRAFT: Clock,
  SUBMITTED: Send,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  ORDERED: Package,
  SENT: Send,
  CONFIRMED: Check,
  DELIVERED: Truck,
  CLOSED: Archive,
  RECEIVED: CheckCircle,
  PARTIAL: AlertCircle,
  ACTIVE: CheckCircle,
  INACTIVE: X,
}

const STATUS_COLORS: Record<StatusType, Record<string, string>> = {
  pr: {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    ORDERED: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  },
  po: {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    CONFIRMED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    DELIVERED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    CLOSED: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
  },
  gr: {
    RECEIVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    PARTIAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  vendor: {
    ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    INACTIVE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  },
}

// ========== MAIN COMPONENT ==========
export default function StatusBadge({
  status,
  type = "pr",
  size = "sm",
  variant = "solid",
  showLabel = true,
  showIcon = true,
  dot = false,
  className = "",
}: StatusBadgeProps) {
  const normalizedStatus = String(status).toUpperCase()
  
  // Get styles
  const baseStyle = STATUS_COLORS[type]?.[normalizedStatus] || 
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
  
  // Handle variant
  const variantStyle = variant === "outline" 
    ? baseStyle.replace(/bg-\w+-\d+/, 'bg-transparent') + ' border'
    : baseStyle
  
  // Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-2.5 py-1.5 text-sm gap-1.5",
    lg: "px-3 py-2 text-base gap-2",
  }

  // Get icon if enabled
  const Icon = showIcon ? STATUS_ICONS[normalizedStatus as keyof typeof STATUS_ICONS] : null
  
  // Get label
  const label = showLabel 
    ? STATUS_LABELS[type]?.[normalizedStatus] || normalizedStatus
    : null

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]}
        ${variantStyle}
        ${className}
      `}
    >
      {/* Icon */}
      {Icon && <Icon size={size === "sm" ? 12 : size === "md" ? 14 : 16} />}
      
      {/* Dot indicator */}
      {dot && !Icon && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      
      {/* Label */}
      {label}
    </span>
  )
}

// ========== EXPORT UTILITIES ==========
export function getStatusColor(status: string, type: StatusType = "pr"): string {
  const normalized = status.toUpperCase()
  return STATUS_COLORS[type]?.[normalized] || STATUS_COLORS.pr.DRAFT
}

export function getStatusLabel(status: string, type: StatusType = "pr"): string {
  const normalized = status.toUpperCase()
  return STATUS_LABELS[type]?.[normalized] || normalized
}
