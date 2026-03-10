"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { notFound, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  RefreshCcw,
  CheckCircle2,
  FileText,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  User,
  Users,
  Mail,
  Phone,
  Building,
  MapPin,
  FileCheck,
  FileSpreadsheet,
  AlertTriangle,
  Shield,
  MessageSquare,
  History,
  Download,
  Send,
  Heart,
  Activity,
  Zap,
  Target,
  Flame,
  Thermometer,
  Brain,
  Sparkles,
  Bell,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

// ================= TYPES =================
type Deal = {
  pipeline_id: string
  inquiry_id: string
  customer_id: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  customer_address?: string
  project_name: string
  project_location?: string
  stage: "FOLLOW UP" | "PENAWARAN" | "NEGOSIASI" | "DEAL" | "LOST"
  estimated_value: number
  proposal_value?: number
  final_value: number
  rab_id: string
  rab_data?: any
  proposal_id: string
  proposal_status?: "draft" | "sent" | "approved" | "rejected"
  project_id?: string
  created_at: string
  updated_at: string
  last_activity_at: string
  status?: string
  probability: number
  aging_days: number
  discount_percent?: number
  gross_margin?: number
  payment_terms?: string
  competitor?: string
  risk_flags?: string[]
  win_probability?: number
  assigned_to?: string
  assigned_name?: string
  source?: string
  priority?: string
  notes?: string
  last_followup?: string
  health_score?: number
  health_trend?: "up" | "down" | "stable"
  risk_level?: "low" | "medium" | "high"
  next_best_action?: string
}

type ActivityLog = {
  id: string
  type: "note" | "call" | "email" | "meeting" | "status_change" | "system"
  description: string
  user: string
  timestamp: string
  metadata?: any
}

type ActivityType = "call" | "email" | "meeting" | "note"

// ================= CONSTANTS =================
const AGING_THRESHOLDS = {
  warning: 7,
  critical: 14,
}

