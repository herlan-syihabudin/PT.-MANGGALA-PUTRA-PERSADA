"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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

// ================= TYPES (sesuai API) =================
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
  status: string
  prioritas: string
  lokasi: string
  catatan: string
  converted_rab_id?: string
  converted_project_id?: string
  created_at: string
  created_by: string
}

interface ActivityLog {
  id: string
  type: 'note' | 'call' | 'email' | 'meeting' | 'status_change'
  description: string
  user: string
  timestamp: string
}

// ================= MAIN COMPONENT =================
export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()

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
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)

  // ================= LOAD DATA =================
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
        
        setActivities([
          {
            id: '1',
            type: 'note',
            description: 'Inquiry dibuat',
            user: json.created_by || 'System',
            timestamp: json.created_at || new Date().toISOString()
          }
        ])
      } catch {
        toast.error("Gagal load detail inquiry")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [inquiry_id])

  // ================= CONVERT TO RAB =================
  const convertToRAB = async () => {
    try {
      setIsUpdating(true)

      const res = await fetch("/api/estimator/rab/from-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry_id }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error()

      toast.success("Berhasil convert ke RAB")
      router.push(`/admin/estimator/rab/${result.rab_id}`)
    } catch {
      toast.error("Gagal convert ke RAB")
    } finally {
      setIsUpdating(false)
    }
  }

  // ================= UPDATE INQUIRY =================
  const updateInquiry = async () => {
    try {
      setIsUpdating(true)

      const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedData),
      })

      if (!res.ok) throw new Error()

      setData(prev => ({ ...prev!, ...editedData }))
      setIsEditMode(false)
      toast.success("Data berhasil diupdate")
      
      setActivities(prev => [{
        id: Date.now().toString(),
        type: 'note',
        description: 'Data inquiry diupdate',
        user: 'Current User',
        timestamp: new Date().toISOString()
      }, ...prev])
    } catch {
      toast.error("Gagal update data")
    } finally {
      setIsUpdating(false)
    }
  }

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
    if (activities.length >= 2) qualityScore += 5

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
      daysInPipeline > 7 && activities.length < 2

    let recommendation = "Monitor progress"

    if (isStale)
      recommendation = "Escalate atau close sebagai lost"
    else if (needsFollowUp)
      recommendation = "Segera lakukan follow up"
    else if (data.status?.toLowerCase() === "estimating")
      recommendation = "Selesaikan RAB terlebih dahulu"
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
    }
  }, [data, activities])

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
      {/* Header dengan Industrial Gradient */}
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

  {/* ================= STEP 1: NEW → SURVEY ================= */}
  {data.status?.toLowerCase() === "new" && (
    <button
      onClick={async () => {
        try {
          const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "survey",
            }),
          })

          if (!res.ok) throw new Error()

          toast.success("Inquiry masuk tahap SURVEY")

          setData(prev =>
            prev
              ? { ...prev, status: "survey" }
              : prev
          )
        } catch {
          toast.error("Gagal ubah ke SURVEY")
        }
      }}
      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
    >
      <Users size={16} />
      Mulai Survey
    </button>
  )}

  {/* ================= STEP 2: SURVEY → ESTIMATING ================= */}
  {data.status?.toLowerCase() === "survey" && (
    <button
      onClick={async () => {
        try {
          const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "estimating",
              assigned_to: "Estimator",
            }),
          })

          if (!res.ok) throw new Error()

          toast.success("Survey selesai, dikirim ke Estimator")

          setData(prev =>
            prev
              ? {
                  ...prev,
                  status: "estimating",
                  assigned_to: "Estimator",
                }
              : prev
          )
        } catch {
          toast.error("Gagal assign ke Estimator")
        }
      }}
      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
    >
      <CheckCircle size={16} />
      Survey Selesai
    </button>
  )}

  {/* ================= FOLLOW UP ================= */}
  <button
    onClick={() => setShowFollowUpModal(true)}
    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10"
  >
    <Phone size={16} />
    Follow Up
  </button>

  {/* ================= EDIT ================= */}
  <button
    onClick={() => setIsEditMode(!isEditMode)}
    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
  >
    <Edit size={16} />
    {isEditMode ? "Cancel" : "Edit"}
  </button>

