"use client"

import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Briefcase, Box, AlertTriangle, FileText, 
  ArrowRight, RefreshCcw, Sparkles, 
  Zap, Shield, Clock, BarChart3,
  PieChart, LineChart, Activity,
  Sun, Moon, Maximize2, Minimize2,
  Bell, BellOff, Download, Filter,
  ChevronRight, ChevronLeft, Eye, EyeOff
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState, useEffect, useCallback, useRef } from "react"
import { useThemeStore } from "@/store/useThemeStore"
import { useDashboardStore } from "@/store/dashboardStore"
import dynamic from 'next/dynamic'

// ==================== TYPES ====================
interface DashboardData {
  hr: { totalEmployee: number; hadirHariIni: number; onboarding: number; offboarding: number }
  ga: { totalAsset: number; assetMaintenance: number; assetValue: number; depreciation: number }
  inventory: { materialNeedUpdate: number; totalMaterial: number; lowStock: number; value: number }
  project: { projectAktif: number; projectTerlambat: number; projectSelesai: number; totalValue: number }
  finance: { cashflowWarning: number; revenue: number; profit: number; margin: number }
  pipeline: { new: number; followup: number; survey: number; offer: number; deal: number; lost: number }
  timeline: Array<{ id: string; title: string; date: string; type: string; priority: string }>
}

// ==================== CONSTANTS ====================
const MOTION_CONFIG = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.1 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
  },
  scaleOnHover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
}

const COLORS = {
  primary: {
    light: 'from-blue-600 to-indigo-600',
    dark: 'from-blue-400 to-indigo-400'
  },
  success: {
    light: 'from-emerald-500 to-green-500',
    dark: 'from-emerald-400 to-green-400'
  },
  warning: {
    light: 'from-amber-500 to-orange-500',
    dark: 'from-amber-400 to-orange-400'
  },
  danger: {
    light: 'from-rose-500 to-red-500',
    dark: 'from-rose-400 to-red-400'
  },
  info: {
    light: 'from-cyan-500 to-sky-500',
    dark: 'from-cyan-400 to-sky-400'
  }
}

// ==================== LAZY LOAD COMPONENTS ====================
const SparklineChart = dynamic(() => import('@/components/dashboard/charts/Sparkline'), {
  loading: () => <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />,
  ssr: false
})

const MiniPieChart = dynamic(() => import('@/components/dashboard/charts/MiniPie'), {
  loading: () => <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />,
  ssr: false
})

