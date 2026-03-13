"use client"

import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  FileText,
  Download,
  Printer,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Archive,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Settings,
  Grid,
  Table,
  List,
  Maximize2,
  Minimize2,
  Star,
  Award,
  Flag,
  Play,
  Pause,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react"

// ================= TYPES =================

type Project = {
  project_id: string
  project_name: string
  client: string
  client_id?: string
  lokasi: string
  nilai_kontrak: number
  start_date: string
  end_date: string
  status: "planning" | "running" | "finish" | "hold" | "cancelled"
  created_at: string
  project_type?: "MEP" | "CIVIL" | "STEEL" | "INTERIOR" | "OTHER"
  progress?: number
  manager?: string
  team?: string[]
  description?: string
  tags?: string[]
  priority?: "low" | "medium" | "high" | "critical"
  attachments?: number
  comments?: number
  last_activity?: string
}

type ProjectStats = {
  total: number
  totalValue: number
  byStatus: Record<string, { count: number; value: number }>
  byType: Record<string, { count: number; value: number }>
  byPriority: Record<string, number>
  progress: {
    average: number
    onTrack: number
    delayed: number
    stuck: number
  }
  timeline: {
    upcoming: number
    overdue: number
    completed: number
  }
}

type ViewMode = "table" | "grid" | "kanban" | "timeline"
type SortField = keyof Project
type SortOrder = "asc" | "desc"

// ================= CONFIG =================

const STATUS_CONFIG = {
  planning: {
    label: "Planning",
    color: "bg-yellow-100 text-yellow-700",
    borderColor: "border-yellow-200",
    bgColor: "bg-yellow-50",
    icon: FileText,
    progress: 0.2,
  },
  running: {
    label: "Running",
    color: "bg-blue-100 text-blue-700",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    icon: Activity,
    progress: 0.5,
  },
  finish: {
    label: "Finish",
    color: "bg-green-100 text-green-700",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    icon: CheckCircle,
    progress: 1.0,
  },
  hold: {
    label: "On Hold",
    color: "bg-orange-100 text-orange-700",
    borderColor: "border-orange-200",
    bgColor: "bg-orange-50",
    icon: Pause,
    progress: 0.3,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    borderColor: "border-red-200",
    bgColor: "bg-red-50",
    icon: XCircle,
    progress: 0,
  },
}

const TYPE_CONFIG = {
  MEP: { label: "MEP", color: "bg-purple-100 text-purple-700", icon: Zap },
  CIVIL: { label: "Civil", color: "bg-blue-100 text-blue-700", icon: Building2 },
  STEEL: { label: "Steel", color: "bg-gray-100 text-gray-700", icon: Activity },
  INTERIOR: { label: "Interior", color: "bg-green-100 text-green-700", icon: Star },
  OTHER: { label: "Other", color: "bg-gray-100 text-gray-700", icon: FileText },
}

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700", icon: Flag },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700", icon: Flag },
  high: { label: "High", color: "bg-orange-100 text-orange-700", icon: Flag },
  critical: { label: "Critical", color: "bg-red-100 text-red-700", icon: AlertCircle },
}

// ================= HELPER FUNCTIONS =================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}Jt`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(1)}Rb`
  return `Rp ${value}`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getDaysDiff(start: string, end?: string): number {
  const startDate = new Date(start).getTime()
  const endDate = end ? new Date(end).getTime() : Date.now()
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
}

function getProgressState(project: Project): "ontrack" | "delay" | "stuck" | "completed" {
  if (project.status === "finish") return "completed"
  if (project.status === "cancelled" || project.status === "hold") return "stuck"

  const today = new Date()
  const start = new Date(project.start_date)
  const end = new Date(project.end_date)

  if (today > end) return "delay"

  const totalDays = (end.getTime() - start.getTime()) / 86400000
  const passedDays = (today.getTime() - start.getTime()) / 86400000
  const expectedProgress = Math.min(Math.round((passedDays / totalDays) * 100), 100)

  if ((project.progress ?? 0) + 10 < expectedProgress) return "delay"
  if ((project.progress ?? 0) < 5 && passedDays > totalDays * 0.1) return "stuck"

  return "ontrack"
}