const STAGE_CONFIG: Record<string, { label: string; color: string; bgColor: string; textColor: string; borderColor: string }> = {
  "FOLLOW UP": {
    label: "Follow Up",
    color: "slate",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
  },
  PENAWARAN: {
    label: "Penawaran",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  NEGOSIASI: {
    label: "Negosiasi",
    color: "amber",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  DEAL: {
    label: "Deal",
    color: "emerald",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  LOST: {
    label: "Lost",
    color: "rose",
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
  },
}

const ACTIVITY_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: MessageSquare,
  status_change: RefreshCcw,
  system: Activity,
}

const ACTIVITY_COLORS = {
  call: "text-blue-600 bg-blue-100",
  email: "text-emerald-600 bg-emerald-100",
  meeting: "text-purple-600 bg-purple-100",
  note: "text-slate-600 bg-slate-100",
  status_change: "text-amber-600 bg-amber-100",
  system: "text-slate-400 bg-slate-100",
}

// ================= HELPERS =================
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(date: string): string {
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

function getAgingStatus(days: number): "normal" | "warning" | "critical" {
  if (days > AGING_THRESHOLDS.critical) return "critical"
  if (days > AGING_THRESHOLDS.warning) return "warning"
  return "normal"
}

function getWinPercentage(deal: Deal): number {
  return deal.win_probability || Math.round(deal.probability * 100)
}

function getWinColor(percentage: number): string {
  if (percentage >= 70) return "bg-emerald-500"
  if (percentage >= 40) return "bg-amber-500"
  return "bg-rose-500"
}

// ================= AI HEALTH SCORE ENGINE =================
function calculateHealthScore(deal: Deal, activities: ActivityLog[]): {
  score: number
  factors: { name: string; score: number; impact: number }[]
  risk: "low" | "medium" | "high"
  nextAction: string
  temperature: "hot" | "warm" | "cold"
} {
  let score = 50 // Base score
  const factors = []
  
  // Factor 1: Stage & Probability (max 20)
  const stageScore = deal.probability * 20
  factors.push({ name: "Stage & Probability", score: stageScore, impact: 20 })
  score += stageScore
  
  // Factor 2: Recent Activity (max 15)
  const lastActivity = deal.last_activity_at ? new Date(deal.last_activity_at) : new Date(deal.created_at)
  const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
  
  let activityScore = 0
  if (daysSinceActivity <= 3) activityScore = 15
  else if (daysSinceActivity <= 7) activityScore = 10
  else if (daysSinceActivity <= 14) activityScore = 5
  else activityScore = 0
  
  factors.push({ name: "Recent Activity", score: activityScore, impact: 15 })
  score += activityScore
  
  // Factor 3: Activity Frequency (max 15)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  const recentActivities = activities.filter(a => new Date(a.timestamp) > oneMonthAgo).length
  
  let frequencyScore = 0
  if (recentActivities >= 5) frequencyScore = 15
  else if (recentActivities >= 3) frequencyScore = 12
  else if (recentActivities >= 1) frequencyScore = 8
  else frequencyScore = 0
  
  factors.push({ name: "Activity Frequency", score: frequencyScore, impact: 15 })
  score += frequencyScore
  
  // Factor 4: Documents Completed (max 15)
  let docScore = 0
  if (deal.rab_id) docScore += 5
  if (deal.proposal_id) docScore += 5
  if (deal.proposal_status === "approved") docScore += 5
  else if (deal.proposal_status === "sent") docScore += 3
  
  factors.push({ name: "Documents", score: docScore, impact: 15 })
  score += docScore
  
  // Factor 5: Value (max 15)
  let valueScore = 0
  if (deal.final_value >= 1_000_000_000) valueScore = 15
  else if (deal.final_value >= 500_000_000) valueScore = 12
  else if (deal.final_value >= 100_000_000) valueScore = 8
  else if (deal.final_value >= 50_000_000) valueScore = 5
  else valueScore = 2
  
  factors.push({ name: "Deal Value", score: valueScore, impact: 15 })
  score += valueScore
  
  // Factor 6: Assignment (max 10)
  const assignScore = deal.assigned_to ? 10 : 0
  factors.push({ name: "Assigned Team", score: assignScore, impact: 10 })
  score += assignScore
  
  // Factor 7: Competition (max 10)
  let competitionScore = 10
  if (deal.competitor) competitionScore = 5
  if (deal.risk_flags?.includes("strong_competitor")) competitionScore = 0
  
  factors.push({ name: "Competition", score: competitionScore, impact: 10 })
  score += competitionScore
  
  // Normalize score to 0-100
  const finalScore = Math.min(100, Math.max(0, Math.round(score)))
  
  // Determine risk level
  let risk: "low" | "medium" | "high" = "low"
  if (finalScore < 40) risk = "high"
  else if (finalScore < 70) risk = "medium"
  
  // Determine temperature
  let temperature: "hot" | "warm" | "cold" = "cold"
  if (finalScore >= 75) temperature = "hot"
  else if (finalScore >= 50) temperature = "warm"
  
  // Generate next best action
  let nextAction = ""
  if (daysSinceActivity > 7) {
    nextAction = "⚠️ Follow up segera - sudah 7 hari tanpa kontak"
  } else if (!deal.rab_id && deal.stage === "FOLLOW UP") {
    nextAction = "📊 Siapkan RAB untuk lanjut ke tahap penawaran"
  } else if (!deal.proposal_id && deal.rab_id) {
    nextAction = "📄 Buat proposal berdasarkan RAB yang sudah ada"
  } else if (deal.proposal_status === "sent" && !deal.proposal_status === "approved") {
    nextAction = "🤝 Follow up untuk mendapatkan persetujuan proposal"
  } else if (deal.probability > 0.7) {
    nextAction = "🔥 High probability deal - fokus untuk closing"
  } else {
    nextAction = "📈 Monitor progress secara reguler"
  }
  
  return {
    score: finalScore,
    factors,
    risk,
    nextAction,
    temperature,
  }
}

// ================= MAIN COMPONENT =================
export default function DealDetailPage({
  params,
}: {
  params: { pipeline_id: string }
}) {
  const router = useRouter()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityType, setActivityType] = useState<ActivityType>("call")
  const [activityNotes, setActivityNotes] = useState("")
  const [healthScore, setHealthScore] = useState<any>(null)

  // ================= FETCH DEAL =================
  useEffect(() => {
    if (!params?.pipeline_id) {
      notFound()
      return
    }

    const fetchDeal = async () => {
      setLoading(true)
      try {
        const [dealRes, activityRes] = await Promise.all([
          fetch(`/api/crm/pipeline/${params.pipeline_id}`, { cache: "no-store" }),
          fetch(`/api/crm/pipeline/${params.pipeline_id}/activities`, { cache: "no-store" }),
        ])

        if (!dealRes.ok) throw new Error("Failed to fetch deal")

        const dealData = await dealRes.json()
        setDeal(dealData)

        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setActivities(activityData)
        }
      } catch (e) {
        console.error(e)
        toast.error("Gagal memuat data deal")
      } finally {
        setLoading(false)
      }
    }

    fetchDeal()
  }, [params?.pipeline_id])

  // ================= CALCULATE HEALTH SCORE =================
  useEffect(() => {
    if (deal && activities) {
      const health = calculateHealthScore(deal, activities)
      setHealthScore(health)
      
      // Update deal dengan health score
      setDeal(prev => prev ? {
        ...prev,
        health_score: health.score,
        risk_level: health.risk,
        next_best_action: health.nextAction,
      } : prev)
    }
  }, [deal, activities])

  // ================= ADD ACTIVITY =================
  const addActivity = async () => {
    if (!activityNotes.trim() || !deal) return

    try {
      const res = await fetch(`/api/crm/pipeline/${deal.pipeline_id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activityType,
          description: activityNotes,
        }),
      })

      if (!res.ok) throw new Error()

      const newActivity = await res.json()
      setActivities(prev => [newActivity, ...prev])
      
      // Update last activity timestamp untuk aging
      setDeal(prev => prev ? {
        ...prev,
        last_activity_at: new Date().toISOString(),
        last_followup: new Date().toISOString(),
        aging_days: 0,
      } : prev)
      
      setActivityNotes("")
      setShowActivityModal(false)
      toast.success(`${activityType} berhasil dicatat`)
    } catch {
      toast.error("Gagal mencatat aktivitas")
    }
  }

  // ================= CONVERT TO PROJECT =================
  const convertToProject = async () => {
    if (converting) return
    if (!deal) return

    // ✅ LOCK: Only DEAL stage can convert
    if (deal.stage !== "DEAL") {
      toast.error("Hanya deal dengan status DEAL yang dapat dikonversi ke project")
      return
    }

    // ✅ LOCK: Check if already converted
    if (deal.project_id) {
      toast.error("Deal ini sudah dikonversi ke project")
      return
    }

    // ✅ LOCK: Check proposal status
    if (deal.proposal_status !== "approved") {
      toast.error("Proposal harus disetujui sebelum konversi ke project")
      return
    }

    // ✅ LOCK: Check RAB exists
    if (!deal.rab_id) {
      toast.error("RAB harus ada sebelum konversi ke project")
      return
    }

    try {
      setConverting(true)

      const res = await fetch("/api/project/create-from-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipeline_id: deal.pipeline_id,
          inquiry_id: deal.inquiry_id,
          customer_id: deal.customer_id,
          project_name: deal.project_name,
          project_value: deal.final_value,
          rab_id: deal.rab_id,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || "Gagal konversi")
      }

      // Update local state with project_id
      setDeal(prev => prev ? {
        ...prev,
        project_id: result.project_id,
      } : prev)

      // Add activity log
      await addSystemActivity(`Deal dikonversi ke project: ${result.project_id}`)

      toast.success("Deal berhasil dikonversi ke project")
      router.push(`/admin/project/${result.project_id}`)
    } catch (error: any) {
      toast.error(error.message || "Gagal konversi ke project")
    } finally {
      setConverting(false)
    }
  }

  // ================= ADD SYSTEM ACTIVITY =================
  const addSystemActivity = async (description: string) => {
    if (!deal) return
    
    try {
      const res = await fetch(`/api/crm/pipeline/${deal.pipeline_id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "system",
          description,
        }),
      })

      if (res.ok) {
        const newActivity = await res.json()
        setActivities(prev => [newActivity, ...prev])
      }
    } catch (e) {
      console.error("Failed to add system activity", e)
    }
  }

  // ================= VIEW PROPOSAL =================
  const viewProposal = () => {
    if (!deal?.proposal_id) return
    router.push(`/admin/estimator/proposal/${deal.proposal_id}`)
  }

  // ================= VIEW RAB =================
  const viewRAB = () => {
    if (!deal?.rab_id) return
    router.push(`/admin/estimator/rab/${deal.rab_id}`)
  }

  // ================= CHECK FOLLOW UP NEEDED =================
  const needsFollowUp = useMemo(() => {
    if (!deal) return false
    const lastActivity = deal.last_activity_at ? new Date(deal.last_activity_at) : new Date(deal.created_at)
    const daysSince = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    return daysSince > AGING_THRESHOLDS.warning
  }, [deal])

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-800 mx-auto" />
          <p className="text-slate-500">Loading Deal Details...</p>
        </div>
      </div>
    )
  }

  if (!deal) return notFound()

  const stageConfig = STAGE_CONFIG[deal.stage]
  const agingStatus = getAgingStatus(deal.aging_days)
  const winPercentage = getWinPercentage(deal)
  const winColor = getWinColor(winPercentage)

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-300 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">
                  {deal.project_name || `${deal.customer_name} Project` || deal.pipeline_id}
                </h1>
                <p className="text-sm text-slate-300">
                  {deal.customer_name} • {deal.pipeline_id}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageConfig.bgColor} ${stageConfig.textColor} border ${stageConfig.borderColor}`}>
                    {stageConfig.label}
                  </span>
                  
                  {/* Health Score Badge */}
                  {healthScore && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
                      ${healthScore.score >= 75 ? 'bg-emerald-100 text-emerald-700' :
                        healthScore.score >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'}`}
                    >
                      <Heart size={12} className={
                        healthScore.score >= 75 ? 'fill-emerald-500 text-emerald-500' :
                        healthScore.score >= 50 ? 'fill-amber-500 text-amber-500' :
                        'fill-rose-500 text-rose-500'
                      } />
                      Health: {healthScore.score}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Follow Up Button - muncul jika perlu follow up */}
              {needsFollowUp && (
                <button
                  onClick={() => setShowActivityModal(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 animate-pulse"
                >
                  <Bell size={16} />
                  Follow Up Needed!
                </button>
              )}

              {/* Activity Button */}
              <button
                onClick={() => setShowActivityModal(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10"
              >
                <Phone size={16} />
                Log Activity
              </button>

              {deal.stage === "DEAL" && !deal.project_id && (
                <button
                  onClick={convertToProject}
                  disabled={converting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {converting ? (
                    <>
                      <RefreshCcw size={16} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Convert ke Project
                    </>
                  )}
                </button>
              )}

              {deal.project_id && (
                <Link
                  href={`/admin/project/${deal.project_id}`}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Briefcase size={16} />
                  View Project
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Health Dashboard */}
      {healthScore && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">AI DEAL HEALTH</p>
                <p className="font-medium text-slate-800">
                  {healthScore.nextAction}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Health Score Gauge */}
              <div className="col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Health Score</span>
                  <span className={`text-lg font-bold ${
                    healthScore.score >= 75 ? 'text-emerald-600' :
                    healthScore.score >= 50 ? 'text-amber-600' :
                    'text-rose-600'
                  }`}>
                    {healthScore.score}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      healthScore.score >= 75 ? 'bg-emerald-500' :
                      healthScore.score >= 50 ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`}
                    style={{ width: `${healthScore.score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 capitalize">
                  {healthScore.temperature} • {healthScore.risk} risk
                </p>
              </div>

              {/* Temperature */}
              <div className="col-span-1">
                <p className="text-xs text-slate-400 mb-1">Deal Temperature</p>
                <div className="flex items-center gap-2">
                  {healthScore.temperature === "hot" && (
                    <>
                      <Flame className="text-rose-500" size={20} />
                      <span className="font-semibold text-rose-600">HOT DEAL</span>
                    </>
                  )}
                  {healthScore.temperature === "warm" && (
                    <>
                      <Thermometer className="text-amber-500" size={20} />
                      <span className="font-semibold text-amber-600">WARM DEAL</span>
                    </>
                  )}
                  {healthScore.temperature === "cold" && (
                    <>
                      <Thermometer className="text-slate-400" size={20} />
                      <span className="font-semibold text-slate-500">COLD DEAL</span>
                    </>
                  )}
                </div>
              </div>

              {/* Risk Level */}
              <div className="col-span-1">
                <p className="text-xs text-slate-400 mb-1">Risk Level</p>
                <div className="flex items-center gap-2">
                  <Shield size={18} className={
                    healthScore.risk === "low" ? "text-emerald-500" :
                    healthScore.risk === "medium" ? "text-amber-500" :
                    "text-rose-500"
                  } />
                  <span className={`font-semibold ${
                    healthScore.risk === "low" ? "text-emerald-600" :
                    healthScore.risk === "medium" ? "text-amber-600" :
                    "text-rose-600"
                  }`}>
                    {healthScore.risk.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Key Factors */}
              <div className="col-span-1">
                <p className="text-xs text-slate-400 mb-1">Top Factors</p>
                <div className="space-y-1">
                  {healthScore.factors.slice(0, 2).map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-1 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        f.score / f.impact > 0.7 ? 'bg-emerald-500' :
                        f.score / f.impact > 0.3 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <span className="text-slate-600">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Follow Up Reminder */}
      {needsFollowUp && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Follow Up Needed</h3>
              <p className="text-sm text-amber-700">
                Belum ada aktivitas selama {deal.aging_days} hari. Segera lakukan follow up untuk menjaga deal tetap hangat.
              </p>
            </div>
            <button
              onClick={() => setShowActivityModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Log Activity
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Building size={18} className="text-slate-500" />
                Customer Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Customer Name</p>
                  <p className="font-medium text-slate-800">{deal.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Customer ID</p>
                  <p className="text-sm text-slate-600">{deal.customer_id}</p>
                </div>
                {deal.customer_email && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Email</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Mail size={14} className="text-slate-400" />
                      {deal.customer_email}
                    </p>
                  </div>
                )}
                {deal.customer_phone && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Phone</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Phone size={14} className="text-slate-400" />
                      {deal.customer_phone}
                    </p>
                  </div>
                )}
                {deal.customer_address && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Address</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" />
                      {deal.customer_address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-slate-500" />
                Project Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Project Name</p>
                  <p className="font-medium text-slate-800">{deal.project_name}</p>
                </div>
                {deal.project_location && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Location</p>
                    <p className="text-sm text-slate-600">{deal.project_location}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Source</p>
                  <p className="text-sm text-slate-600">{deal.source || "Direct"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Priority</p>
                  <p className="text-sm text-slate-600 capitalize">{deal.priority || "normal"}</p>
                </div>
                {deal.assigned_name && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Assigned To</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <User size={14} className="text-slate-400" />
                      {deal.assigned_name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Commercial Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-slate-500" />
                Commercial Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Estimated Value</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {formatCurrency(deal.estimated_value)}
                    </p>
                  </div>
                  {deal.proposal_value && deal.proposal_value > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Proposal Value</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        {formatCurrency(deal.proposal_value)}
                        {deal.proposal_value > deal.estimated_value && (
                          <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            +{((deal.proposal_value - deal.estimated_value) / deal.estimated_value * 100).toFixed(0)}%
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Final Value</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {formatCurrency(deal.final_value)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {deal.discount_percent !== undefined && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Discount</p>
                      <p className="text-sm font-medium text-slate-800">{deal.discount_percent}%</p>
                    </div>
                  )}
                  {deal.gross_margin !== undefined && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Gross Margin</p>
                      <p className="text-sm font-medium text-emerald-600">{deal.gross_margin}%</p>
                      <p className="text-xs text-slate-400 mt-1">Dari RAB (read-only)</p>
                    </div>
                  )}
                  {deal.payment_terms && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Payment Terms</p>
                      <p className="text-sm text-slate-600">{deal.payment_terms}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Win Probability</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full">
                        <div
                          className={`h-2 rounded-full ${winColor}`}
                          style={{ width: `${winPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {winPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Section */}
            {(deal.competitor || deal.risk_flags) && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-slate-500" />
                  Risk Assessment
                </h3>
                <div className="space-y-3">
                  {deal.competitor && (
                    <div className="flex items-start gap-2">
                      <TrendingUp size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400">Competitor</p>
                        <p className="text-sm text-slate-700">{deal.competitor}</p>
                      </div>
                    </div>
                  )}
                  {deal.risk_flags?.map((flag, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400">Risk Flag</p>
                        <p className="text-sm text-amber-700">{flag}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                Documents
              </h3>
              <div className="flex flex-wrap gap-3">
                {deal.rab_id && (
                  <button
                    onClick={viewRAB}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} />
                    View RAB
                    {deal.stage === "DEAL" && (
                      <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Locked
                      </span>
                    )}
                  </button>
                )}

                {deal.proposal_id && (
                  <button
                    onClick={viewProposal}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FileCheck size={16} />
                    View Proposal
                    {deal.proposal_status && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        deal.proposal_status === "approved" ? "bg-emerald-100 text-emerald-700" :
                        deal.proposal_status === "sent" ? "bg-blue-100 text-blue-700" :
                        deal.proposal_status === "rejected" ? "bg-rose-100 text-rose-700" :
                        "bg-slate-200 text-slate-600"
                      }`}>
                        {deal.proposal_status}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Notes */}
            {deal.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-slate-500" />
                  Notes
                </h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{deal.notes}</p>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <History size={18} className="text-slate-500" />
                  Activity Timeline
                </h3>
                <button
                  onClick={() => setShowActivityModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Phone size={12} />
                  Log Activity
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {activities.length === 0 ? (
                  <p className="text-center text-slate-400 py-4">No activity yet</p>
                ) : (
                  activities.map((activity, index) => {
                    const Icon = ACTIVITY_ICONS[activity.type] || MessageSquare
                    const colorClass = ACTIVITY_COLORS[activity.type] || "text-slate-600 bg-slate-100"
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colorClass} flex items-center justify-center`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-800">{activity.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {activity.user || "System"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Timeline */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-slate-500" />
                Deal Analytics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Probability</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full">
                      <div
                        className={`h-2 rounded-full ${winColor}`}
                        style={{ width: `${winPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {winPercentage}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">Aging</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      agingStatus === "critical" ? "bg-rose-100 text-rose-700" :
                      agingStatus === "warning" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {deal.aging_days} hari
                    </span>
                    {deal.last_followup && (
                      <span className="text-xs text-slate-400">
                        Last: {formatRelativeTime(deal.last_activity_at || deal.last_followup)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Berdasarkan aktivitas terakhir
                  </p>
                </div>

                {/* Health Score Factor Breakdown */}
                {healthScore && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-2">Health Factors</p>
                    <div className="space-y-2">
                      {healthScore.factors.slice(0, 4).map((factor: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-slate-600">{factor.name}</span>
                            <span className="font-medium text-slate-700">
                              {Math.round(factor.score)}/{factor.impact}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full">
                            <div
                              className={`h-1.5 rounded-full ${
                                factor.score / factor.impact > 0.7 ? 'bg-emerald-500' :
                                factor.score / factor.impact > 0.3 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${(factor.score / factor.impact) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-slate-500" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400">Created</p>
                  <p className="text-sm text-slate-700">{formatDate(deal.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Last Activity</p>
                  <p className="text-sm text-slate-700">{formatDate(deal.last_activity_at || deal.updated_at)}</p>
                </div>
                {deal.last_followup && (
                  <div>
                    <p className="text-xs text-slate-400">Last Follow Up</p>
                    <p className="text-sm text-slate-700">{formatDate(deal.last_followup)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowActivityModal(true)}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Phone size={16} />
                  Log Call / Meeting
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    window.location.href = `mailto:${deal.customer_email}?subject=Proposal%20${deal.project_name}`
                  }}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      <AnimatePresence>
        {showActivityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowActivityModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Log Activity</h2>
                <button onClick={() => setShowActivityModal(false)} className="p-1 hover:bg-slate-100 rounded">
                  <ArrowLeft size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Activity Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Activity Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "call", label: "Call", icon: Phone },
                      { value: "email", label: "Email", icon: Mail },
                      { value: "meeting", label: "Meeting", icon: Users },
                    ].map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setActivityType(type.value as ActivityType)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors flex flex-col items-center gap-1
                            ${activityType === type.value 
                              ? 'bg-slate-800 text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          <Icon size={16} />
                          {type.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={activityNotes}
                    onChange={(e) => setActivityNotes(e.target.value)}
                    rows={4}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                    placeholder="Tulis hasil aktivitas..."
                    autoFocus
                  />
                </div>

                <button
                  onClick={addActivity}
                  disabled={!activityNotes.trim()}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Activity
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
