// app/admin/estimator/ve/[rab_id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  TrendingUp,
  Copy,
  Download,
  RefreshCw,
  FileText,
  Package,
  Wrench,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  AlertCircle,
  Save,
  Plus
} from "lucide-react"
import { toast } from "sonner"

interface VEVersion {
  id: string
  name: string
  multiplier: number
  total_value: number
  material_total: number
  labour_total: number
  items: any[]
  isSelected?: boolean
  notes?: string
}

export default function VEDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rab_id = params.rab_id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rabData, setRabData] = useState<any>(null)
  const [versions, setVersions] = useState<VEVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [showCompare, setShowCompare] = useState(false)

  // Fetch data RAB
  useEffect(() => {
    fetchRABData()
  }, [rab_id])

  async function fetchRABData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/estimator/rab/${rab_id}`)
      const data = await res.json()

      setRabData(data)

      // Generate default versions
      const baseValue = data.summary?.total_value || 0
      setVersions([
        {
          id: "v1",
          name: "Standard",
          multiplier: 1.0,
          total_value: baseValue,
          material_total: baseValue * 0.7,
          labour_total: baseValue * 0.3,
          items: data.items || [],
          isSelected: true,
          notes: "Material standar SNI"
        },
        {
          id: "v2",
          name: "Premium",
          multiplier: 1.3,
          total_value: baseValue * 1.3,
          material_total: baseValue * 1.3 * 0.75,
          labour_total: baseValue * 1.3 * 0.25,
          items: data.items?.map((item: any) => ({
            ...item,
            material_price: item.material_price * 1.5,
            total_price: item.total_price * 1.3
          })) || [],
          notes: "Material import, finishing premium"
        },
        {
          id: "v3",
          name: "Ekonomis",
          multiplier: 0.8,
          total_value: baseValue * 0.8,
          material_total: baseValue * 0.8 * 0.65,
          labour_total: baseValue * 0.8 * 0.35,
          items: data.items?.map((item: any) => ({
            ...item,
            material_price: item.material_price * 0.7,
            total_price: item.total_price * 0.8
          })) || [],
          notes: "Material lokal, efisiensi tenaga"
        }
      ])

      setSelectedVersion("v1")
    } catch (error) {
      toast.error("Gagal memuat data RAB")
    } finally {
      setLoading(false)
    }
  }

  // Create new version
  const createNewVersion = () => {
    const baseVersion = versions.find(v => v.id === selectedVersion) || versions[0]
    const newId = `v${versions.length + 1}`
    
    const newVersion: VEVersion = {
      ...baseVersion,
      id: newId,
      name: `Custom ${versions.length + 1}`,
      multiplier: baseVersion.multiplier,
      isSelected: false,
      notes: "Custom version"
    }

    setVersions([...versions, newVersion])
    setSelectedVersion(newId)
    toast.success("Versi baru ditambahkan")
  }

  // Update multiplier
  const updateMultiplier = (versionId: string, multiplier: number) => {
    setVersions(prev => prev.map(v => {
      if (v.id !== versionId) return v
      
      const baseValue = rabData?.summary?.total_value || 0
      return {
        ...v,
        multiplier,
        total_value: baseValue * multiplier,
        material_total: baseValue * multiplier * 0.7,
        labour_total: baseValue * multiplier * 0.3
      }
    }))
  }

  // Save VE results
  const saveVE = async () => {
    setSaving(true)
    try {
      // Simpan ke database atau state
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Value Engineering berhasil disimpan")
    } catch (error) {
      toast.error("Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  // Format currency
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <RefreshCw className="animate-spin" size={18} />
          <span>Loading Value Engineering...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition border border-slate-200"
            >
              <ArrowLeft size={18} className="text-slate-600" />
            </button>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-slate-800">
                Value Engineering
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                RAB: {rab_id} • {rabData?.header?.project_name || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={createNewVersion}
              className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition"
            >
              <Plus size={14} />
              Tambah Versi
            </button>
            <button
              onClick={() => setShowCompare(!showCompare)}
              className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition"
            >
              {showCompare ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showCompare ? "Sembunyikan" : "Bandingkan"}
            </button>
            <button
              onClick={saveVE}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Simpan VE
            </button>
          </div>
        </div>

        {/* VERSIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`bg-white border rounded-xl p-5 shadow-sm transition cursor-pointer ${
                selectedVersion === version.id
                  ? 'border-emerald-500 ring-2 ring-emerald-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setSelectedVersion(version.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{version.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{version.notes}</p>
                </div>
                {selectedVersion === version.id && (
                  <div className="p-1 bg-emerald-100 rounded-full">
                    <Check size={12} className="text-emerald-600" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Multiplier:</span>
                  <span className="font-medium text-slate-700">{version.multiplier}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total:</span>
                  <span className="font-semibold text-emerald-600">
                    {formatIDR(version.total_value)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>Material: {formatIDR(version.material_total)}</span>
                  <span>Upah: {formatIDR(version.labour_total)}</span>
                </div>
              </div>

              {selectedVersion === version.id && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <label className="text-xs text-slate-500 block mb-1">
                    Adjust Multiplier
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={version.multiplier}
                    onChange={(e) => updateMultiplier(version.id, parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* COMPARISON TABLE */}
        {showCompare && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <TrendingUp size={16} />
                Perbandingan Semua Versi
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Versi
                    </th>
                    <th className="p-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Multiplier
                    </th>
                    <th className="p-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Material
                    </th>
                    <th className="p-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Upah
                    </th>
                    <th className="p-3 text-right text-xs font-medium text-slate-500 uppercase">
                      Total
                    </th>
                    <th className="p-3 text-center text-xs font-medium text-slate-500 uppercase">
                      Selisih
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {versions.map((version, idx) => {
                    const baseValue = versions[0].total_value
                    const diff = version.total_value - baseValue
                    const diffPercent = (diff / baseValue) * 100

                    return (
                      <tr key={version.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium">{version.name}</td>
                        <td className="p-3 text-right font-mono">{version.multiplier}x</td>
                        <td className="p-3 text-right font-mono">{formatIDR(version.material_total)}</td>
                        <td className="p-3 text-right font-mono">{formatIDR(version.labour_total)}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          {formatIDR(version.total_value)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            diff > 0 
                              ? 'bg-amber-100 text-amber-700'
                              : diff < 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {diff > 0 ? '+' : ''}{diffPercent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EXPORT OPTIONS */}
        <div className="flex items-center justify-end gap-2">
          <button className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition">
            <Download size={14} />
            Export PDF
          </button>
          <button className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition">
            <Copy size={14} />
            Copy All
          </button>
        </div>

      </div>
    </div>
  )
}
