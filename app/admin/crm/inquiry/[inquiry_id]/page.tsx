"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import ActivityTimeline from "@/components/dashboard/ActivityTimeline"
import {
  ArrowLeft,
  CheckCircle,
  User,
  FileText,
  DollarSign,
  Clock,
  Activity,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  Tag,
  Phone,
  Mail,
  Building,
  Edit,
  Save,
  X,
  RefreshCw,
  BarChart3,
  Target,
  Zap,
  Users,
  MessageSquare,
  Paperclip,
  History,
  Star,
} from "lucide-react"
import { toast } from "sonner"

// ================= TYPES =================
interface InquiryData {
  inquiry_id: string
  tanggal_masuk: string
  customer_id: string
  customer_name: string
  nama_pekerjaan: string
  layanan: string
  estimasi_nilai: number | null
  sumber: string
  assigned_to: string
  assigned_name?: string
  assigned_divisi?: string
  assigned_jabatan?: string
  status: string
  prioritas: string
  lokasi: string
  catatan: string
  converted_rab_id?: string
  converted_project_id?: string
  created_at: string
  created_by: string
}

interface Estimator {
  employee_id: string
  nama_lengkap: string
  department?: string
  jabatan?: string
  divisi?: string
}

// ================= PROPS TYPES =================
interface OverviewTabProps {
  data: InquiryData
  isEditMode: boolean
  editedData: Partial<InquiryData>
  setEditedData: React.Dispatch<React.SetStateAction<Partial<InquiryData>>>
  onSave: () => Promise<void>
  isUpdating: boolean
  estimators: Estimator[]
  loadingEstimators: boolean
}


interface DocumentsTabProps {
  inquiryId: string
}


