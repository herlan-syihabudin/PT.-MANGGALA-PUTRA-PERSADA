"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  ArrowLeft,
  Calendar,
  DollarSign,
  Package,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  Download,
  Mail,
  Printer,
  Edit,
  RefreshCw,
  ExternalLink,
  Building2,
  User,
  Phone,
  Mail as MailIcon,
  MapPin,
  FileSpreadsheet,
  TrendingUp,
  Shield,
} from "lucide-react"
import { toast } from "sonner"
import { formatIDR } from "@/lib/format"

type Proposal = {
  proposal_id: string
  pipeline_id: string
  rab_id: string
  total_value: number
  status: string
  created_at: string
}

type PipelineData = {
  pipeline_id: string
  inquiry_id: string
  customer_id: string
  customer_name: string
  project_name: string
  stage: string
  estimated_value: number
  probability: number
}

type CustomerData = {
  customer_id: string
  company_name: string
  pic_name: string
  pic_position: string
  email: string
  phone: string
  address: string
  city: string
}

type RabData = {
  rab_id: string
  project_name: string
  total_items: number
  total_value: number
  margin?: number
  items?: any[]
}

/* ================= STATUS CONFIG ================= */
const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; textColor: string; borderColor: string; icon: JSX.Element }
> = {
  DRAFT: {
    label: "Draft",
    color: "slate",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    icon: <Clock size={14} />,
  },
  SENT: {
    label: "Sent",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: <Send size={14} />,
  },
  APPROVED: {
    label: "Approved",
    color: "emerald",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: <CheckCircle size={14} />,
  },
  REJECTED: {
    label: "Rejected",
    color: "rose",
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    icon: <XCircle size={14} />,
  },
  EXPIRED: {
    label: "Expired",
    color: "amber",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: <AlertCircle size={14} />,
  },
}

