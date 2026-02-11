"use client"

import { motion } from "framer-motion"
import StatusItem from "@/components/dashboard/StatusItem"
import { 
  Users, Briefcase, Box, AlertTriangle, 
  FileText, ArrowRight, RefreshCcw 
} from "lucide-react"
import Link from "next/link"

/* ===== DASHBOARD SKELETON (Buat nunggu data) ===== */
function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}
      </div>
    </div>
  )
}

export default function AdminDashboardPage({ data, isLoading }: any) {
  if (isLoading) return <DashboardSkeleton />
  const safeData = data ?? {}

  const {
  hr = { totalEmployee: 0, hadirHariIni: 0 },
  ga = { totalAsset: 0, assetMaintenance: 0 },
  inventory = { materialNeedUpdate: 0, totalMaterial: 100 },
  project = { projectAktif: 0, projectTerlambat: 0 },
  finance = { cashflowWarning: 0 },
} = safeData

  // Hitung persentase dinamis untuk progress bar
  const attendanceRate = hr.totalEmployee > 0 ? (hr.hadirHariIni / hr.totalEmployee) * 100 : 0

  return (
    <section className="p-8 space-y-16 bg-gradient-to-b from-[#f8fafc] to-white min-h-screen">
      
      {/* HEADER WITH BRANDING ACCENT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-yellow-500 rounded-full" />
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">Center</span>
          </h1>
          <p className="text-gray-500 font-medium">PT Manggala Putra Persada • Management Overview</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <RefreshCcw size={18} />
          </button>
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold shadow-sm flex items-center gap-3">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            System Live
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <KpiCard
          title="Cashflow Warning"
          value={finance.cashflowWarning}
          icon={AlertTriangle}
          color={{ bg: "bg-red-50", text: "text-red-600", mainBar: "bg-red-500" }}
          subtitle="Tindakan Diperlukan"
          href="/admin/finance/report"
          percent={100} // Merah biasanya penuh untuk urgensi
        />

        <KpiCard
          title="Project Active"
          value={project.projectAktif}
          icon={Briefcase}
          color={{ bg: "bg-blue-50", text: "text-blue-600", mainBar: "bg-blue-500" }}
          subtitle={`${project.projectTerlambat} Terlambat`}
          href="/admin/project"
          percent={75}
        />

        <KpiCard
          title="Hadir Hari Ini"
          value={`${hr.hadirHariIni}/${hr.totalEmployee}`}
          icon={Users}
          color={{ bg: "bg-emerald-50", text: "text-emerald-600", mainBar: "bg-emerald-500" }}
          subtitle={`${attendanceRate.toFixed(0)}% Kehadiran`}
          href="/admin/hr/attendance"
          percent={attendanceRate}
        />

        <KpiCard
          title="Material Update"
          value={inventory.materialNeedUpdate}
          icon={Box}
          color={{ bg: "bg-amber-50", text: "text-amber-600", mainBar: "bg-amber-500" }}
          subtitle="Cek Supplier"
          href="/admin/inventory"
          percent={40}
        />
      </div>

      {/* PIPELINE SECTION */}
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
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

      {/* SECOND ROW: DATA VISUALIZATION AREA */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
              <FileText size={20} className="text-blue-600" />
              Peringatan Dokumen & Kontrak
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">Lihat Semua</button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold">DOC</div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Kontrak Kerja #{i}02</p>
                    <p className="text-[10px] text-gray-500 font-mono">Expired: 12 Feb 2026</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100">EXPIRED</span>
              </div>
            ))}
          </div>
        </div>

        {/* ASSET SUMMARY CARD WITH GOLD ACCENT */}
        <div className="relative bg-[#0f172a] rounded-3xl p-8 text-white shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <Box size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-blue-400 text-sm uppercase tracking-widest">Total Asset</h3>
            <p className="text-6xl font-black mt-2 tracking-tighter">{ga.totalAsset}</p>
            
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400">Kondisi Baik</span>
                <span className="text-emerald-400">{ga.totalAsset - ga.assetMaintenance}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" 
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed italic">
                *Segera jadwalkan maintenance rutin untuk {ga.assetMaintenance} aset yang tertunda.
              </p>
            </div>

            <button className="mt-8 w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-[#0f172a] rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
              Buka Manajemen Aset <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Modifikasi sedikit KpiCard untuk menerima prop 'percent' */
function KpiCard({ title, value, icon: Icon, color, href, subtitle, percent = 60 }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color.bg} ${color.text} shadow-sm`}>
          <Icon size={24} />
        </div>
        {href && (
          <Link href={href} className="text-gray-300 hover:text-blue-600 transition-colors p-1">
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
            {value}
          </h3>
          {subtitle && (
            <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color.mainBar} rounded-full`}
        />
      </div>
    </motion.div>
  )
}
