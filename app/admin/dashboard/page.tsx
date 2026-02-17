"use client"

import { motion, useReducedMotion } from "framer-motion"
import SmartKPI from "@/components/dashboard/SmartKPI"
import StatusItem from "@/components/dashboard/StatusItem"
import {
  Users,
  Briefcase,
  Box,
  AlertTriangle,
  FileText,
  ArrowRight,
  RefreshCcw,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

/* =======================
   SMALL UTILS
======================= */

function clamp(n: number, min = 0, max = 100) {
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}

function fmtNumber(v: any) {
  // simple formatter (bisa lu upgrade jadi IDR nanti)
  if (typeof v === "number") return v.toLocaleString("id-ID")
  return String(v ?? 0)
}

/* =======================
   SKELETON
======================= */

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-4 w-80 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-gray-100 rounded-xl animate-pulse hidden md:block" />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[168px] rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="h-full w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="h-5 w-40 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Second row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[340px] bg-white border border-gray-100 rounded-3xl shadow-sm animate-pulse" />
        <div className="h-[340px] bg-slate-900 rounded-3xl shadow-sm animate-pulse" />
      </div>
    </div>
  )
}

/* =======================
   PAGE
======================= */

export default function AdminDashboardPage({ data, isLoading }: any) {
  const reduceMotion = useReducedMotion()
  const [refreshKey, setRefreshKey] = useState(0)

  if (isLoading) return <DashboardSkeleton />

  const safeData = data ?? {}
  const {
    hr = { totalEmployee: 0, hadirHariIni: 0 },
    ga = { totalAsset: 0, assetMaintenance: 0 },
    inventory = { materialNeedUpdate: 0, totalMaterial: 100 },
    project = { projectAktif: 0, projectTerlambat: 0 },
    finance = { cashflowWarning: 0 },
  } = safeData

  const attendanceRate = useMemo(() => {
    const rate =
      hr.totalEmployee > 0 ? (hr.hadirHariIni / hr.totalEmployee) * 100 : 0
    return clamp(rate)
  }, [hr.totalEmployee, hr.hadirHariIni])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.06,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <section
      key={refreshKey}
      className="p-6 md:p-8 space-y-10 md:space-y-14 bg-gradient-to-b from-[#f8fafc] to-white min-h-screen"
    >
      {/* HEADER */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <motion.div variants={item} className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-yellow-500 rounded-full" />
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Control{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
              Center
            </span>
          </h1>
          <p className="text-gray-500 font-medium">
            PT Manggala Putra Persada • Management Overview
          </p>
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Refresh dashboard"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <RefreshCcw size={18} />
          </button>

          <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold shadow-sm flex items-center gap-3">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            System Live
          </div>
        </motion.div>
      </motion.div>

      {/* FINANCIAL SMART KPI */}
<motion.div
  variants={container}
  initial="hidden"
  animate="show"
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
>
  <motion.div variants={item}>
    <SmartKPI
      title="Revenue Bulan Ini"
      value={1250000000}
      previousValue={980000000}
      prefix="Rp "
      sparkline={[400, 600, 750, 900, 1100, 1250]}
    />
  </motion.div>

  <motion.div variants={item}>
    <SmartKPI
      title="Cashflow"
      value={820000000}
      previousValue={900000000}
      prefix="Rp "
      sparkline={[950, 910, 880, 860, 830, 820]}
    />
  </motion.div>

  <motion.div variants={item}>
    <SmartKPI
      title="Net Profit"
      value={320000000}
      previousValue={280000000}
      prefix="Rp "
      sparkline={[180, 200, 230, 260, 300, 320]}
    />
  </motion.div>

  <motion.div variants={item}>
    <SmartKPI
      title="Total Project Value"
      value={5400000000}
      previousValue={5000000000}
      prefix="Rp "
      sparkline={[4200, 4500, 4700, 5000, 5200, 5400]}
    />
  </motion.div>
</motion.div>

      {/* KPI GRID */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
      >
        <motion.div variants={item}>
          <KpiCardPro
            title="Cashflow Warning"
            value={finance.cashflowWarning}
            icon={AlertTriangle}
            href="/admin/finance/report"
            subtitle="Tindakan Diperlukan"
            percent={finance.cashflowWarning > 0 ? 100 : 0}
            tone="danger"
            pulse={finance.cashflowWarning > 0}
          />
        </motion.div>

        <motion.div variants={item}>
          <KpiCardPro
            title="Project Active"
            value={project.projectAktif}
            icon={Briefcase}
            href="/admin/project"
            subtitle={`${project.projectTerlambat} Terlambat`}
            percent={clamp(project.projectAktif > 0 ? 75 : 0)}
            tone="info"
          />
        </motion.div>

        <motion.div variants={item}>
          <KpiCardPro
            title="Hadir Hari Ini"
            value={`${hr.hadirHariIni}/${hr.totalEmployee}`}
            icon={Users}
            href="/admin/hr/attendance"
            subtitle={`${attendanceRate.toFixed(0)}% Kehadiran`}
            percent={attendanceRate}
            tone="success"
          />
        </motion.div>

        <motion.div variants={item}>
          <KpiCardPro
            title="Material Update"
            value={inventory.materialNeedUpdate}
            icon={Box}
            href="/admin/inventory"
            subtitle="Cek Supplier"
            percent={clamp(inventory.materialNeedUpdate > 0 ? 40 : 0)}
            tone="warning"
          />
        </motion.div>
      </motion.div>

      {/* PIPELINE SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            Estimator Pipeline
          </h2>
          <span className="text-xs font-semibold text-gray-400">
            Overview Progress
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatusItem label="New" value={5} total={20} variant="new" />
          <StatusItem label="Follow Up" value={8} total={20} variant="followup" />
          <StatusItem label="Survey" value={4} total={20} variant="survey" />
          <StatusItem label="Offer" value={6} total={20} variant="offer" />
          <StatusItem label="Deal" value={3} total={20} variant="deal" />
          <StatusItem label="Lost" value={2} total={20} variant="lost" />
        </div>
      </motion.div>

      {/* SECOND ROW */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* DOC / CONTRACT */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5 }}
          className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
              <FileText size={20} className="text-blue-600" />
              Peringatan Dokumen & Kontrak
            </h3>

            <button
              type="button"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold">
                    DOC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Kontrak Kerja #{i}02
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Expired: 12 Feb 2026
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                  EXPIRED
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ASSET SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.55 }}
          className="relative bg-[#0f172a] rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Box size={120} />
          </div>

          <div className="relative z-10">
            <h3 className="font-bold text-blue-400 text-sm uppercase tracking-widest">
              Total Asset
            </h3>

            <p className="text-5xl md:text-6xl font-black mt-2 tracking-tighter">
              {fmtNumber(ga.totalAsset)}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400">Kondisi Baik</span>
                <span className="text-emerald-400">
                  {fmtNumber(Math.max(0, ga.totalAsset - ga.assetMaintenance))}
                </span>
              </div>

              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                />
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed italic">
                *Segera jadwalkan maintenance rutin untuk{" "}
                {fmtNumber(ga.assetMaintenance)} aset yang tertunda.
              </p>
            </div>

            <button
              type="button"
              className="mt-8 w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-[#0f172a] rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              aria-label="Buka Manajemen Aset"
            >
              Buka Manajemen Aset <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* =======================
   KPI CARD PRO (UPGRADED)
======================= */

function KpiCardPro({
  title,
  value,
  icon: Icon,
  href,
  subtitle,
  percent = 60,
  tone = "info", // info | success | warning | danger
  pulse = false,
}: {
  title: string
  value: any
  icon: any
  href?: string
  subtitle?: string
  percent?: number
  tone?: "info" | "success" | "warning" | "danger"
  pulse?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const p = clamp(percent)

  const toneMap = {
    info: {
      chipBg: "bg-blue-50",
      chipText: "text-blue-600",
      bar: "bg-blue-500",
      glow: "shadow-blue-500/20",
      borderFrom: "from-blue-500/40",
      borderTo: "to-cyan-500/30",
    },
    success: {
      chipBg: "bg-emerald-50",
      chipText: "text-emerald-600",
      bar: "bg-emerald-500",
      glow: "shadow-emerald-500/20",
      borderFrom: "from-emerald-500/35",
      borderTo: "to-lime-500/25",
    },
    warning: {
      chipBg: "bg-amber-50",
      chipText: "text-amber-600",
      bar: "bg-amber-500",
      glow: "shadow-amber-500/20",
      borderFrom: "from-amber-500/40",
      borderTo: "to-yellow-500/30",
    },
    danger: {
      chipBg: "bg-red-50",
      chipText: "text-red-600",
      bar: "bg-red-500",
      glow: "shadow-red-500/20",
      borderFrom: "from-red-500/45",
      borderTo: "to-orange-500/25",
    },
  }[tone]

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`relative rounded-3xl p-[1px] ${toneMap.glow} shadow-sm`}
    >
      {/* Animated gradient border */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${toneMap.borderFrom} ${toneMap.borderTo} opacity-80`}
      />
      <motion.div
        aria-label={title}
        className="relative bg-white border border-gray-100 rounded-3xl p-6 overflow-hidden"
      >
        {/* soft glass highlight */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-white/60 to-transparent blur-2xl opacity-70 pointer-events-none" />

        {/* pulse indicator (realtime / urgency) */}
        {pulse && (
          <div className="absolute top-4 right-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-2xl ${toneMap.chipBg} ${toneMap.chipText} shadow-sm`}>
            <Icon size={22} />
          </div>

          {href && (
            <Link
              href={href}
              aria-label={`Buka ${title}`}
              className="text-gray-300 hover:text-blue-600 transition-colors p-1"
            >
              <ArrowRight size={20} />
            </Link>
          )}
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
            {title}
          </p>

          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              {fmtNumber(value)}
            </h3>

            {subtitle && (
              <span className="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-6 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${p}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.95, ease: "easeOut" }}
            className={`h-full ${toneMap.bar} rounded-full`}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