// ================= MAIN COMPONENT =================

export default function ProjectListPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // ================= FILTERS =================
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [filterType, setFilterType] = useState<string[]>([])
  const [filterPriority, setFilterPriority] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })
  const [valueRange, setValueRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 0,
  })

  // ================= SORT =================
  const [sortBy, setSortBy] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // ================= UI STATE =================
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showColumns, setShowColumns] = useState(false)
  const [bulkStatus, setBulkStatus] = useState("")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [fullscreen, setFullscreen] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
const [totalItems, setTotalItems] = useState(0)

  // ================= COLUMN VISIBILITY =================
  const [columns, setColumns] = useState({
    no: true,
    project: true,
    customer: true,
    type: true,
    location: true,
    value: true,
    progress: true,
    start: true,
    end: true,
    status: true,
    priority: true,
    manager: true,
    actions: true,
  })

  // ================= FETCH PROJECTS =================
const fetchProjects = async (showRefresh = false) => {
  if (showRefresh) setRefreshing(true)
  try {
    // Pakai endpoint yang benar dengan pagination
    const url = new URL("/api/projects", window.location.origin)
    url.searchParams.set("page", page.toString())
    url.searchParams.set("limit", rowsPerPage.toString())
    
    if (filterStatus.length > 0) {
      url.searchParams.set("status", filterStatus.join(","))
    }
    
    if (filterType.length > 0) {
      url.searchParams.set("type", filterType.join(","))
    }

    const res = await fetch(url.toString(), { 
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      }
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${res.status}`)
    }

    const data = await res.json()
    
    // Handle response format (array langsung atau { data, pagination })
    const projectsData = Array.isArray(data) ? data : data.data || []
    
    // Enhance dengan data yang konsisten (tanpa mock random)
    const enhanced = projectsData.map((p: any) => ({
  ...p,
  client: p.client || p.customer?.company_name || "-",
  manager: p.manager || "Unassigned",
  priority: p.priority || "medium",
  tags: p.tags || [],
  attachments: p.attachments || 0,
  comments: p.comments || 0,
  last_activity: p.last_activity || p.updated_at || p.created_at,
}))

    setProjects(enhanced)
    
    // Update pagination info jika ada
    if (data.pagination) {
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.total)
    }

    // Set value range for filter
    const maxValue = enhanced.length
  ? Math.max(...enhanced.map((p: Project) => p.nilai_kontrak))
  : 0
    setValueRange({ min: 0, max: maxValue })
    
  } catch (e) {
    console.error("Failed fetch projects", e)
    alert(e instanceof Error ? e.message : "Gagal memuat data")
  } finally {
    setLoading(false)
    if (showRefresh) setRefreshing(false)
  }
}

  useEffect(() => {
  fetchProjects()
}, [page, rowsPerPage])

  // ================= STATISTICS =================
  const stats = useMemo<ProjectStats>(() => {
    const byStatus: Record<string, { count: number; value: number }> = {}
    const byType: Record<string, { count: number; value: number }> = {}
    const byPriority: Record<string, number> = {}

    let totalValue = 0
    let totalProgress = 0
    let onTrack = 0
    let delayed = 0
    let stuck = 0
    let upcoming = 0
    let overdue = 0
    let completed = 0

    projects.forEach((p) => {
      totalValue += p.nilai_kontrak
      totalProgress += p.progress || 0

      // By status
      if (!byStatus[p.status]) byStatus[p.status] = { count: 0, value: 0 }
      byStatus[p.status].count++
      byStatus[p.status].value += p.nilai_kontrak

      // By type
      const type = p.project_type || "OTHER"
      if (!byType[type]) byType[type] = { count: 0, value: 0 }
      byType[type].count++
      byType[type].value += p.nilai_kontrak

      // By priority
      const priority = p.priority || "medium"
      byPriority[priority] = (byPriority[priority] || 0) + 1

      // Progress state
      const state = getProgressState(p)
      if (state === "ontrack") onTrack++
      else if (state === "delay") delayed++
      else if (state === "stuck") stuck++

      // Timeline
      const today = new Date()
      const end = new Date(p.end_date)
      if (p.status === "finish") completed++
      else if (end < today) overdue++
      else upcoming++
    })

    return {
      total: projects.length,
      totalValue,
      byStatus,
      byType,
      byPriority,
      progress: {
        average: projects.length 
  ? Math.round(totalProgress / projects.length)
  : 0,
        onTrack,
        delayed,
        stuck,
      },
      timeline: {
        upcoming,
        overdue,
        completed,
      },
    }
  }, [projects])

  // ================= FILTERS & SORT =================
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Search
        if (search) {
          const term = search.toLowerCase()
          return (
            p.project_name.toLowerCase().includes(term) ||
            p.client.toLowerCase().includes(term) ||
            p.lokasi?.toLowerCase().includes(term) ||
            p.project_id.toLowerCase().includes(term)
          )
        }
        return true
      })
      .filter((p) => {
        // Status filter
        if (filterStatus.length === 0) return true
        return filterStatus.includes(p.status)
      })
      .filter((p) => {
        // Type filter
        if (filterType.length === 0) return true
        return filterType.includes(p.project_type || "OTHER")
      })
      .filter((p) => {
        // Priority filter
        if (filterPriority.length === 0) return true
        return filterPriority.includes(p.priority || "medium")
      })
      .filter((p) => {
        // Date range
        if (dateRange.start && new Date(p.start_date) < new Date(dateRange.start)) return false
        if (dateRange.end && new Date(p.end_date) > new Date(dateRange.end)) return false
        return true
      })
      .filter((p) => {
        // Value range
        if (valueRange.max === 0) return true
        return p.nilai_kontrak >= valueRange.min && p.nilai_kontrak <= valueRange.max
      })
      .sort((a, b) => {
        let aVal = a[sortBy]
        let bVal = b[sortBy]

        if (aVal === undefined) aVal = ""
        if (bVal === undefined) bVal = ""

        if (sortBy === "nilai_kontrak" || sortBy === "progress") {
          aVal = aVal || 0
          bVal = bVal || 0
          return sortOrder === "asc"
            ? (aVal as number) - (bVal as number)
            : (bVal as number) - (aVal as number)
        }

        if (sortBy === "start_date" || sortBy === "end_date" || sortBy === "created_at") {
          return sortOrder === "asc"
            ? new Date(aVal as string).getTime() - new Date(bVal as string).getTime()
            : new Date(bVal as string).getTime() - new Date(aVal as string).getTime()
        }

        const comparison = String(aVal).localeCompare(String(bVal))
        return sortOrder === "asc" ? comparison : -comparison
      })
  }, [projects, search, filterStatus, filterType, filterPriority, dateRange, valueRange, sortBy, sortOrder])

  // ================= PAGINATION =================
  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredProjects.slice(start, start + rowsPerPage)
  }, [filteredProjects, page, rowsPerPage])

  const localTotalPages = Math.ceil(filteredProjects.length / rowsPerPage)

  // ================= SELECTION =================
  const toggleSelect = (id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedProjects.length === paginatedProjects.length) {
      setSelectedProjects([])
    } else {
      setSelectedProjects(paginatedProjects.map((p) => p.project_id))
    }
  }

  // ================= BULK ACTIONS =================
  const exportCSV = () => {
    const rows = projects.filter((p) => selectedProjects.includes(p.project_id))

    if (rows.length === 0) {
      alert("Pilih minimal 1 project")
      return
    }

    const headers = [
      "Project ID",
      "Project Name",
      "Customer",
      "Type",
      "Location",
      "Value",
      "Progress",
      "Start Date",
      "End Date",
      "Status",
      "Priority",
      "Manager",
    ]

    const data = rows.map((p) => [
      p.project_id,
      p.project_name,
      p.client,
      p.project_type || "-",
      p.lokasi,
      p.nilai_kontrak,
      `${p.progress || 0}%`,
      p.start_date,
      p.end_date,
      p.status,
      p.priority || "-",
      p.manager || "-",
    ])

    const csv = [headers, ...data].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `projects-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const bulkUpdateStatus = async () => {
    if (!bulkStatus || selectedProjects.length === 0) return

    if (!confirm(`Update ${selectedProjects.length} project ke status "${bulkStatus}"?`)) {
      return
    }

    try {
      await fetch("/api/projects/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_ids: selectedProjects,
          status: bulkStatus,
        }),
      })

      await fetchProjects(true)
      setSelectedProjects([])
      setBulkStatus("")
    } catch (err) {
      alert("Gagal update status")
    }
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto" />
          <p className="text-gray-400">Loading projects...</p>
        </div>
      </div>
    )
  }

  // ================= RENDER =================
  return (
    <div className={`min-h-screen bg-gray-50 ${fullscreen ? "fixed inset-0 z-50 overflow-auto" : ""}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Building2 size={28} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Project Management</h1>
                <p className="text-red-100 text-sm mt-1">
                  {stats.total} projects • {formatCompactCurrency(stats.totalValue)} total value
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari project / customer..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition ${
                  showFilters ? "bg-white/20" : "bg-white/10 hover:bg-white/15"
                }`}
              >
                <Filter size={20} />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl transition"
              >
                {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>

              {/* Refresh */}
              <button
                onClick={() => fetchProjects(true)}
                disabled={refreshing}
                className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl transition disabled:opacity-50"
              >
                <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
              </button>

              {/* Create Project */}
              <Link
                href="/admin/projects/create"
                className="px-4 py-2.5 bg-white text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition flex items-center gap-2"
              >
                <Plus size={18} />
                Create Project
              </Link>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-white/10 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-red-200 mb-2">Status</label>
                <div className="space-y-2">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filterStatus.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterStatus([...filterStatus, key])
                          } else {
                            setFilterStatus(filterStatus.filter((s) => s !== key))
                          }
                        }}
                      />
                      <span className="text-white">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-red-200 mb-2">Project Type</label>
                <div className="space-y-2">
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filterType.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterType([...filterType, key])
                          } else {
                            setFilterType(filterType.filter((t) => t !== key))
                          }
                        }}
                      />
                      <span className="text-white">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-red-200 mb-2">Priority</label>
                <div className="space-y-2">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filterPriority.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterPriority([...filterPriority, key])
                          } else {
                            setFilterPriority(filterPriority.filter((p) => p !== key))
                          }
                        }}
                      />
                      <span className="text-white">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-red-200 mb-2">Sort By</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm mb-2"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                >
                  <option value="project_name">Project Name</option>
                  <option value="client">Customer</option>
                  <option value="nilai_kontrak">Value</option>
                  <option value="progress">Progress</option>
                  <option value="start_date">Start Date</option>
                  <option value="end_date">End Date</option>
                  <option value="created_at">Created Date</option>
                </select>

                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Projects"
            value={stats.total}
            subtitle={`${stats.progress.onTrack} on track`}
            icon={<Building2 className="text-red-600" />}
            color="red"
            trend={+8.5}
          />
          <KpiCard
            title="Total Value"
            value={stats.totalValue}
            icon={<DollarSign className="text-green-600" />}
            color="green"
            format="currency"
          />
          <KpiCard
            title="On Track"
            value={stats.progress.onTrack}
            subtitle={`${((stats.progress.onTrack / stats.total) * 100).toFixed(1)}% of total`}
            icon={<Target className="text-blue-600" />}
            color="blue"
          />
          <KpiCard
            title="Overdue"
            value={stats.timeline.overdue}
            subtitle={`${stats.progress.delayed} delayed, ${stats.progress.stuck} stuck`}
            icon={<AlertCircle className="text-red-600" />}
            color="red"
            warning
          />
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon
            const stat = stats.byStatus[key] || { count: 0, value: 0 }
            return (
              <button
                key={key}
                onClick={() => {
                  if (filterStatus.includes(key)) {
                    setFilterStatus(filterStatus.filter((s) => s !== key))
                  } else {
                    setFilterStatus([...filterStatus, key])
                  }
                }}
                className={`p-3 rounded-xl border-2 transition ${
                  filterStatus.includes(key)
                    ? `${config.bgColor} ${config.borderColor}`
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={16} className={filterStatus.includes(key) ? "text-red-600" : "text-gray-400"} />
                  <span className="text-xs font-medium">{stat.count}</span>
                </div>
                <p className="text-sm font-semibold mt-2">{config.label}</p>
                <p className="text-xs text-gray-500 mt-1">{formatCompactCurrency(stat.value)}</p>
              </button>
            )
          })}
        </div>

        {/* Selection Bar */}
        {selectedProjects.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-blue-600" size={20} />
              <span className="text-sm text-blue-700">{selectedProjects.length} project selected</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="border rounded-lg px-3 py-1.5 text-sm"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
              >
                <option value="">Bulk Update Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
              <button
                onClick={bulkUpdateStatus}
                disabled={!bulkStatus}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                Update
              </button>
              <button
                onClick={exportCSV}
                className="px-3 py-1.5 bg-white border rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Export
              </button>
              <button
                onClick={() => setSelectedProjects([])}
                className="p-1.5 hover:bg-blue-200 rounded-lg transition"
              >
                <XCircle size={16} className="text-blue-600" />
              </button>
            </div>
          </div>
        )}

        {/* View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition ${
                viewMode === "table" ? "bg-red-600 text-white" : "hover:bg-gray-100"
              }`}
              title="Table View"
            >
              <Table size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${
                viewMode === "grid" ? "bg-red-600 text-white" : "hover:bg-gray-100"
              }`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg transition ${
                viewMode === "kanban" ? "bg-red-600 text-white" : "hover:bg-gray-100"
              }`}
              title="Kanban View"
            >
              <Activity size={18} />
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`p-2 rounded-lg transition ${
                viewMode === "timeline" ? "bg-red-600 text-white" : "hover:bg-gray-100"
              }`}
              title="Timeline View"
            >
              <Calendar size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowColumns(!showColumns)}
              className="px-3 py-2 bg-white border rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2"
            >
              <Settings size={16} />
              Columns
              <ChevronDown size={14} />
            </button>

            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Column Visibility Panel */}
        {showColumns && (
          <div className="bg-white border rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(columns).map(([key, visible]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setColumns({ ...columns, [key]: e.target.checked })}
                />
                <span className="capitalize">{key}</span>
              </label>
            ))}
          </div>
        )}

        {/* MAIN VIEW */}
        {viewMode === "table" && (
          <TableView
            projects={paginatedProjects}
            columns={columns}
            selectedProjects={selectedProjects}
            onSelect={toggleSelect}
            onSelectAll={toggleSelectAll}
            onProjectClick={(id) => router.push(`/admin/projects/${id}`)}
            getProgressState={getProgressState}
          />
        )}

        {viewMode === "grid" && (
          <GridView
            projects={paginatedProjects}
            selectedProjects={selectedProjects}
            onSelect={toggleSelect}
            onProjectClick={(id) => router.push(`/admin/projects/${id}`)}
            getProgressState={getProgressState}
          />
        )}

        {viewMode === "kanban" && (
          <KanbanView
            projects={filteredProjects}
            statusConfig={STATUS_CONFIG}
            onProjectClick={(id) => router.push(`/admin/projects/${id}`)}
          />
        )}

        {viewMode === "timeline" && (
          <TimelineView
            projects={filteredProjects}
            onProjectClick={(id) => router.push(`/admin/projects/${id}`)}
          />
        )}

        {/* Pagination */}
        {filteredProjects.length > 0 && viewMode !== "kanban" && viewMode !== "timeline" && (
          <div className="flex items-center justify-between bg-white border rounded-xl p-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(page - 1) * rowsPerPage + 1}</span> -{" "}
              <span className="font-medium">
                {Math.min(page * rowsPerPage, filteredProjects.length)}
              </span>{" "}
              of <span className="font-medium">{filteredProjects.length}</span> projects
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, localTotalPages) }, (_, i) => {
                let pageNum = page
                if (page <= 3) pageNum = i + 1
                else if (page >= localTotalPages - 2) pageNum = localTotalPages - 4 + i
                else pageNum = page - 2 + i

                if (pageNum > 0 && pageNum <= localTotalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm ${
                        page === pageNum ? "bg-red-600 text-white" : "hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                }
                return null
              })}
              <button
                onClick={() => setPage((p) => Math.min(localTotalPages, p + 1))}
                disabled={page === localTotalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ================= VIEW COMPONENTS =================

function TableView({
  projects,
  columns,
  selectedProjects,
  onSelect,
  onSelectAll,
  onProjectClick,
  getProgressState,
}: {
  projects: Project[]
  columns: any
  selectedProjects: string[]
  onSelect: (id: string) => void
  onSelectAll: () => void
  onProjectClick: (id: string) => void
  getProgressState: (p: Project) => string
}) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.no && (
                <th className="p-3 w-10">
                  <input type="checkbox" checked={selectedProjects.length === projects.length && projects.length > 0} onChange={onSelectAll} />
                </th>
              )}
              {columns.project && <th className="p-3 text-left">Project</th>}
              {columns.customer && <th className="p-3 text-left">Customer</th>}
              {columns.type && <th className="p-3 text-left">Type</th>}
              {columns.location && <th className="p-3 text-left">Location</th>}
              {columns.value && <th className="p-3 text-right">Value</th>}
              {columns.progress && <th className="p-3 text-left">Progress</th>}
              {columns.start && <th className="p-3 text-left">Start</th>}
              {columns.end && <th className="p-3 text-left">End</th>}
              {columns.status && <th className="p-3 text-left">Status</th>}
              {columns.priority && <th className="p-3 text-left">Priority</th>}
              {columns.manager && <th className="p-3 text-left">Manager</th>}
              {columns.actions && <th className="p-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-12 text-center text-gray-400">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No projects found</p>
                </td>
              </tr>
            ) : (
              projects.map((p, idx) => {
                const state = getProgressState(p)
                const StatusIcon = STATUS_CONFIG[p.status]?.icon || FileText
                const PriorityIcon = PRIORITY_CONFIG[p.priority || "medium"]?.icon || Flag

                return (
                  <tr
                    key={p.project_id}
                    className={`border-t hover:bg-gray-50 cursor-pointer transition ${
                      state === "delay" ? "bg-yellow-50" : state === "stuck" ? "bg-red-50" : ""
                    }`}
                    onClick={() => onProjectClick(p.project_id)}
                  >
                    {columns.no && (
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(p.project_id)}
                          onChange={() => onSelect(p.project_id)}
                        />
                      </td>
                    )}
                    {columns.project && (
                      <td className="p-3 font-medium">
                        <div>{p.project_name}</div>
                        <div className="text-xs text-gray-400">{p.project_id}</div>
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {p.tags.map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    )}
                    {columns.customer && <td className="p-3">{p.client}</td>}
                    {columns.type && (
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            TYPE_CONFIG[p.project_type || "OTHER"]?.color || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {p.project_type || "-"}
                        </span>
                      </td>
                    )}
                    {columns.location && (
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          {p.lokasi || "-"}
                        </div>
                      </td>
                    )}
                    {columns.value && <td className="p-3 text-right font-semibold text-green-600">{formatCompactCurrency(p.nilai_kontrak)}</td>}
                    {columns.progress && (
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              state === "ontrack"
                                ? "bg-green-500"
                                : state === "delay"
                                ? "bg-yellow-500"
                                : state === "stuck"
                                ? "bg-red-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${p.progress || 0}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs w-8 text-right">{p.progress || 0}%</span>
                        </div>
                      </td>
                    )}
                    {columns.start && (
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          {formatDate(p.start_date)}
                        </div>
                      </td>
                    )}
                    {columns.end && (
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          {formatDate(p.end_date)}
                        </div>
                      </td>
                    )}
                    {columns.status && (
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
                            STATUS_CONFIG[p.status]?.color || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <StatusIcon size={12} />
                          {STATUS_CONFIG[p.status]?.label || p.status}
                        </span>
                      </td>
                    )}
                    {columns.priority && (
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
                            PRIORITY_CONFIG[p.priority || "medium"]?.color || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <PriorityIcon size={12} />
                          {p.priority || "medium"}
                        </span>
                      </td>
                    )}
                    {columns.manager && (
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                            {p.manager?.[0] || "?"}
                          </div>
                          <span>{p.manager || "-"}</span>
                        </div>
                      </td>
                    )}
                    {columns.actions && (
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/admin/projects/${p.project_id}`}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition group"
                          >
                            <Eye size={16} className="text-gray-500 group-hover:text-blue-600" />
                          </Link>
                          <Link
                            href={`/admin/projects/${p.project_id}/edit`}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition group"
                          >
                            <Edit size={16} className="text-gray-500 group-hover:text-green-600" />
                          </Link>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GridView({
  projects,
  selectedProjects,
  onSelect,
  onProjectClick,
  getProgressState,
}: {
  projects: Project[]
  selectedProjects: string[]
  onSelect: (id: string) => void
  onProjectClick: (id: string) => void
  getProgressState: (p: Project) => string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No projects found</p>
        </div>
      ) : (
        projects.map((p) => {
          const state = getProgressState(p)
          const StatusIcon = STATUS_CONFIG[p.status]?.icon || FileText
          const PriorityIcon = PRIORITY_CONFIG[p.priority || "medium"]?.icon || Flag

          return (
            <div
              key={p.project_id}
              className={`bg-white border rounded-xl p-6 hover:shadow-lg transition cursor-pointer ${
                state === "delay" ? "border-yellow-300" : state === "stuck" ? "border-red-300" : ""
              }`}
              onClick={() => onProjectClick(p.project_id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(p.project_id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      onSelect(p.project_id)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Building2 className="text-gray-600" size={24} />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                      STATUS_CONFIG[p.status]?.color || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <StatusIcon size={12} />
                    {STATUS_CONFIG[p.status]?.label || p.status}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1">{p.project_name}</h3>
              <p className="text-sm text-gray-500 mb-4">{p.client}</p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{p.lokasi || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-gray-400" />
                  <span className="font-semibold text-green-600">{formatCurrency(p.nilai_kontrak)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span>
                    {formatDate(p.start_date)} - {formatDate(p.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityIcon size={14} className="text-gray-400" />
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      PRIORITY_CONFIG[p.priority || "medium"]?.color || "bg-gray-100"
                    }`}
                  >
                    {p.priority || "medium"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs font-medium">{p.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      state === "ontrack"
                        ? "bg-green-500"
                        : state === "delay"
                        ? "bg-yellow-500"
                        : state === "stuck"
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${p.progress || 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {getDaysDiff(p.start_date)} days
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {p.team?.length || 1} team
                  </span>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function KanbanView({
  projects,
  statusConfig,
  onProjectClick,
}: {
  projects: Project[]
  statusConfig: any
  onProjectClick: (id: string) => void
}) {
  const grouped = projects.reduce((acc, p) => {
    if (!acc[p.status]) acc[p.status] = []
    acc[p.status].push(p)
    return acc
  }, {} as Record<string, Project[]>)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {Object.entries(statusConfig).map(([status, config]: [string, any]) => {
        const Icon = config.icon
        const statusProjects = grouped[status] || []

        return (
          <div key={status} className="bg-gray-100 rounded-xl p-4 min-w-[300px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <Icon size={16} className="text-gray-600" />
                </div>
                <h3 className="font-semibold">{config.label}</h3>
              </div>
              <span className="px-2 py-1 bg-white rounded-full text-xs font-medium">
                {statusProjects.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {statusProjects.length === 0 ? (
                <div className="bg-white/50 rounded-lg p-4 text-center text-xs text-gray-400">
                  No projects
                </div>
              ) : (
                statusProjects.map((p) => {
                  const PriorityIcon = PRIORITY_CONFIG[p.priority || "medium"]?.icon || Flag
                  const state = getProgressState(p)

                  return (
                    <div
                      key={p.project_id}
                      className="bg-white rounded-lg p-3 shadow-sm hover:shadow cursor-pointer"
                      onClick={() => onProjectClick(p.project_id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{p.project_name}</h4>
                        <PriorityIcon
                          size={12}
                          className={
                            p.priority === "critical"
                              ? "text-red-500"
                              : p.priority === "high"
                              ? "text-orange-500"
                              : "text-gray-400"
                          }
                        />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{p.client}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-green-600">{formatCompactCurrency(p.nilai_kontrak)}</span>
                        <span className="text-gray-400">{p.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full ${
                            state === "ontrack"
                              ? "bg-green-500"
                              : state === "delay"
                              ? "bg-yellow-500"
                              : state === "stuck"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${p.progress || 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
                        <span>{formatDate(p.start_date)}</span>
                        <span>{getDaysDiff(p.start_date, p.end_date)}d</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TimelineView({
  projects,
  onProjectClick,
}: {
  projects: Project[]
  onProjectClick: (id: string) => void
}) {
  const sorted = [...projects].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

  const startDate = new Date(Math.min(...sorted.map((p) => new Date(p.start_date).getTime())))
  const endDate = new Date(Math.max(...sorted.map((p) => new Date(p.end_date).getTime())))
  const totalDays = (endDate.getTime() - startDate.getTime()) / 86400000

  return (
    <div className="bg-white border rounded-xl p-6 overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex items-center mb-4">
          <div className="w-1/4 font-semibold">Project</div>
          <div className="flex-1 relative h-8">
            <div className="absolute inset-0 flex">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 border-l border-gray-200 text-xs text-gray-400 pl-1">
                  Month {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {sorted.map((p) => {
          const projectStart = new Date(p.start_date)
          const projectEnd = new Date(p.end_date)
          const startOffset = (projectStart.getTime() - startDate.getTime()) / 86400000
          const duration = (projectEnd.getTime() - projectStart.getTime()) / 86400000
          const left = (startOffset / totalDays) * 100
          const width = (duration / totalDays) * 100
          const state = getProgressState(p)

          return (
            <div
              key={p.project_id}
              className="flex items-center mb-2 hover:bg-gray-50 p-2 rounded cursor-pointer"
              onClick={() => onProjectClick(p.project_id)}
            >
              <div className="w-1/4 truncate pr-4">
                <div className="font-medium text-sm">{p.project_name}</div>
                <div className="text-xs text-gray-400">{p.client}</div>
              </div>
              <div className="flex-1 relative h-10">
                <div
                  className={`absolute h-8 rounded-lg ${
                    state === "ontrack"
                      ? "bg-green-500"
                      : state === "delay"
                      ? "bg-yellow-500"
                      : state === "stuck"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    opacity: 0.8,
                  }}
                >
                  <div className="text-xs text-white truncate px-2 py-1.5">
                    {p.progress || 0}% • {formatCompactCurrency(p.nilai_kontrak)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ================= KPI CARD =================
function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color,
  format = "number",
  trend,
  warning,
}: {
  title: string
  value: number
  subtitle?: string
  icon: ReactNode
  color: string
  format?: "number" | "currency"
  trend?: number
  warning?: boolean
}) {
  const colorClasses = {
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  }

  const formattedValue =
    format === "currency"
      ? formatCurrency(value)
      : value.toLocaleString("id-ID")

  return (
    <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-xl`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-medium ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-4">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${warning ? "text-red-600" : "text-gray-900"}`}>
        {formattedValue}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
  )
}
