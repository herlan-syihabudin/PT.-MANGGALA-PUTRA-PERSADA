"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { 
  RefreshCcw, 
  MessageSquare, 
  UserPlus, 
  DollarSign, 
  FileText, 
  CheckCircle,
  Clock,
  User,
  Calendar,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

type Activity = {
  log_id: string
  inquiry_id: string
  type: string
  description: string
  old_value: string
  new_value: string
  created_at: string
  created_by: string
}

type ActivityIconMap = {
  [key: string]: {
    icon: React.ElementType
    bgColor: string
    textColor: string
  }
}

const ACTIVITY_ICONS: ActivityIconMap = {
  STATUS_CHANGE: { icon: RefreshCcw, bgColor: "bg-blue-100", textColor: "text-blue-600" },
  NOTE_ADDED: { icon: MessageSquare, bgColor: "bg-green-100", textColor: "text-green-600" },
  ASSIGNMENT_CHANGE: { icon: UserPlus, bgColor: "bg-purple-100", textColor: "text-purple-600" },
  VALUE_CHANGE: { icon: DollarSign, bgColor: "bg-amber-100", textColor: "text-amber-600" },
  RAB_CREATED: { icon: FileText, bgColor: "bg-indigo-100", textColor: "text-indigo-600" },
  PROPOSAL_CREATED: { icon: FileText, bgColor: "bg-emerald-100", textColor: "text-emerald-600" },
  PROJECT_CREATED: { icon: CheckCircle, bgColor: "bg-emerald-100", textColor: "text-emerald-600" },
  COMMENT: { icon: MessageSquare, bgColor: "bg-gray-100", textColor: "text-gray-600" },
  DOCUMENT_UPLOAD: { icon: FileText, bgColor: "bg-amber-100", textColor: "text-amber-600" },
}

const DEFAULT_ICON = { icon: AlertCircle, bgColor: "bg-gray-100", textColor: "text-gray-600" }

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

function formatValue(value: string, type: string): string {
  if (!value) return "-"
  
  if (type.includes("VALUE") || type.includes("BUDGET") || type.includes("PRICE")) {
    return formatCurrency(value)
  }
  
  return value
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Baru saja"
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`
  return formatDate(date)
}

export default function ActivityTimeline({ inquiryId }: { inquiryId: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchActivity = useCallback(async (showLoading = true) => {
    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      if (showLoading) setLoading(true)
      setError(null)

      const res = await fetch(`/api/crm/activity/${inquiryId}`, {
        signal: controller.signal,
        cache: "no-store"
      })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }
      
      const data = await res.json()

if (!Array.isArray(data)) {
  throw new Error("Invalid activity response")
}
      data.sort(
 (a,b)=>
 new Date(b.created_at).getTime() -
 new Date(a.created_at).getTime()
)

setActivities(prev => {
  if (JSON.stringify(prev) === JSON.stringify(data)) {
    return prev
  }
  return data
})
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Ignore abort errors
        return
      }
      console.error("Failed to fetch activity:", err)
      setError("Gagal memuat aktivitas")
      
      // Only show toast on first load or manual refresh, not on every interval
      if (showLoading) {
        toast.error("Gagal memuat aktivitas")
      }
    } finally {
      if (showLoading) setLoading(false)
      abortControllerRef.current = null
    }
  }, [inquiryId])

  useEffect(() => {
    // Initial fetch with loading
    fetchActivity(true)

    // Set up interval for background updates (without loading state)
    const interval = setInterval(() => {
      fetchActivity(false)
    }, 15000)

    // Cleanup
    return () => {
      clearInterval(interval)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchActivity])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-slate-600" />
          <span className="text-sm">Memuat aktivitas...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center">
  <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-3">
    <AlertCircle size={20} className="text-rose-600" />
  </div>

  <p className="text-sm text-rose-600">{error}</p>

  <button
    onClick={() => fetchActivity(true)}
    className="mt-3 text-xs text-slate-500 hover:text-slate-700 underline"
  >
    Muat ulang
  </button>
</div>
    )
  }

  if (!activities.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
          <Clock size={20} className="text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">Belum ada aktivitas</p>
        <p className="text-xs text-slate-400 mt-1">
          Aktivitas akan muncul saat ada perubahan
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <RefreshCcw size={16} className="text-slate-500" />
          Timeline Aktivitas
          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
            Live
          </span>
        </h3>
        <span className="text-xs text-slate-400">
          {activities.length} aktivitas
        </span>
      </div>

      <div className="space-y-4">
        {activities.map((act, index) => {
          const iconConfig = ACTIVITY_ICONS[act.type] || DEFAULT_ICON
          const Icon = iconConfig.icon
          const isLast = index === activities.length - 1

          return (
            <div key={act.log_id} className="relative flex gap-3">
              {/* Timeline line connector */}
              {!isLast && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
              )}

              {/* Icon with background */}
              <div className={`relative z-10 w-8 h-8 rounded-full ${iconConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon size={14} className={iconConfig.textColor} />
              </div>

              {/* Activity content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">
                    {act.description}
                  </p>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {getRelativeTime(act.created_at)}
                  </span>
                </div>

                {/* Show value changes if any */}
                {(act.old_value || act.new_value) && (
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    {act.old_value && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded">
                        {formatValue(act.old_value, act.type)}
                      </span>
                    )}
                    {act.old_value && act.new_value && (
                      <span className="text-slate-400">→</span>
                    )}
                    {act.new_value && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded">
                        {formatValue(act.new_value, act.type)}
                      </span>
                    )}
                  </div>
                )}

                {/* User info */}
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {act.created_by || "System"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(act.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>Auto-refresh setiap 15 detik</span>
        </div>
      </div>
    </div>
  )
}
