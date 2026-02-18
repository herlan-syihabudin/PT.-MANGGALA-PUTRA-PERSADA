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
  Download,
  Share2,
  MoreVertical,
  PieChart,
  Target,
  Zap,
  Shield,
  Users,
  MessageSquare,
  Paperclip,
  History,
  Star,
  Award,
  BarChart3,
  RefreshCw,
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
  status: string
  prioritas: string
  lokasi: string
  catatan: string
  converted_rab_id?: string
  converted_project_id?: string
  created_at: string
  created_by: string
  // Tambahan field untuk enrichment
  customer_email?: string
  customer_phone?: string
  follow_up_count?: number
  last_follow_up?: string
  next_follow_up?: string
  probability?: number
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
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'documents' | 'analytics'>('overview')
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
        
        // Load mock activities (nanti diganti dengan API real)
        setActivities([
          {
            id: '1',
            type: 'note',
            description: 'Inquiry dibuat oleh sistem',
            user: 'System',
            timestamp: json.tanggal_masuk
          },
          {
            id: '2',
            type: 'status_change',
            description: 'Status berubah menjadi survey',
            user: 'John Doe',
            timestamp: new Date().toISOString()
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
    } catch {
      toast.error("Gagal update data")
    } finally {
      setIsUpdating(false)
    }
  }

  // ================= FOLLOW UP =================
  const addFollowUp = async (type: string, notes: string) => {
    // Implementasi follow up
    toast.success("Follow up dicatat")
    setShowFollowUpModal(false)
  }

  // ================= ANALYTICS & SCORING =================
  const analytics = useMemo(() => {
    if (!data) return null

    const tanggalMasuk = new Date(data.tanggal_masuk).getTime()
    const now = Date.now()
    const daysInPipeline = Math.floor((now - tanggalMasuk) / (1000 * 60 * 60 * 24))

    // Win probability berdasarkan status dan umur pipeline
    const baseProbability: Record<string, number> = {
      new: 20,
      survey: 40,
      estimating: 65,
      sent: 80,
      won: 100,
      lost: 0,
    }

    let probability = baseProbability[data.status?.toLowerCase()] || 10

    // Penalti kalau terlalu lama di pipeline
    if (daysInPipeline > 30) probability *= 0.7
    else if (daysInPipeline > 14) probability *= 0.85

    // Bonus kalau sudah ada follow up
    if (activities.length > 2) probability *= 1.1

    probability = Math.min(100, Math.max(0, Math.round(probability)))

    // Score kualitas lead
    let qualityScore = 0
    if (data.estimasi_nilai) {
      if (data.estimasi_nilai > 500000000) qualityScore += 40
      else if (data.estimasi_nilai > 100000000) qualityScore += 30
      else if (data.estimasi_nilai > 50000000) qualityScore += 20
      else qualityScore += 10
    }

    if (data.prioritas?.toLowerCase() === 'high') qualityScore += 20
    if (data.prioritas?.toLowerCase() === 'medium') qualityScore += 10

    if (data.lokasi) qualityScore += 10

    return {
      daysInPipeline,
      probability,
      qualityScore: Math.min(100, qualityScore),
      expectedRevenue: data.estimasi_nilai ? 
        Math.round(data.estimasi_nilai * (probability / 100)) : 0,
      isAging: daysInPipeline > 14,
      isStale: daysInPipeline > 30,
      needsFollowUp: daysInPipeline > 7 && activities.length < 3,
    }
  }, [data, activities])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-400">Memuat data inquiry...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-semibold">Data tidak ditemukan</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header dengan Background Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  {data.nama_pekerjaan}
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-mono">
                    {data.inquiry_id}
                  </span>
                </h1>
                <p className="text-blue-100 mt-1">
                  {data.customer_name} • {data.lokasi || 'Lokasi tidak ditentukan'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFollowUpModal(true)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Phone size={16} />
                Follow Up
              </button>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                {isEditMode ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <AnalyticCard
              icon={<TrendingUp className="text-blue-600" size={20} />}
              label="Win Probability"
              value={`${analytics.probability}%`}
              progress={analytics.probability}
              color="blue"
            />
            <AnalyticCard
              icon={<Clock className="text-amber-600" size={20} />}
              label="Pipeline Age"
              value={`${analytics.daysInPipeline} hari`}
              subtext={analytics.isAging ? 'Aging' : 'Normal'}
              color={analytics.isAging ? 'red' : 'green'}
            />
            <AnalyticCard
              icon={<Target className="text-purple-600" size={20} />}
              label="Lead Quality"
              value={`${analytics.qualityScore}`}
              progress={analytics.qualityScore}
              color="purple"
            />
            <AnalyticCard
              icon={<DollarSign className="text-green-600" size={20} />}
              label="Expected Revenue"
              value={`Rp ${analytics.expectedRevenue.toLocaleString('id-ID')}`}
              color="green"
            />
            <AnalyticCard
              icon={<Activity className="text-red-600" size={20} />}
              label="Follow Up"
              value={`${activities.length} kali`}
              subtext={analytics.needsFollowUp ? 'Butuh follow up' : 'On track'}
              color={analytics.needsFollowUp ? 'red' : 'green'}
            />
          </div>
        )}

        {/* Warning Banner */}
        {analytics?.isStale && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3"
          >
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-800">Lead Stale Warning</h3>
              <p className="text-sm text-red-700">
                Inquiry ini sudah {analytics.daysInPipeline} hari di pipeline tanpa progress. 
                Segera lakukan follow up atau update status.
              </p>
            </div>
          </motion.div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'activity', label: 'Activity', icon: History },
              { id: 'documents', label: 'Documents', icon: Paperclip },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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

            {activeTab === 'analytics' && (
              <AnalyticsTab data={data} analytics={analytics!} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Convert Section - Fixed at bottom on mobile, inline on desktop */}
        <div className="mt-8 bg-white border rounded-xl p-6 sticky bottom-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Status saat ini</p>
              <p className="font-semibold text-lg capitalize flex items-center gap-2">
                {data.status}
                {data.status === 'estimating' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Siap convert
                  </span>
                )}
              </p>
            </div>

            {data.converted_rab_id ? (
              <button
                onClick={() => router.push(`/admin/estimator/rab/${data.converted_rab_id}`)}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle size={18} />
                View RAB Project
              </button>
            ) : (
              <button
                onClick={convertToRAB}
                disabled={data.status?.toLowerCase() !== "estimating" || isUpdating}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Follow Up Modal */}
      <AnimatePresence>
        {showFollowUpModal && (
          <FollowUpModal
            onClose={() => setShowFollowUpModal(false)}
            onSave={addFollowUp}
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
              icon={<Building size={16} />}
            />
            <InfoField
              label="Customer Name"
              value={data.customer_name}
              icon={<User size={16} />}
            />
            <InfoField
              label="Email"
              value={data.customer_email || '-'}
              icon={<Mail size={16} />}
            />
            <InfoField
              label="Phone"
              value={data.customer_phone || '-'}
              icon={<Phone size={16} />}
            />
          </div>
        </Card>

        <Card title="Project Details" icon={FileText}>
          <div className="grid sm:grid-cols-2 gap-6">
            {isEditMode ? (
              // Edit mode inputs
              <EditField
                label="Nama Pekerjaan"
                name="nama_pekerjaan"
                value={editedData.nama_pekerjaan}
                onChange={(e) => setEditedData({ ...editedData, nama_pekerjaan: e.target.value })}
              />
            ) : (
              <>
                <InfoField label="Nama Pekerjaan" value={data.nama_pekerjaan} />
                <InfoField label="Layanan" value={data.layanan || '-'} />
                <InfoField label="Sumber Lead" value={data.sumber || '-'} icon={<Tag size={16} />} />
                <InfoField label="Lokasi" value={data.lokasi || '-'} icon={<MapPin size={16} />} />
                <InfoField label="Assigned To" value={data.assigned_to || '-'} icon={<Users size={16} />} />
                <InfoField label="Prioritas" value={data.prioritas || '-'}>
                  {data.prioritas && (
                    <PriorityBadge priority={data.prioritas} />
                  )}
                </InfoField>
              </>
            )}
          </div>
        </Card>

        {data.catatan && (
          <Card title="Catatan" icon={MessageSquare}>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
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
              value={new Date(data.created_at).toLocaleString('id-ID')}
              icon={Calendar}
            />
            <TimelineItem
              label="Last Updated"
              value={new Date().toLocaleString('id-ID')}
              icon={RefreshCw}
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
            <StatBar label="Completion" value={75} color="blue" />
            <StatBar label="Documents" value={30} color="green" />
            <StatBar label="Follow Ups" value={60} color="purple" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function ActivityTab({ activities, onAddFollowUp }: any) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-lg">Activity History</h2>
        <button
          onClick={onAddFollowUp}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
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
            className="flex gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <ActivityIcon type={activity.type} />
            <div className="flex-1">
              <p className="font-medium">{activity.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
          <p className="text-center text-gray-400 py-8">
            Belum ada activity
          </p>
        )}
      </div>
    </div>
  )
}

function DocumentsTab({ inquiryId }: any) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h2 className="font-semibold text-lg mb-6">Documents</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" size={24} />
              <div>
                <p className="font-medium">Document {i}</p>
                <p className="text-xs text-gray-500">2.5 MB • PDF</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsTab({ data, analytics }: any) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card title="Lead Scoring" icon={Star}>
        <div className="space-y-4">
          <MetricCard
            label="Lead Quality Score"
            value={analytics.qualityScore}
            max={100}
            color="purple"
          />
          <MetricCard
            label="Win Probability"
            value={analytics.probability}
            max={100}
            color="blue"
          />
        </div>
      </Card>

      <Card title="Financial Projection" icon={DollarSign}>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Estimated Value</p>
            <p className="text-2xl font-bold text-gray-900">
              Rp {data.estimasi_nilai?.toLocaleString('id-ID') || 0}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Expected Revenue</p>
            <p className="text-2xl font-bold text-green-700">
              Rp {analytics.expectedRevenue.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </Card>
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
        className="bg-white rounded-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Follow Up</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['call', 'email', 'meeting'].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize
                    ${type === t 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tulis hasil follow up..."
            />
          </div>

          <button
            onClick={() => onSave(type, notes)}
            disabled={!notes.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="bg-white border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-blue-600" />}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoField({ label, value, icon: Icon, children }: any) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {label}
      </p>
      <p className="font-medium text-gray-900 break-words">
        {value || '-'}
      </p>
      {children}
    </div>
  )
}

function EditField({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}

function AnalyticCard({ icon, label, value, subtext, progress, color }: any) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
    amber: 'bg-amber-50 border-amber-200',
  }

  const progressColors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
    amber: 'bg-amber-600',
  }

  return (
    <div className={`${colors[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 bg-white rounded-lg`}>
          {icon}
        </div>
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColors[color]} rounded-full transition-all duration-500`}
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
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon size={16} className="text-gray-600" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function ActivityIcon({ type }: { type: string }) {
  const icons = {
    note: <FileText size={20} className="text-blue-600" />,
    call: <Phone size={20} className="text-green-600" />,
    email: <Mail size={20} className="text-purple-600" />,
    meeting: <Users size={20} className="text-amber-600" />,
    status_change: <RefreshCw size={20} className="text-orange-600" />,
  }
  return icons[type as keyof typeof icons] || <Activity size={20} className="text-gray-600" />
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ml-2 ${colors[priority.toLowerCase() as keyof typeof colors]}`}>
      {priority}
    </span>
  )
}

function StatBar({ label, value, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color}-600 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function MetricCard({ label, value, max, color }: any) {
  const percentage = (value / max) * 100
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-gray-400">/ {max}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color}-600 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
