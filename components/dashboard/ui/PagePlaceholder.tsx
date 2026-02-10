
"use client"

import { AlertCircle, Clock, CheckCircle2, Users } from "lucide-react"

type ModuleStatus = "planned" | "in-progress" | "testing" | "live"

const STATUS_LABEL: Record<ModuleStatus, string> = {
  planned: "Planning",
  "in-progress": "In Development",
  testing: "Testing",
  live: "Live",
}

const STATUS_COLOR: Record<ModuleStatus, string> = {
  planned: "bg-gray-100 text-gray-700 border border-dashed border-gray-300",
  "in-progress": "bg-blue-50 text-blue-700 border border-blue-100",
  testing: "bg-amber-50 text-amber-700 border border-amber-100",
  live: "bg-green-50 text-green-700 border border-green-100",
}

export default function PagePlaceholder({
  title,
  description,
  status = "planned",
  progress = 15,
  owner = "System Admin / Developer",
  nextAction = "Modul ini sedang dalam proses perancangan workflow & database. Hubungi admin jika modul ini prioritas untuk diaktifkan.",
}: {
  title: string
  description?: string
  status?: ModuleStatus
  progress?: number // 0–100
  owner?: string
  nextAction?: string
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* STATUS & PROGRESS */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* STATUS CARD */}
        <div className="bg-white border rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status Modul
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${STATUS_COLOR[status]}`}
            >
              {status === "live" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {STATUS_LABEL[status]}
            </span>
          </div>

          <div className="mt-1 text-xs text-gray-500">
            Modul ini sudah terdaftar di{" "}
            <span className="font-semibold">ERP Menu</span> dan terkunci
            dalam arsitektur sistem.
          </div>
        </div>

        {/* PROGRESS CARD */}
        <div className="bg-white border rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Progress Implementasi
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {clampedProgress}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-gray-500">
            Progress meliputi: desain workflow, struktur database, API,
            dan tampilan UI.
          </p>
        </div>

        {/* OWNER CARD */}
        <div className="bg-white border rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              PIC / Pemilik Modul
            </span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>

          <p className="text-sm font-medium text-gray-800">
            {owner}
          </p>

          <p className="text-[11px] text-gray-500">
            Akses modul penuh akan diberikan setelah logic & security
            selesai diuji.
          </p>
        </div>
      </div>

      {/* INFO BOX */}
      <div className="bg-white border rounded-2xl p-5 flex gap-3 text-sm text-gray-700">
        <div className="mt-0.5">
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-gray-800">
            Modul belum aktif sepenuhnya
          </p>
          <p className="text-gray-600">
            {nextAction}
          </p>
          <ul className="mt-2 text-[12px] text-gray-500 list-disc list-inside space-y-0.5">
            <li>Menu sudah muncul di sidebar & breadcrumb.</li>
            <li>Endpoint API & schema data sedang disiapkan.</li>
            <li>
              Setelah siap, modul ini akan berubah status menjadi{" "}
              <span className="font-semibold text-blue-600">
                In Development
              </span>{" "}
              atau{" "}
              <span className="font-semibold text-green-600">
                Live
              </span>
              .
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