// ==================== MAIN COMPONENT ====================
export default function AdminDashboardPage() {
  // State
  const [mounted, setMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  // Refs
  const mainRef = useRef<HTMLElement>(null)
  const refreshButtonRef = useRef<HTMLButtonElement>(null)
  
  // Hooks
  const reduceMotion = useReducedMotion()
  const { dark, toggleTheme } = useThemeStore()
  const { data, isLoading, error, refetch, lastUpdated } = useDashboardStore()
  
  // Hydration fix
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto refresh every 5 minutes
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      handleRefresh()
    }, 300000) // 5 menit
    return () => clearInterval(interval)
  }, [mounted])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault()
        handleRefresh()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handlers
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await refetch()
      // Haptic feedback for mobile
      if (window.navigator.vibrate) window.navigator.vibrate(50)
    } finally {
      setTimeout(() => setIsRefreshing(false), 800)
    }
  }, [isRefreshing, refetch])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }, [])

  // Loading state
  if (!mounted || isLoading) {
    return <DashboardSkeleton dark={dark} />
  }

  // Error state
  if (error) {
    return <DashboardError error={error} onRetry={handleRefresh} dark={dark} />
  }

  // Safe data dengan default
  const safeData: DashboardData = {
    hr: { 
      totalEmployee: data?.hr?.totalEmployee ?? 187,
      hadirHariIni: data?.hr?.hadirHariIni ?? 156,
      onboarding: data?.hr?.onboarding ?? 8,
      offboarding: data?.hr?.offboarding ?? 3
    },
    ga: { 
      totalAsset: data?.ga?.totalAsset ?? 342,
      assetMaintenance: data?.ga?.assetMaintenance ?? 23,
      assetValue: data?.ga?.assetValue ?? 45.2,
      depreciation: data?.ga?.depreciation ?? 3.8
    },
    inventory: { 
      materialNeedUpdate: data?.inventory?.materialNeedUpdate ?? 15,
      totalMaterial: data?.inventory?.totalMaterial ?? 1250,
      lowStock: data?.inventory?.lowStock ?? 28,
      value: data?.inventory?.value ?? 2.8
    },
    project: { 
      projectAktif: data?.project?.projectAktif ?? 24,
      projectTerlambat: data?.project?.projectTerlambat ?? 5,
      projectSelesai: data?.project?.projectSelesai ?? 12,
      totalValue: data?.project?.totalValue ?? 124.5
    },
    finance: { 
      cashflowWarning: data?.finance?.cashflowWarning ?? 2,
      revenue: data?.finance?.revenue ?? 28.4,
      profit: data?.finance?.profit ?? 4.2,
      margin: data?.finance?.margin ?? 14.8
    },
    pipeline: { 
      new: 8, followup: 12, survey: 6, offer: 9, deal: 4, lost: 3 
    },
    timeline: [
      { id: '1', title: 'Meeting Proyek A', date: '10:30', type: 'meeting', priority: 'high' },
      { id: '2', title: 'Review RAB', date: '13:00', type: 'task', priority: 'medium' },
      { id: '3', title: 'Follow Up Client', date: '15:30', type: 'call', priority: 'high' }
    ]
  }

  const attendanceRate = (safeData.hr.hadirHariIni / safeData.hr.totalEmployee) * 100
  const projectProgress = (safeData.project.projectSelesai / (safeData.project.projectAktif + safeData.project.projectSelesai)) * 100

  return (
    <motion.section
      ref={mainRef}
      key="dashboard"
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={MOTION_CONFIG.container}
      className={`min-h-screen transition-all duration-500 ${
        dark 
          ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100' 
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-50 text-gray-900'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-[1800px] mx-auto">
        
        {/* ===== HEADER PREMIUM ===== */}
        <motion.div variants={MOTION_CONFIG.item} className="mb-8 md:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl"
                >
                  <Sparkles className={`w-6 h-6 ${dark ? 'text-blue-400' : 'text-blue-600'}`} />
                </motion.div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Command
                  </span>
                  <span className={`ml-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                    Center
                  </span>
                </h1>
                <span className="px-3 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800">
                  v3.0
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span className={dark ? 'text-gray-400' : 'text-gray-600'}>
                    Sistem Operasional
                  </span>
                </div>
                <span className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Last update: {lastUpdated?.toLocaleTimeString() || new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Control Panel */}
            <motion.div variants={MOTION_CONFIG.item} className="flex items-center gap-3">
              {/* Notifications Toggle */}
              <motion.button
                whileHover={MOTION_CONFIG.scaleOnHover}
                whileTap={MOTION_CONFIG.tap}
                onClick={() => setNotifications(!notifications)}
                className={`p-3 rounded-xl transition-all ${
                  dark 
                    ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
                aria-label={notifications ? 'Mute notifications' : 'Unmute notifications'}
              >
                {notifications ? (
                  <Bell size={20} className={dark ? 'text-gray-300' : 'text-gray-600'} />
                ) : (
                  <BellOff size={20} className="text-gray-400" />
                )}
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                whileHover={MOTION_CONFIG.scaleOnHover}
                whileTap={MOTION_CONFIG.tap}
                onClick={toggleTheme}
                className={`p-3 rounded-xl transition-all ${
                  dark 
                    ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? (
                  <Sun size={20} className="text-yellow-400" />
                ) : (
                  <Moon size={20} className="text-gray-600" />
                )}
              </motion.button>

              {/* Fullscreen Toggle */}
              <motion.button
                whileHover={MOTION_CONFIG.scaleOnHover}
                whileTap={MOTION_CONFIG.tap}
                onClick={toggleFullscreen}
                className={`hidden md:block p-3 rounded-xl transition-all ${
                  dark 
                    ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
                aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {fullscreen ? (
                  <Minimize2 size={20} className={dark ? 'text-gray-300' : 'text-gray-600'} />
                ) : (
                  <Maximize2 size={20} className={dark ? 'text-gray-300' : 'text-gray-600'} />
                )}
              </motion.button>

              {/* Refresh Button */}
              <motion.button
                ref={refreshButtonRef}
                whileHover={MOTION_CONFIG.scaleOnHover}
                whileTap={MOTION_CONFIG.tap}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  dark
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Refresh dashboard"
              >
                <RefreshCcw 
                  size={18} 
                  className={`${isRefreshing ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* ===== FINANCIAL METRICS ===== */}
        <motion.div variants={MOTION_CONFIG.item} className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <FinancialCard
              title="Revenue MTD"
              value={safeData.finance.revenue}
              unit="M"
              change={+8.2}
              icon={TrendingUp}
              color="primary"
              dark={dark}
            />
            <FinancialCard
              title="Net Profit"
              value={safeData.finance.profit}
              unit="M"
              change={+12.5}
              icon={DollarSign}
              color="success"
              dark={dark}
            />
            <FinancialCard
              title="Profit Margin"
              value={safeData.finance.margin}
              unit="%"
              change={-2.1}
              icon={PieChart}
              color="warning"
              dark={dark}
            />
            <FinancialCard
              title="Project Value"
              value={safeData.project.totalValue}
              unit="M"
              change={+5.3}
              icon={BarChart3}
              color="info"
              dark={dark}
            />
          </div>
        </motion.div>

        {/* ===== KPI GRID ===== */}
        <motion.div variants={MOTION_CONFIG.item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <KPICard
            title="Cashflow Warning"
            value={safeData.finance.cashflowWarning}
            icon={AlertTriangle}
            href="/admin/finance"
            subtitle="Perlu perhatian"
            percent={safeData.finance.cashflowWarning > 0 ? 100 : 0}
            color="danger"
            pulse={safeData.finance.cashflowWarning > 0}
            dark={dark}
          />

          <KPICard
            title="Project Aktif"
            value={safeData.project.projectAktif}
            icon={Briefcase}
            href="/admin/project"
            subtitle={`${safeData.project.projectTerlambat} terlambat`}
            percent={(safeData.project.projectAktif / 30) * 100}
            color="info"
            dark={dark}
          />

          <KPICard
            title="Kehadiran"
            value={`${safeData.hr.hadirHariIni}/${safeData.hr.totalEmployee}`}
            icon={Users}
            href="/admin/hr"
            subtitle={`${attendanceRate.toFixed(1)}% hadir`}
            percent={attendanceRate}
            color="success"
            dark={dark}
          />

          <KPICard
            title="Low Stock"
            value={safeData.inventory.lowStock}
            icon={Box}
            href="/admin/inventory"
            subtitle="Perlu reorder"
            percent={(safeData.inventory.lowStock / safeData.inventory.totalMaterial) * 100}
            color="warning"
            dark={dark}
          />
        </motion.div>

        {/* ===== PIPELINE & TIMELINE ===== */}
        <motion.div variants={MOTION_CONFIG.item} className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Pipeline Section */}
          <div className="lg:col-span-2">
            <GlassCard dark={dark}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <Activity size={18} className={dark ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  <h2 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>
                    Estimator Pipeline
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`p-2 rounded-lg ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}>
                    <Filter size={16} className={dark ? 'text-gray-400' : 'text-gray-500'} />
                  </button>
                  <button className={`p-2 rounded-lg ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}>
                    <Download size={16} className={dark ? 'text-gray-400' : 'text-gray-500'} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <PipelineItem label="New" value={safeData.pipeline.new} total={42} color="blue" dark={dark} />
                <PipelineItem label="Follow Up" value={safeData.pipeline.followup} total={42} color="purple" dark={dark} />
                <PipelineItem label="Survey" value={safeData.pipeline.survey} total={42} color="indigo" dark={dark} />
                <PipelineItem label="Offer" value={safeData.pipeline.offer} total={42} color="amber" dark={dark} />
                <PipelineItem label="Deal" value={safeData.pipeline.deal} total={42} color="emerald" dark={dark} />
                <PipelineItem label="Lost" value={safeData.pipeline.lost} total={42} color="rose" dark={dark} />
              </div>
            </GlassCard>
          </div>

          {/* Timeline */}
          <div>
            <GlassCard dark={dark}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <Clock size={18} className={dark ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  <h2 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>
                    Today's Timeline
                  </h2>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  dark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="space-y-4">
                {safeData.timeline.map((item, idx) => (
                  <TimelineItem key={item.id} item={item} dark={dark} index={idx} />
                ))}
              </div>

              <button className={`w-full mt-4 py-3 text-sm font-medium rounded-xl transition-all ${
                dark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                View All Activities
              </button>
            </GlassCard>
          </div>
        </motion.div>

        {/* ===== BOTTOM GRID ===== */}
        <motion.div variants={MOTION_CONFIG.item} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Asset Management */}
          <GlassCard dark={dark} className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <Box size={18} className={dark ? 'text-blue-400' : 'text-blue-600'} />
                  </div>
                  <h3 className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                    Asset Management
                  </h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  dark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {safeData.ga.totalAsset} units
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={dark ? 'text-gray-400' : 'text-gray-500'}>Kondisi Baik</span>
                    <span className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {safeData.ga.totalAsset - safeData.ga.assetMaintenance}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((safeData.ga.totalAsset - safeData.ga.assetMaintenance) / safeData.ga.totalAsset) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={dark ? 'text-gray-400' : 'text-gray-500'}>Maintenance</span>
                    <span className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {safeData.ga.assetMaintenance}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(safeData.ga.assetMaintenance / safeData.ga.totalAsset) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/admin/ga"
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      dark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-sm font-medium">Manage Assets</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* HR Overview */}
          <GlassCard dark={dark}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <Users size={18} className={dark ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <h3 className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  HR Overview
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-4 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Onboarding</p>
                <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {safeData.hr.onboarding}
                </p>
                <p className={`text-xs ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>+2 minggu ini</p>
              </div>
              <div className={`p-4 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Offboarding</p>
                <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {safeData.hr.offboarding}
                </p>
                <p className={`text-xs ${dark ? 'text-rose-400' : 'text-rose-600'}`}>-1 minggu ini</p>
              </div>
            </div>

            <Link
              href="/admin/hr"
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                dark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm font-medium">HR Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard dark={dark}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Zap size={18} className={dark ? 'text-blue-400' : 'text-blue-600'} />
              </div>
              <h3 className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
            </div>

            <div className="space-y-2">
              <QuickActionButton
                href="/admin/crm/inquiry/new"
                label="New Inquiry"
                desc="Buat lead baru"
                icon={FileText}
                dark={dark}
              />
              <QuickActionButton
                href="/admin/estimator/rab/new"
                label="New RAB"
                desc="Mulai estimasi"
                icon={BarChart3}
                dark={dark}
              />
              <QuickActionButton
                href="/admin/projects/new"
                label="New Project"
                desc="Create proyek"
                icon={Briefcase}
                dark={dark}
              />
              <QuickActionButton
                href="/admin/purchasing/po/new"
                label="New PO"
                desc="Purchase order"
                icon={Box}
                dark={dark}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* ===== FOOTER ===== */}
        <motion.div variants={MOTION_CONFIG.item} className="mt-8 text-center">
          <p className={`text-xs ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
            PT Manggala Putra Persada • Enterprise Resource Planning v3.0
          </p>
          <p className={`text-[10px] mt-1 ${dark ? 'text-gray-700' : 'text-gray-300'}`}>
            Sistem terintegrasi • Real-time updates • Powered by Next.js
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}

// ==================== COMPONENTS ====================

interface FinancialCardProps {
  title: string
  value: number
  unit: string
  change: number
  icon: any
  color: 'primary' | 'success' | 'warning' | 'info' | 'danger'
  dark: boolean
}

function FinancialCard({ title, value, unit, change, icon: Icon, color, dark }: FinancialCardProps) {
  const isPositive = change > 0
  const colorClasses = {
    primary: dark ? 'from-blue-500 to-indigo-500' : 'from-blue-600 to-indigo-600',
    success: dark ? 'from-emerald-500 to-green-500' : 'from-emerald-600 to-green-600',
    warning: dark ? 'from-amber-500 to-orange-500' : 'from-amber-600 to-orange-600',
    info: dark ? 'from-cyan-500 to-sky-500' : 'from-cyan-600 to-sky-600',
    danger: dark ? 'from-rose-500 to-red-500' : 'from-rose-600 to-red-600'
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative p-6 rounded-2xl border transition-all ${
        dark 
          ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          ${isPositive 
            ? dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            : dark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change)}%
        </div>
      </div>

      <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      <p className={`text-2xl font-bold mt-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
        {value.toLocaleString('id-ID')}{unit}
      </p>
    </motion.div>
  )
}

interface KPICardProps {
  title: string
  value: number | string
  icon: any
  href: string
  subtitle?: string
  percent: number
  color: 'primary' | 'success' | 'warning' | 'info' | 'danger'
  pulse?: boolean
  dark: boolean
}

function KPICard({ title, value, icon: Icon, href, subtitle, percent, color, pulse, dark }: KPICardProps) {
  const colorClasses = {
    primary: dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600',
    success: dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
    warning: dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600',
    info: dark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600',
    danger: dark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'
  }

  const barColor = {
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-cyan-500',
    danger: 'bg-rose-500'
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`relative p-6 rounded-2xl border transition-all ${
        dark 
          ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
      }`}
    >
      {pulse && (
        <span className="absolute top-4 right-4 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        <Link
          href={href}
          className={`p-2 rounded-lg transition-colors ${
            dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          aria-label={`View ${title}`}
        >
          <ArrowRight size={16} className={dark ? 'text-gray-400' : 'text-gray-500'} />
        </Link>
      </div>

      <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      <div className="flex items-baseline gap-2 mt-1 mb-4">
        <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </p>
        {subtitle && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {subtitle}
          </span>
        )}
      </div>

      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 1 }}
          className={`h-full ${barColor[color]}`}
        />
      </div>
    </motion.div>
  )
}

function PipelineItem({ label, value, total, color, dark }: any) {
  const percent = (value / total) * 100
  const colors = {
    blue: dark ? 'bg-blue-500' : 'bg-blue-500',
    purple: dark ? 'bg-purple-500' : 'bg-purple-500',
    indigo: dark ? 'bg-indigo-500' : 'bg-indigo-500',
    amber: dark ? 'bg-amber-500' : 'bg-amber-500',
    emerald: dark ? 'bg-emerald-500' : 'bg-emerald-500',
    rose: dark ? 'bg-rose-500' : 'bg-rose-500'
  }

  return (
    <div className={`p-4 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1 }}
          className={`h-full ${colors[color as keyof typeof colors]}`}
        />
      </div>
    </div>
  )
}

function TimelineItem({ item, dark, index }: any) {
  const priorityColors = {
    high: dark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600',
    medium: dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600',
    low: dark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center justify-between p-3 rounded-xl ${
        dark ? 'bg-gray-800' : 'bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          item.priority === 'high' ? 'bg-rose-500' : 
          item.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
        }`} />
        <div>
          <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>
            {item.title}
          </p>
          <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{item.date}</p>
        </div>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
        {item.priority}
      </span>
    </motion.div>
  )
}

function QuickActionButton({ href, label, desc, icon: Icon, dark }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
        dark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${dark ? 'bg-gray-700' : 'bg-white'}`}>
          <Icon size={16} className={dark ? 'text-blue-400' : 'text-blue-600'} />
        </div>
        <div>
          <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
        </div>
      </div>
      <ChevronRight size={16} className={dark ? 'text-gray-500' : 'text-gray-400'} />
    </Link>
  )
}

function GlassCard({ children, dark, className = '' }: any) {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${
        dark 
          ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' 
          : 'bg-white border-gray-200 shadow-lg'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// ==================== LOADING SKELETON ====================
function DashboardSkeleton({ dark }: { dark: boolean }) {
  return (
    <div className={`min-h-screen ${dark ? 'bg-gray-950' : 'bg-gray-50'} p-6 md:p-10`}>
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        
        {/* Financial Cards */}
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== ERROR FALLBACK ====================
function DashboardError({ error, onRetry, dark }: any) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="text-center max-w-md p-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <AlertTriangle size={32} className="text-rose-600 dark:text-rose-400" />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
          Dashboard Error
        </h2>
        <p className={`text-sm mb-6 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          {error?.message || 'Failed to load dashboard data'}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