</div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Analytics Cards - Premium Subtle */}
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

        {/* AI Recommendation - Premium Card */}
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
        
        {/* Warning Banner - Premium Warning */}
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

        {/* Tabs Navigation - Premium */}
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
              />
            )}

            {activeTab === 'activity' && (
              <ActivityTab 
                activities={activities}
                onAddFollowUp={() => setShowFollowUpModal(true)}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsTab inquiryId={data.inquiry_id} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Convert Section - Premium Sticky */}
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 sticky bottom-4 shadow-lg backdrop-blur-sm bg-white/90">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Status Pipeline</p>
              <p className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                {data.status}
                {data.status === 'estimating' && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    Siap convert
                  </span>
                )}
              </p>
            </div>

            {data.converted_rab_id ? (
              <button
                onClick={() => router.push(`/admin/estimator/rab/${data.converted_rab_id}`)}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <CheckCircle size={18} />
                View RAB Project
              </button>
            ) : (
              <button
                onClick={convertToRAB}
                disabled={
  data.status?.toLowerCase() !== "estimating" ||
  !data.assigned_to ||
  isUpdating
}
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
                    Convert ke RAB
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Follow Up Modal - Premium */}
      <AnimatePresence>
        {showFollowUpModal && (
          <FollowUpModal
            onClose={() => setShowFollowUpModal(false)}
            onSave={(type: string, notes: string) => {
              setActivities(prev => [{
                id: Date.now().toString(),
                type: type as any,
                description: notes,
                user: 'Current User',
                timestamp: new Date().toISOString()
              }, ...prev])
              setShowFollowUpModal(false)
              toast.success("Follow up dicatat")
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ================= TAB COMPONENTS =================

function OverviewTab({ data, isEditMode, editedData, setEditedData, onSave, isUpdating }: any) {
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
                  value={editedData.nama_pekerjaan}
                  onChange={(e) => setEditedData({ ...editedData, nama_pekerjaan: e.target.value })}
                />
                <EditField
                  label="Layanan"
                  name="layanan"
                  value={editedData.layanan}
                  onChange={(e) => setEditedData({ ...editedData, layanan: e.target.value })}
                />
                <EditField
                  label="Sumber Lead"
                  name="sumber"
                  value={editedData.sumber}
                  onChange={(e) => setEditedData({ ...editedData, sumber: e.target.value })}
                />
                <EditField
                  label="Lokasi"
                  name="lokasi"
                  value={editedData.lokasi}
                  onChange={(e) => setEditedData({ ...editedData, lokasi: e.target.value })}
                />
                <EditField
                  label="Assigned To"
                  name="assigned_to"
                  value={editedData.assigned_to}
                  onChange={(e) => setEditedData({ ...editedData, assigned_to: e.target.value })}
                />
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Prioritas</label>
                  <select
                    value={editedData.prioritas}
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
                <InfoField label="Assigned To" value={data.assigned_to || '-'} />
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
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

      {/* Right Column - Timeline & Stats */}
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
      </div>
    </div>
  )
}

function ActivityTab({ activities, onAddFollowUp }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-slate-800">Activity History</h2>
        <button
          onClick={onAddFollowUp}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Add Follow Up
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity: ActivityLog, index: number) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100"
          >
            <ActivityIcon type={activity.type} />
            <div className="flex-1">
              <p className="font-medium text-slate-800">{activity.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {activity.user}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(activity.timestamp).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {activities.length === 0 && (
          <p className="text-center text-slate-400 py-8">
            Belum ada activity
          </p>
        )}
      </div>
    </div>
  )
}

function DocumentsTab({ inquiryId }: any) {
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

function FollowUpModal({ onClose, onSave }: any) {
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

function ActivityIcon({ type }: { type: string }) {
  const icons = {
    note: <FileText size={20} className="text-slate-600" />,
    call: <Phone size={20} className="text-slate-600" />,
    email: <Mail size={20} className="text-slate-600" />,
    meeting: <Users size={20} className="text-slate-600" />,
    status_change: <RefreshCw size={20} className="text-slate-600" />,
  }
  return icons[type as keyof typeof icons] || <Activity size={20} className="text-slate-600" />
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
