// app/admin/estimator/rab/[rab_id]/ve/VEClient.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatIDR } from "@/lib/format"
import {
  ArrowLeft,
  LayoutPanelLeft,
  Sparkles,
  Scissors,
  Layers,
  Loader2,
} from "lucide-react"

type RabSummary = {
  rab_id: string
  project_id?: string
  project_name?: string
  customer_name?: string
  total_value?: number
  total_items?: number
}

export default function VEClient({ rab_id }: { rab_id: string }) {
  const [summary, setSummary] = useState<RabSummary | null>(null)
  const [loading, setLoading] = useState(true)

  // Ambil ringkasan RAB buat konteks VE
  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const res = await fetch(`/api/estimator/rab/${rab_id}`, {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("Failed to load RAB")
        }

        const raw = await res.json()

        if (ignore) return

        setSummary({
          rab_id: raw.rab_id,
          project_id: raw.project_id,
          project_name: raw.project_name,
          customer_name: raw.customer_name,
          total_value: raw.total_value ?? 0,
          total_items: raw.total_items ?? raw.items?.length ?? 0,
        })
      } catch (e) {
        console.error(e)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [rab_id])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-amber-500 uppercase mb-1">
              Value Engineering
            </p>
            <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-slate-900">
              Opsi VE RAB Project
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              RAB ID: <span className="font-mono">{rab_id}</span>
              {summary?.project_id && (
                <>
                  {" "}
                  • Project ID:{" "}
                  <span className="font-mono">{summary.project_id}</span>
                </>
              )}
            </p>
            {summary?.project_name && (
              <p className="text-xs text-slate-500 mt-0.5">
                Project:{" "}
                <span className="font-medium text-slate-700">
                  {summary.project_name}
                </span>
              </p>
            )}
            {summary?.customer_name && (
              <p className="text-xs text-slate-500">
                Customer:{" "}
                <span className="font-medium text-slate-700">
                  {summary.customer_name}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <Link
              href={`/admin/estimator/rab/${rab_id}`}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-xs hover:bg-slate-50 transition"
            >
              <ArrowLeft size={14} />
              Kembali ke RAB
            </Link>

            <div className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs shadow-sm">
              <p className="uppercase tracking-[0.18em] text-[10px] text-slate-300">
                Total RAB
              </p>
              <p className="text-sm font-semibold mt-1">
                {summary?.total_value
                  ? formatIDR(summary.total_value)
                  : loading
                  ? "..."
                  : "Rp 0"}
              </p>
              <p className="text-[11px] text-slate-300">
                {summary?.total_items ?? 0} item pekerjaan
              </p>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat ringkasan RAB...
          </div>
        )}

        {/* INFO PANEL */}
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-600">
          <div className="flex items-start gap-3">
            <LayoutPanelLeft className="w-4 h-4 mt-0.5 text-slate-400" />
            <div>
              <p className="font-medium text-slate-700 mb-1">
                Step berikutnya: pilih strategi Value Engineering
              </p>
              <p className="mb-1">
                Di tahap ini estimator menyiapkan beberapa skenario RAB:
                penyesuaian spesifikasi, alternatif material, atau pemecahan
                scope kerja, tanpa mengubah data RAB asli.
              </p>
              <p className="text-[11px] text-slate-400">
                *Flow lanjutan (generate versi RAB & approval) bisa kita
                sambung setelah struktur dasar VE disepakati.
              </p>
            </div>
          </div>
        </div>

        {/* VE OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. VE Optional / Alternatif */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    VE – Optional / Alternatif
                  </h2>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Siapkan alternatif material / metode kerja (good–better–best)
                tanpa menurunkan fungsi utama bangunan.
              </p>
              <ul className="text-[11px] text-slate-500 list-disc list-inside mt-1 space-y-0.5">
                <li>Alternatif item per scope pekerjaan</li>
                <li>Catatan plus/minus tiap alternatif</li>
                <li>Cocok untuk diskusi teknis dengan owner</li>
              </ul>
            </div>
            <button
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 text-white text-xs py-2 hover:bg-slate-800 transition"
              type="button"
            >
              Mulai VE Optional
            </button>
          </div>

          {/* 2. VE Cost Down */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <Scissors className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    VE – Cost Down
                  </h2>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Fokus menurunkan nilai RAB sampai target budget owner, dengan
                tetap menjaga kualitas minimal yang disepakati.
              </p>
              <ul className="text-[11px] text-slate-500 list-disc list-inside mt-1 space-y-0.5">
                <li>Penyesuaian spesifikasi & volume</li>
                <li>Prioritas berdasarkan bobot biaya terbesar</li>
                <li>Output: versi RAB dengan nilai baru</li>
              </ul>
            </div>
            <button
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white text-xs py-2 hover:bg-emerald-500 transition"
              type="button"
            >
              Mulai VE Cost Down
            </button>
          </div>

          {/* 3. VE Scope Split / Phasing */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sky-50 border border-sky-100">
                    <Layers className="w-4 h-4 text-sky-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    VE – Scope Split / Tahapan
                  </h2>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Pecah pekerjaan jadi beberapa tahap (misal: tahap 1 struktur,
                tahap 2 arsitektur, dll) sesuai cashflow owner.
              </p>
              <ul className="text-[11px] text-slate-500 list-disc list-inside mt-1 space-y-0.5">
                <li>Pemetaan item per tahap</li>
                <li>Cocok untuk proyek multi-tahun</li>
                <li>Jembatan ke modul Master Schedule</li>
              </ul>
            </div>
            <button
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 text-white text-xs py-2 hover:bg-sky-500 transition"
              type="button"
            >
              Mulai VE Scope Split
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