// ================= MAIN COMPONENT =================
export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const saveInProgress = useRef(false)

  const inquiry_id =
    typeof params.inquiry_id === "string"
      ? params.inquiry_id
      : params.inquiry_id?.[0] || ""

  const [data, setData] = useState<InquiryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'documents'>('overview')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedData, setEditedData] = useState<Partial<InquiryData>>({})
  
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  
  // Estimator state
  const [estimators, setEstimators] = useState<Estimator[]>([])
  const [loadingEstimators, setLoadingEstimators] = useState(false)
  const [estimatorsLoaded, setEstimatorsLoaded] = useState(false)

  // ================= LOAD INQUIRY DETAIL =================
  useEffect(() => {
    if (!inquiry_id) return

    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error()
        const json = await res.json()
        setData(json)
        setEditedData(json)
        
      } catch {
        toast.error("Gagal load detail inquiry")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [inquiry_id])

  // ================= LOAD ESTIMATORS =================
  useEffect(() => {
    if (estimatorsLoaded) return

    const loadEstimators = async () => {
      setLoadingEstimators(true)

      try {
        const res = await fetch("/api/hr/employees?active_only=true")
        if (!res.ok) throw new Error()

        const result = await res.json()

        const employeeArray = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : []

        // ✅ Filter estimator - konsisten dengan Create Page
        const filtered = employeeArray.filter((emp: any) => {
          const dept = emp.department?.toLowerCase() || ""
          const jab = emp.jabatan?.toLowerCase() || ""
          const divisi = emp.divisi?.toLowerCase() || ""

          return (
            dept === "engineering" ||
            divisi === "engineering" ||
            jab.includes("estimator") ||
            jab.includes("estimasi")
          )
        })

        setEstimators(filtered)
        setEstimatorsLoaded(true)
        
        console.log(`✅ Loaded ${filtered.length} estimators`)
      } catch (error) {
        console.error("Failed to load estimators:", error)
        toast.error("Gagal memuat daftar estimator")
      } finally {
        setLoadingEstimators(false)
      }
    }

    loadEstimators()
  }, [estimatorsLoaded])

  // ================= CONVERT TO RAB =================
  const createRAB = async () => {
    try {
      setIsUpdating(true)

      const res = await fetch("/api/estimator/rab/from-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry_id }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error()

      toast.success("Berhasil buat RAB")
      setData(prev =>
        prev
          ? {
              ...prev,
              converted_rab_id: result.rab_id,
              status: "boq_created",
            }
          : prev
      )

      router.push(`/admin/estimator/rab/${result.rab_id}`)
    } catch {
      toast.error("Gagal buat RAB")
    } finally {
      setIsUpdating(false)
    }
  }

  // ================= UPDATE STATUS =================
  const updateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true)

      const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error()

      toast.success(`Status berhasil diubah ke ${newStatus}`)
      setData(prev => (prev ? { ...prev, status: newStatus } : prev))
    } catch {
      toast.error("Gagal ubah status")
    } finally {
      setIsUpdating(false)
    }
  }

  // ================= UPDATE INQUIRY (dengan debounce) =================
  const updateInquiry = useCallback(async () => {
    // Prevent double submission
    if (saveInProgress.current) return
    saveInProgress.current = true

    try {
      setIsUpdating(true)

      const allowedFields = [
        "nama_pekerjaan",
        "layanan",
        "sumber",
        "lokasi",
        "assigned_to",
        "prioritas",
        "catatan",
        "estimasi_nilai",
      ]

      const filteredData = Object.fromEntries(
        Object.entries(editedData).filter(([key]) =>
          allowedFields.includes(key)
        )
      )

      const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filteredData),
      })

      if (!res.ok) throw new Error()

      const result = await res.json()
      
      // ✅ Refresh data dari API untuk dapat assigned_name dll
      const refreshRes = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
        cache: "no-store",
      })
      
      if (refreshRes.ok) {
        const refreshedData = await refreshRes.json()
        setData(refreshedData)
      } else {
        // Fallback: update manual
        setData(prev =>
          prev ? { ...prev, ...filteredData } : prev
        )
      }

      setIsEditMode(false)
      toast.success("Data berhasil diupdate")

    } catch {
      toast.error("Gagal update data")
    } finally {
      setIsUpdating(false)
      saveInProgress.current = false
    }
  }, [editedData, inquiry_id])

  // ================= ANALYTICS =================
  const analytics = useMemo(() => {
    if (!data) return null

    const tanggalMasuk = new Date(data.tanggal_masuk).getTime()
    const now = Date.now()
    const daysInPipeline = isNaN(tanggalMasuk)
      ? 0
      : Math.floor((now - tanggalMasuk) / (1000 * 60 * 60 * 24))

    const probabilityMap: Record<string, number> = {
      new: 15,
      survey: 30,
      estimating: 55,
      boq_created: 65,
      proposal: 75,
      negotiation: 85,
      won: 100,
      lost: 0,
    }

    let probability = probabilityMap[data.status?.toLowerCase()] ?? 10

    if (daysInPipeline > 45) probability *= 0.6
    else if (daysInPipeline > 30) probability *= 0.7
    else if (daysInPipeline > 14) probability *= 0.85

    probability = Math.round(probability)

    let qualityScore = 0

    if (data.estimasi_nilai) {
      if (data.estimasi_nilai > 1000000000) qualityScore += 45
      else if (data.estimasi_nilai > 500000000) qualityScore += 35
      else if (data.estimasi_nilai > 100000000) qualityScore += 25
      else if (data.estimasi_nilai > 50000000) qualityScore += 15
      else qualityScore += 8
    }

    if (data.prioritas?.toLowerCase() === "high") qualityScore += 20
    if (data.prioritas?.toLowerCase() === "medium") qualityScore += 10

    if (data.assigned_to) qualityScore += 5
    qualityScore += 5

    qualityScore = Math.min(100, qualityScore)

    const dealScore = Math.round(
      probability * 0.4 +
      qualityScore * 0.4 +
      (daysInPipeline < 14 ? 20 : 10)
    )

    const expectedRevenue = data.estimasi_nilai
      ? Math.round(data.estimasi_nilai * (probability / 100))
      : 0

    const isAging = daysInPipeline > 14
    const isStale = daysInPipeline > 30
    const needsFollowUp =
  daysInPipeline > 7
    let leadHealth = "healthy"

if (daysInPipeline > 30) leadHealth = "critical"
else if (daysInPipeline > 14) leadHealth = "aging"

    let recommendation = "Monitor progress"

    if (isStale)
      recommendation = "Escalate atau close sebagai lost"
    else if (needsFollowUp)
      recommendation = "Segera lakukan follow up"
    else if (data.status?.toLowerCase() === "estimating")
      recommendation = "Buat RAB terlebih dahulu"
    else if (probability > 75)
      recommendation = "High chance deal – prioritaskan closing"

    return {
      daysInPipeline,
      probability,
      qualityScore,
      dealScore,
      expectedRevenue,
      isAging,
      isStale,
      needsFollowUp,
      recommendation,
      leadHealth,
    }
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-800 mx-auto mb-4" />
          <p className="text-slate-500">Memuat data inquiry...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
          <p className="text-rose-600 font-semibold">Data tidak ditemukan</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header - sama seperti sebelumnya */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-300 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight flex items-center gap-3">
                  {data.nama_pekerjaan || 'Untitled Project'}
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-mono text-slate-300 border border-white/10">
                    {data.inquiry_id}
                  </span>
                </h1>
                <p className="text-slate-300 mt-1 flex items-center gap-2">
                  <Building size={14} className="opacity-70" />
                  {data.customer_name} • {data.lokasi || 'Lokasi tidak ditentukan'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Status buttons - sama seperti sebelumnya */}
              {data.status?.toLowerCase() === "new" && (
                <button
                  onClick={() => updateStatus("survey")}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Users size={16} />
                  Mulai Survey
                </button>
              )}

              {data.status?.toLowerCase() === "survey" && (
                <button
                  onClick={() => updateStatus("estimating")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Survey Selesai
                </button>
              )}

              {data.status?.toLowerCase() === "estimating" && (
                <button
                  onClick={createRAB}
                  disabled={!data.assigned_to || isUpdating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FileText size={16} />
                  Buat RAB
                </button>
              )}

              {data.status?.toLowerCase() === "boq_created" && (
                <button
                  onClick={() => updateStatus("proposal")}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <FileText size={16} />
                  Buat Proposal
                </button>
              )}

              {data.status?.toLowerCase() === "proposal" && (
                <button
                  onClick={() => updateStatus("negotiation")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <TrendingUp size={16} />
                  Mulai Negosiasi
                </button>
              )}

              {data.status?.toLowerCase() === "negotiation" && (
                <>
                  <button
                    onClick={() => updateStatus("won")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Won
                  </button>
                  <button
                    onClick={() => updateStatus("lost")}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Lost
                  </button>
                </>
              )}

              <button
                onClick={() => setShowFollowUpModal(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10"
              >
                <Phone size={16} />
                Follow Up
              </button>

              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                {isEditMode ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Analytics Cards - sama */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <AnalyticCard
              icon={<TrendingUp className="text-slate-600" size={20} />}
              label="Win Probability"
              value={`${analytics.probability}%`}
              progress={analytics.probability}
            />
            <AnalyticCard
              icon={<Clock className="text-slate-600" size={20} />}
              label="Pipeline Age"
              value={`${analytics.daysInPipeline} hari`}
              subtext={analytics.isAging ? 'Aging' : 'Normal'}
              status={analytics.isAging ? 'warning' : 'normal'}
            />
            <AnalyticCard
              icon={<Target className="text-slate-600" size={20} />}
              label="Lead Quality"
              value={analytics.qualityScore.toString()}
              progress={analytics.qualityScore}
            />
            <AnalyticCard
              icon={<DollarSign className="text-slate-600" size={20} />}
              label="Expected Revenue"
              value={`Rp ${analytics.expectedRevenue.toLocaleString('id-ID')}`}
            />
            <AnalyticCard
              icon={<Star className="text-slate-600" size={20} />}
              label="Deal Score"
              value={`${analytics.dealScore}/100`}
              progress={analytics.dealScore}
            />
          </div>
        )}

        {/* AI Recommendation - sama */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Zap size={18} className="text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">AI RECOMMENDATION</p>
              <p className="font-medium text-slate-800">
                {analytics?.recommendation}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-sm">
  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
    Lead Health
  </p>

  <div className="flex items-center gap-2">
    {analytics?.leadHealth === "healthy" && (
      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
        🟢 Healthy Lead
      </span>
    )}

    {analytics?.leadHealth === "aging" && (
      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
        🟡 Aging Lead
      </span>
    )}

    {analytics?.leadHealth === "critical" && (
      <span className="px-3 py-1 bg-rose-100 text-rose-700 text-sm rounded-full">
        🔴 Critical Lead
      </span>
    )}
  </div>
</div>
        
        {/* Warning Banner - sama */}
        {analytics?.isStale && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3 shadow-sm"
          >
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-amber-800">Lead Stale Warning</h3>
              <p className="text-sm text-amber-700">
                Inquiry ini sudah {analytics.daysInPipeline} hari di pipeline tanpa progress. 
                Segera lakukan follow up atau update status.
              </p>
            </div>
          </motion.div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'activity', label: 'Activity', icon: History },
              { id: 'documents', label: 'Documents', icon: Paperclip },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id 
                      ? 'border-slate-800 text-slate-800' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >

    {activeTab === 'overview' && (
      <OverviewTab 
        data={data} 
        isEditMode={isEditMode}
        editedData={editedData}
        setEditedData={setEditedData}
        onSave={updateInquiry}
        isUpdating={isUpdating}
        estimators={estimators}
        loadingEstimators={loadingEstimators}
      />
    )}

    {activeTab === 'activity' && (
      <ActivityTimeline inquiryId={data.inquiry_id} />
    )}

    {activeTab === 'documents' && (
      <DocumentsTab inquiryId={data.inquiry_id} />
    )}

  </motion.div>
</AnimatePresence>

        {/* Convert Section */}
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 sticky bottom-4 shadow-lg backdrop-blur-sm bg-white/90">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status Pipeline</p>
              <p className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                {data.status}
                {data.status?.toLowerCase() === 'estimating' && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    {data.assigned_to ? 'Siap buat RAB' : 'Assign estimator dulu'}
                  </span>
                )}
              </p>
            </div>

            {data.converted_rab_id ? (
              <button
                onClick={() =>
                  router.push(`/admin/estimator/rab/${data.converted_rab_id}`)
                }
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <CheckCircle size={18} />
                View RAB
              </button>
            ) : data.status?.toLowerCase() === "estimating" ? (
              <button
                onClick={createRAB}
                disabled={!data.assigned_to || isUpdating}
                className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    {data.assigned_to ? 'Buat RAB' : 'Assign Estimator Dulu'}
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Follow Up Modal */}
      <AnimatePresence>
        {showFollowUpModal && (
          <FollowUpModal
            onClose={() => setShowFollowUpModal(false)}
            onSave={async (type: string, notes: string) => {
  try {

    const res = await fetch(`/api/crm/activity/${data.inquiry_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type,
        description: notes
      })
    })

    if (!res.ok) throw new Error()

    toast.success("Follow up dicatat")
    setShowFollowUpModal(false)
    window.dispatchEvent(new Event("activity-updated"))

  } catch {
    toast.error("Gagal menyimpan follow up")
  }
}}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ================= TAB COMPONENTS dengan Type Safety =================

function OverviewTab({ 
  data, 
  isEditMode, 
  editedData, 
  setEditedData, 
  onSave, 
  isUpdating, 
  estimators,
  loadingEstimators
}: OverviewTabProps) {
  
  // Cari nama estimator yang dipilih
  const selectedEstimator = estimators.find(
    (e: Estimator) => e.employee_id === editedData.assigned_to
  )

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Customer & Project */}
      <div className="lg:col-span-2 space-y-6">
        <Card title="Customer Information" icon={User}>
          <div className="grid sm:grid-cols-2 gap-6">
            <InfoField
              label="Customer ID"
              value={data.customer_id}
            />
            <InfoField
              label="Customer Name"
              value={data.customer_name}
            />
          </div>
        </Card>

        <Card title="Project Details" icon={FileText}>
          <div className="grid sm:grid-cols-2 gap-6">
            {isEditMode ? (
              <>
                <EditField
                  label="Nama Pekerjaan"
                  name="nama_pekerjaan"
                  value={editedData.nama_pekerjaan || ''}
                  onChange={(e) => setEditedData({ ...editedData, nama_pekerjaan: e.target.value })}
                />
                <EditField
                  label="Layanan"
                  name="layanan"
                  value={editedData.layanan || ''}
                  onChange={(e) => setEditedData({ ...editedData, layanan: e.target.value })}
                />
                <EditField
                  label="Sumber Lead"
                  name="sumber"
                  value={editedData.sumber || ''}
                  onChange={(e) => setEditedData({ ...editedData, sumber: e.target.value })}
                />
                <EditField
                  label="Lokasi"
                  name="lokasi"
                  value={editedData.lokasi || ''}
                  onChange={(e) => setEditedData({ ...editedData, lokasi: e.target.value })}
                />
                
                {/* Assigned To dropdown dengan loading state */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Assigned Estimator</label>
                  <select
                    value={editedData.assigned_to || ''}
                    onChange={(e) =>
                      setEditedData({ ...editedData, assigned_to: e.target.value })
                    }
                    disabled={loadingEstimators}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent disabled:bg-slate-100 disabled:cursor-wait"
                  >
                    <option value="">
                      {loadingEstimators ? "Loading estimators..." : "-- Pilih Estimator --"}
                    </option>
                    {estimators.length > 0 ? (
                      estimators.map((estimator: Estimator) => (
                        <option key={estimator.employee_id} value={estimator.employee_id}>
                          {estimator.nama_lengkap}
                        </option>
                      ))
                    ) : (
                      !loadingEstimators && (
                        <option value="" disabled>Tidak ada estimator tersedia</option>
                      )
                    )}
                  </select>
                  {selectedEstimator && (
                    <p className="text-xs text-emerald-600 mt-1">
                      ✓ {selectedEstimator.nama_lengkap}
                    </p>
                  )}
                  {loadingEstimators && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <RefreshCw size={12} className="animate-spin" />
                      Memuat daftar estimator...
                    </p>
                  )}
                  {!loadingEstimators && estimators.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Tidak ada estimator ditemukan
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Prioritas</label>
                  <select
                    value={editedData.prioritas || 'medium'}
                    onChange={(e) => setEditedData({ ...editedData, prioritas: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <InfoField label="Nama Pekerjaan" value={data.nama_pekerjaan} />
                <InfoField label="Layanan" value={data.layanan || '-'} />
                <InfoField label="Sumber Lead" value={data.sumber || '-'} />
                <InfoField label="Lokasi" value={data.lokasi || '-'} />
                
                <InfoField 
                  label="Assigned Estimator" 
                  value={data.assigned_name || data.assigned_to || '-'}
                >
                  {data.assigned_divisi && (
                    <p className="text-xs text-slate-400 mt-1">{data.assigned_divisi} • {data.assigned_jabatan}</p>
                  )}
                </InfoField>

                <InfoField label="Prioritas" value={data.prioritas || '-'}>
                  {data.prioritas && (
                    <PriorityBadge priority={data.prioritas} />
                  )}
                </InfoField>
              </>
            )}
          </div>
          {isEditMode && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={onSave}
                disabled={isUpdating}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </Card>

        {data.catatan && (
          <Card title="Catatan" icon={MessageSquare}>
            <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
              {data.catatan}
            </p>
          </Card>
        )}
      </div>

      {/* Right Column */}
<div className="space-y-6">

  <Card title="Timeline" icon={Calendar}>
    <div className="space-y-4">
      <TimelineItem
        label="Created At"
        value={data.created_at ? new Date(data.created_at).toLocaleString('id-ID') : '-'}
        icon={Calendar}
      />
      <TimelineItem
        label="Created By"
        value={data.created_by || 'System'}
        icon={User}
      />
    </div>
  </Card>

  <Card title="Quick Stats" icon={Activity}>
    <div className="space-y-3">
      <StatBar label="Data Completion" value={75} />
      <StatBar label="Follow Up Progress" value={60} />
    </div>
  </Card>

  {/* TAMBAHAN BARU */}
  <Card title="Recent Activity" icon={History}>
    <RecentActivity inquiryId={data.inquiry_id} />
  </Card>

</div>
    </div>
  )
}


function DocumentsTab({ inquiryId }: DocumentsTabProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h2 className="font-semibold text-slate-800 mb-6">Documents</h2>
      <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
        <Paperclip className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Belum ada dokumen</p>
        <p className="text-sm mt-2">Fitur upload dokumen akan segera hadir</p>
      </div>
    </div>
  )
}

// ================= MODAL COMPONENT =================

interface FollowUpModalProps {
  onClose: () => void
  onSave: (type: string, notes: string) => void
}

function FollowUpModal({ onClose, onSave }: FollowUpModalProps) {
  const [type, setType] = useState('call')
  const [notes, setNotes] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Add Follow Up</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['call', 'email', 'meeting'].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                    ${type === t 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              placeholder="Tulis hasil follow up..."
            />
          </div>

          <button
            onClick={() => onSave(type, notes)}
            disabled={!notes.trim()}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Follow Up
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ================= HELPER COMPONENTS =================

function Card({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-slate-500" />}
        <h3 className="font-medium text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoField({ label, value, children }: any) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="font-medium text-slate-800 break-words">
        {value || '-'}
      </p>
      {children}
    </div>
  )
}

function EditField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
      />
    </div>
  )
}

function AnalyticCard({ icon, label, value, subtext, progress, status }: any) {
  const statusColors = {
    warning: 'bg-amber-50 border-amber-200',
    normal: 'bg-white border-slate-200',
  }

  const bgColor = status ? statusColors[status] : 'bg-white border-slate-200'

  return (
    <div className={`${bgColor} border rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-slate-100 rounded-lg">
          {icon}
        </div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-xl font-semibold text-slate-800">{value}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-slate-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

function TimelineItem({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 rounded-lg">
        <Icon size={16} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}


function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    high: 'bg-rose-100 text-rose-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-emerald-100 text-emerald-700',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ml-2 font-medium ${colors[priority.toLowerCase() as keyof typeof colors] || 'bg-slate-100 text-slate-700'}`}>
      {priority}
    </span>
  )
}

function StatBar({ label, value }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-700">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-600 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function RecentActivity({ inquiryId }: { inquiryId: string }) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastContact, setLastContact] = useState<Date | null>(null)

  const load = async () => {
    try {
      const res = await fetch(`/api/crm/activity/${inquiryId}`)
      if (!res.ok) throw new Error()

      const data = await res.json()

      setActivities(data.slice(0, 5))

if (data.length > 0) {
  setLastContact(new Date(data[0].created_at))
}
    } catch {
      console.error("Failed load activity")
    } finally {
      setLoading(false)
    }
  }

  // load pertama
  useEffect(() => {
    load()
  }, [inquiryId])

  // reload ketika ada activity baru
  useEffect(() => {
    const reload = () => load()

    window.addEventListener("activity-updated", reload)

    return () => {
      window.removeEventListener("activity-updated", reload)
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-slate-400">Loading activity...</p>
  }

  if (activities.length === 0) {
    return <p className="text-sm text-slate-400">Belum ada aktivitas</p>
  }

    return (
  <div>

    {lastContact && (
  <p className="text-xs text-slate-400 mb-3">
    Last contact • {lastContact.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })}
  </p>
)}

    <div className="space-y-3">
      {activities.map((a: any) => (
        <div
          key={a.id}
          className="flex items-start gap-2 text-sm border-b border-slate-100 pb-2"
        >
          <Clock size={14} className="text-slate-400 mt-0.5" />

          <div>
            <p className="text-slate-700">{a.description}</p>

            <p className="text-xs text-slate-400">
              {new Date(a.created_at).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
