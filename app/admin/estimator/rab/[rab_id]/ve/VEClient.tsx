"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatIDR } from "@/lib/format"

type Version = {
  version_id: string
  version_name: string
  total_value: number
  is_selected: boolean
}

export default function VEClient({ rab_id }: { rab_id: string }) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch(`/api/estimator/rab/${rab_id}/ve`)
    const data = await res.json()
    setVersions(data.versions || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function createVersion() {
    setLoading(true)
    try {
      const res = await fetch(`/api/estimator/rab/${rab_id}/ve`, {
        method: "POST",
      })
      if (!res.ok) throw new Error()
      toast.success("Versi baru dibuat")
      load()
    } catch {
      toast.error("Gagal buat versi")
    } finally {
      setLoading(false)
    }
  }

  async function selectVersion(id: string) {
    await fetch(`/api/estimator/rab/${rab_id}/ve/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version_id: id }),
    })
    toast.success("Versi dipilih")
    load()
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">Value Engineering</h1>
          <p className="text-sm text-slate-500">
            RAB ID: {rab_id}
          </p>
        </div>

        <Link
          href={`/admin/estimator/rab/${rab_id}`}
          className="flex items-center gap-2 text-sm border px-3 py-2 rounded-lg"
        >
          <ArrowLeft size={14} />
          Kembali ke RAB
        </Link>
      </div>

      <div className="flex justify-between">
        <button
          onClick={createVersion}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg"
        >
          <Plus size={16} />
          Tambah Versi
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {versions.map((v) => (
          <div
            key={v.version_id}
            className={`border rounded-xl p-4 ${
              v.is_selected
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <h3 className="font-medium">{v.version_name}</h3>
            <p className="text-lg font-semibold mt-2">
              {formatIDR(v.total_value)}
            </p>

            {!v.is_selected && (
              <button
                onClick={() => selectVersion(v.version_id)}
                className="mt-4 text-sm text-blue-600"
              >
                Pilih versi ini
              </button>
            )}

            {v.is_selected && (
              <div className="mt-4 text-emerald-600 text-sm flex items-center gap-1">
                <CheckCircle size={14} />
                Versi Terpilih
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
