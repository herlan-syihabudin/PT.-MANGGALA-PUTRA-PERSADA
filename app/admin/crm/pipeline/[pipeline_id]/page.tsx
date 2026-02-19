"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { toast } from "sonner"

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
  last_activity_at: string // Untuk aging yang akurat
  status?: string
  probability: number
  aging_days: number
  // Commercial
  discount_percent?: number
  gross_margin?: number // READ ONLY - dari RAB
  payment_terms?: string
  // Risk
  competitor?: string
  risk_flags?: string[]
  win_probability?: number
  // Metadata
  assigned_to?: string
  assigned_name?: string
  source?: string
  priority?: string
  notes?: string
  last_followup?: string
}

type ActivityLog = {
  id: string
  type: "note" | "call" | "email" | "meeting" | "status_change"
  description: string
  user: string
  timestamp: string
  metadata?: any
}

// ================= CONFIG =================
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

// ================= HELPER =================
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

function getAgingStatus(days: number): "normal" | "warning" | "critical" {
  if (days > 30) return "critical"
  if (days > 14) return "warning"
  return "normal"
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
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteText, setNoteText] = useState("")

  // ================= FETCH DEAL =================
  useEffect(() => {
    if (!params.pipeline_id) return notFound()

    const fetchDeal = async () => {
      setLoading(true)
      try {
        // Fetch deal detail
        const res = await fetch(`/api/crm/pipeline/${params.pipeline_id}`)
        if (!res.ok) throw new Error("Failed to fetch deal")
        const json = await res.json()
        setDeal(json)

        // Fetch activity logs
        const activityRes = await fetch(`/api/crm/pipeline/${params.pipeline_id}/activities`)
        if (activityRes.ok) {
          const activityJson = await activityRes.json()
          setActivities(activityJson)
        }
      } catch (e) {
        console.error("Error fetch deal", e)
        toast.error("Gagal memuat data deal")
      } finally {
        setLoading(false)
      }
    }

    fetchDeal()
  }, [params.pipeline_id])

  // ================= ADD NOTE =================
  const addNote = async () => {
    if (!noteText.trim() || !deal) return

    try {
      const res = await fetch(`/api/crm/pipeline/${deal.pipeline_id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "note",
          description: noteText,
        }),
      })

      if (!res.ok) throw new Error()

      const newActivity = await res.json()
      setActivities([newActivity, ...activities])
      
      // Update last activity timestamp untuk aging
      setDeal({
        ...deal,
        last_activity_at: new Date().toISOString(),
        aging_days: 0,
      })
      
      setNoteText("")
      setShowNoteModal(false)
      toast.success("Catatan ditambahkan")
    } catch {
      toast.error("Gagal menambah catatan")
    }
  }

  // ================= CONVERT TO PROJECT =================
  const convertToProject = async () => {
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
          rab_id: deal.rab_id, // ✅ Kirim RAB ID untuk di-copy
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || "Gagal konversi")
      }

      // Update local state with project_id
      setDeal({
        ...deal,
        project_id: result.project_id,
      })

      // Add activity log
      const activityRes = await fetch(`/api/crm/pipeline/${deal.pipeline_id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "status_change",
          description: `Deal dikonversi ke project: ${result.project_id}`,
        }),
      })

      if (activityRes.ok) {
        const newActivity = await activityRes.json()
        setActivities([newActivity, ...activities])
      }

      toast.success("Deal berhasil dikonversi ke project")
      router.push(`/admin/project/${result.project_id}`)
    } catch (error: any) {
      toast.error(error.message || "Gagal konversi ke project")
    } finally {
      setConverting(false)
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
                  {deal.project_name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageConfig.bgColor} ${stageConfig.textColor} border ${stageConfig.borderColor}`}>
                    {stageConfig.label}
                  </span>
                  <span className="text-sm text-slate-300">
                    ID: {deal.pipeline_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Only what's allowed */}
            <div className="flex gap-2">
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

            {/* Commercial Section - PREMIUM */}
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
                          className={`h-2 rounded-full ${
                            (deal.win_probability || deal.probability * 100) >= 70
                              ? "bg-emerald-500"
                              : (deal.win_probability || deal.probability * 100) >= 40
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${deal.win_probability || deal.probability * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {deal.win_probability || Math.round(deal.probability * 100)}%
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

            {/* Activity Log */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <History size={18} className="text-slate-500" />
                  Activity Log
                </h3>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  + Add Note
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {activities.length === 0 ? (
                  <p className="text-center text-slate-400 py-4">No activity yet</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === "note" && <MessageSquare size={16} className="text-slate-500" />}
                        {activity.type === "call" && <Phone size={16} className="text-green-500" />}
                        {activity.type === "email" && <Mail size={16} className="text-blue-500" />}
                        {activity.type === "meeting" && <Users size={16} className="text-purple-500" />}
                        {activity.type === "status_change" && <RefreshCcw size={16} className="text-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-800">{activity.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {activity.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
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
                        className={`h-2 rounded-full ${
                          (deal.win_probability || deal.probability * 100) >= 70
                            ? "bg-emerald-500"
                            : (deal.win_probability || deal.probability * 100) >= 40
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${deal.win_probability || deal.probability * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {deal.win_probability || Math.round(deal.probability * 100)}%
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
                        Last activity: {formatDate(deal.last_activity_at || deal.last_followup)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Berdasarkan aktivitas terakhir
                  </p>
                </div>
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
                  onClick={() => setShowNoteModal(true)}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  Add Note
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
                    // Email simulation
                    toast.success("Email draft prepared")
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

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Note</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              placeholder="Tulis catatan..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={addNote}
                disabled={!noteText.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