export default function ProposalDetail({
  params,
}: {
  params: { proposal_id: string }
}) {
  const router = useRouter()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [pipeline, setPipeline] = useState<PipelineData | null>(null)
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [rab, setRab] = useState<RabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch proposal dari API
        const res = await fetch(`/api/crm/proposal/${params.proposal_id}`)
        if (!res.ok) throw new Error("Proposal not found")
        const proposalData = await res.json()
        setProposal(proposalData)

        // Fetch pipeline terkait
        if (proposalData.pipeline_id) {
          const pipelineRes = await fetch(`/api/crm/pipeline/${proposalData.pipeline_id}`)
          if (pipelineRes.ok) {
            const pipelineData = await pipelineRes.json()
            setPipeline(pipelineData)

            // Fetch customer dari pipeline
            if (pipelineData.customer_id) {
              const customerRes = await fetch(`/api/crm/customers/${pipelineData.customer_id}`)
              if (customerRes.ok) {
                const customerData = await customerRes.json()
                setCustomer(customerData)
              }
            }
          }
        }

        // Fetch RAB terkait
        if (proposalData.rab_id) {
          const rabRes = await fetch(`/api/estimator/rab/${proposalData.rab_id}`)
          if (rabRes.ok) {
            const rabData = await rabRes.json()
            setRab(rabData)
          }
        }

      } catch (error) {
        console.error("Error fetching proposal:", error)
        toast.error("Gagal memuat data proposal")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.proposal_id])

  /* ================= ACTION HANDLERS ================= */
  const handleUpdateStatus = async (newStatus: string) => {
    if (!proposal) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/crm/proposal/${proposal.proposal_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update")

      toast.success(`Status diubah ke ${newStatus}`)
      setProposal({ ...proposal, status: newStatus })
    } catch (error) {
      toast.error("Gagal mengubah status")
    } finally {
      setUpdating(false)
    }
  }

  const handleDownloadPDF = () => {
    toast.success("PDF akan diunduh (simulasi)")
  }

  const handleSendEmail = () => {
    toast.success("Email akan dikirim ke customer")
  }

  const handlePrint = () => {
    window.print()
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-800 mx-auto" />
          <p className="text-slate-500">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (!proposal) return notFound()

  const status = statusConfig[proposal.status] || statusConfig.DRAFT
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(proposal.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Premium Industrial */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <FileText size={28} className="text-slate-300" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl lg:text-3xl font-light tracking-tight">
                    {proposal.proposal_id}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
                    <span className="flex items-center gap-1">
                      {status.icon}
                      {status.label}
                    </span>
                  </span>
                </div>
                <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Dibuat {new Date(proposal.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })} • {daysSinceCreated} hari yang lalu
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={updating}
                className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition flex items-center gap-2 border border-white/10"
              >
                <Download size={14} />
                PDF
              </button>
              <button
                onClick={handleSendEmail}
                disabled={updating}
                className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition flex items-center gap-2 border border-white/10"
              >
                <Mail size={14} />
                Email
              </button>
              <button
                onClick={handlePrint}
                disabled={updating}
                className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium transition flex items-center gap-2 border border-white/10"
              >
                <Printer size={14} />
                Print
              </button>
              
              {proposal.status === "DRAFT" && (
                <>
                  <button
                    onClick={() => handleUpdateStatus("SENT")}
                    disabled={updating}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-2"
                  >
                    <Send size={14} />
                    Mark as Sent
                  </button>
                  <Link
                    href={`/admin/crm/proposal/${proposal.proposal_id}/edit`}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                </>
              )}

              {proposal.status === "SENT" && (
                <>
                  <button
                    onClick={() => handleUpdateStatus("APPROVED")}
                    disabled={updating}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-2"
                  >
                    <CheckCircle size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("REJECTED")}
                    disabled={updating}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-2"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                </>
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
            {customer && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 size={18} className="text-slate-500" />
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Company</p>
                    <p className="font-medium text-slate-800">{customer.company_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-400">PIC</p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <User size={14} className="text-slate-400" />
                        {customer.pic_name}
                      </p>
                      {customer.pic_position && (
                        <p className="text-xs text-slate-400">{customer.pic_position}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Contact</p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Phone size={14} className="text-slate-400" />
                        {customer.phone}
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <MailIcon size={14} className="text-slate-400" />
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  {customer.address && (
                    <div>
                      <p className="text-xs text-slate-400">Address</p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400" />
                        {customer.address}, {customer.city}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pipeline Information */}
            {pipeline && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <GitBranch size={18} className="text-slate-500" />
                  Pipeline Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Pipeline ID</p>
                    <Link 
                      href={`/admin/crm/pipeline/${pipeline.pipeline_id}`}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {pipeline.pipeline_id}
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Project Name</p>
                    <p className="text-sm text-slate-800">{pipeline.project_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Stage</p>
                    <p className="text-sm text-slate-600">{pipeline.stage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Probability</p>
                    <p className="text-sm font-medium text-slate-800">{pipeline.probability}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* RAB Information */}
            {rab && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Package size={18} className="text-slate-500" />
                  RAB Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">RAB ID</p>
                    <Link 
                      href={`/admin/estimator/rab/${rab.rab_id}`}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {rab.rab_id}
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Project Name</p>
                    <p className="text-sm text-slate-800">{rab.project_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Items</p>
                    <p className="text-sm text-slate-600">{rab.total_items} items</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">RAB Value</p>
                    <p className="text-sm font-medium text-slate-800">{formatIDR(rab.total_value)}</p>
                  </div>
                  {rab.margin && (
                    <div>
                      <p className="text-xs text-slate-400">Margin</p>
                      <p className={`text-sm font-medium ${
                        rab.margin >= 20 ? 'text-emerald-600' : 
                        rab.margin >= 10 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {rab.margin}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            
            {/* Summary Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-slate-500" />
                Proposal Summary
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400">Total Value</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatIDR(proposal.total_value)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Status</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`p-1 rounded-full ${status.bgColor}`}>
                        {status.icon}
                      </span>
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Created</p>
                    <p className="text-sm font-medium mt-1">
                      {new Date(proposal.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-slate-500" />
                Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-slate-100 rounded-lg">
                    <FileText size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Proposal Created</p>
                    <p className="text-sm font-medium">
                      {new Date(proposal.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                {proposal.status === "SENT" && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Send size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Sent to Customer</p>
                      <p className="text-sm font-medium">
                        {new Date().toLocaleDateString("id-ID")} (simulasi)
                      </p>
                    </div>
                  </div>
                )}
                {proposal.status === "APPROVED" && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <CheckCircle size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Approved</p>
                      <p className="text-sm font-medium">
                        {new Date().toLocaleDateString("id-ID")} (simulasi)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="font-medium text-slate-800 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href={`/admin/estimator/rab/${proposal.rab_id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-slate-500" />
                    <span className="text-sm font-medium">View RAB</span>
                  </div>
                  <ArrowLeft size={14} className="rotate-180 text-slate-400" />
                </Link>
                <Link
                  href={`/admin/crm/pipeline/${proposal.pipeline_id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-slate-500" />
                    <span className="text-sm font-medium">View Pipeline</span>
                  </div>
                  <ArrowLeft size={14} className="rotate-180 text-slate-400" />
                </Link>
                {customer && (
                  <Link
                    href={`/admin/crm/customers/${customer.customer_id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-slate-500" />
                      <span className="text-sm font-medium">View Customer</span>
                    </div>
                    <ArrowLeft size={14} className="rotate-180 text-slate-400" />
                  </Link>
                )}
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-2 p-3 bg-slate-100/50 border border-slate-200 rounded-lg text-xs text-slate-500">
              <Shield size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <p>
                <span className="font-medium text-slate-600">Security Note:</span>{" "}
                Proposal ini terintegrasi dengan pipeline dan RAB. Perubahan status akan mempengaruhi pipeline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
