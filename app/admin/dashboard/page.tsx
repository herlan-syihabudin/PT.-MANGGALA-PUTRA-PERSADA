"use client"

import { motion } from "framer-motion"
import {
  Users,
  Briefcase,
  Box,
  AlertTriangle,
  FileText,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

/* ===== TYPE COLOR OBJECT ===== */

type ColorConfig = {
  bg: string
  text: string
  mainBar: string
}

/* ===== KPI COMPONENT ===== */

function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  href,
  subtitle,
}: {
  title: string
  value: number | string
  icon: any
  color: ColorConfig
  href?: string
  subtitle?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
          <Icon size={24} />
        </div>

        {href && (
          <Link
            href={href}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ArrowRight size={18} />
          </Link>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <span className="text-xs text-gray-400 font-medium">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
        <div
          className={`h-full ${color.mainBar} w-2/3 opacity-40`}
        />
      </div>
    </motion.div>
  )
}

/* ===== MAIN PAGE ===== */

export default function AdminDashboardPage({ data }: any) {
  const {
  hr = { totalEmployee: 0, hadirHariIni: 0 },
  ga = { totalAsset: 0, assetMaintenance: 0 },
  inventory = { materialNeedUpdate: 0 },
  project = { projectAktif: 0 },
  finance = { cashflowWarning: 0 },
} = data || {}

  return (
    <section className="p-8 space-y-12 bg-[#f8fafc] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Control Center
          </h1>
          <p className="text-gray-500 font-medium">
            Monitoring operasional PT MPP secara realtime.
          </p>
        </div>

        <div className="px-4 py-2 bg-white border rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          System Live
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <KpiCard
          title="Cashflow Warning"
          value={finance.cashflowWarning}
          icon={AlertTriangle}
          color={{
            bg: "bg-red-50",
            text: "text-red-600",
            mainBar: "bg-red-500",
          }}
          subtitle="Critical Action"
          href="/admin/finance/report"
        />

        <KpiCard
          title="Project Active"
          value={project.projectAktif}
          icon={Briefcase}
          color={{
            bg: "bg-blue-50",
            text: "text-blue-600",
            mainBar: "bg-blue-500",
          }}
          subtitle="1 Terlambat"
          href="/admin/project"
        />

        <KpiCard
          title="Hadir Hari Ini"
          value={`${hr.hadirHariIni}/${hr.totalEmployee}`}
          icon={Users}
          color={{
            bg: "bg-emerald-50",
            text: "text-emerald-600",
            mainBar: "bg-emerald-500",
          }}
          subtitle="92% Attendance"
          href="/admin/hr/attendance"
        />

        <KpiCard
          title="Material Need Update"
          value={inventory.materialNeedUpdate}
          icon={Box}
          color={{
            bg: "bg-amber-50",
            text: "text-amber-600",
            mainBar: "bg-amber-500",
          }}
          subtitle="Supplier Check"
          href="/admin/inventory"
        />
      </div>

      {/* SECOND ROW */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Peringatan Dokumen & Kontrak
          </h3>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <p className="text-sm font-medium text-gray-700 font-mono text-[11px]">
                    DOC-EXP-00{i}
                  </p>
                </div>

                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                  EXPIRED
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
          <h3 className="font-bold opacity-80 text-sm uppercase">
            Total Aset Perusahaan
          </h3>
          <p className="text-5xl font-black mt-2">{ga.totalAsset}</p>
          <p className="mt-4 text-xs opacity-70 leading-relaxed italic">
            Aset dalam kondisi baik: {ga.totalAsset - ga.assetMaintenance} unit.
            Segera cek gudang untuk maintenance rutin.
          </p>
        </div>
      </div>
    </section>
  )
}
