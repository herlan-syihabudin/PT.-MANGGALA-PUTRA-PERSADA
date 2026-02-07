"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

type StatusRow = {
  employee_id: string
  status: string
  jenis_status: string
  lokasi_kerja: string
  start_date: string
  end_date: string
  is_current: string
  created_at: string
  updated_by: string
  keterangan: string
}

type PageProps = {
  params: { employee_id: string }
}

/* =============== MODAL TAMBAH STATUS =============== */

type AddStatusModalProps = {
  employeeId: string
  onClose: () => void
  onSaved: () => void
}

function AddStatusModal({ employeeId, onClose, onSaved }: AddStatusModalProps) {
  const [form, setForm] = useState({
    status: "",
    jenis_status: "",
    lokasi_kerja: "",
    start_date: "",
    keterangan: "",
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!form.status || !form.jenis_status || !form.start_date) {
      alert("Status, jenis status, dan tanggal mulai wajib diisi")
      return
    }

    try {
      setSaving(true)

      const res = await fetch("/api/hr/employment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          status: form.status,
          jenis_status: form.jenis_status,
          lokasi_kerja: form.lokasi_kerja,
          start_date: form.start_date,
          updated_by: "Admin ERP",
          keterangan: form.keterangan,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("SAVE STATUS ERROR:", data)
        alert(data.error || "Gagal menyimpan status")
        return
      }

      alert("Status karyawan berhasil disimpan")
      onSaved()
      onClose()
    } catch (e) {
      console.error("SAVE STATUS ERROR:", e)
      alert("Terjadi kesalahan saat menyimpan status")
    } finally {
      setSaving(false)
    }
  }

  function handleChange(
    field: keyof typeof form,
    value: string
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Tambah Status Karyawan
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Employee ID:{" "}
          <span className="font-mono font-semibold">
            {employeeId}
          </span>
        </p>

        <div className="space-y-4">
          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="">Pilih status...</option>
              <option value="AKTIF">AKTIF</option>
              <option value="KONTRAK">KONTRAK</option>
              <option value="MUTASI">MUTASI</option>
              <option value="RESIGN">RESIGN</option>
              <option value="CUTI">CUTI</option>
            </select>
          </div>

          {/* Jenis Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Jenis Status
            </label>
            <select
              value={form.jenis_status}
              onChange={(e) =>
                handleChange("jenis_status", e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="">Pilih jenis status...</option>
              <option value="Tetap">Tetap</option>
              <option value="Kontrak 1 Tahun">Kontrak 1 Tahun</option>
              <option value="Kontrak 6 Bulan">Kontrak 6 Bulan</option>
              <option value="Probation">Probation</option>
              <option value="Project Based">Project Based</option>
            </select>
          </div>

          {/* Lokasi Kerja */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Lokasi Kerja
            </label>
            <input
              value={form.lokasi_kerja}
              onChange={(e) =>
                handleChange("lokasi_kerja", e.target.value)
              }
              placeholder="Contoh: Head Office Bekasi / Site Cigading"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) =>
                handleChange("start_date", e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>

          {/* Keterangan */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Keterangan (optional)
            </label>
            <textarea
              rows={3}
              value={form.keterangan}
              onChange={(e) =>
                handleChange("keterangan", e.target.value)
              }
              placeholder="Catatan HR, misal: Promosi dari Site Engineer menjadi Project Manager"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border text-gray-700 hover:bg-gray-50"
            disabled={saving}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Simpan Status"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* =============== PAGE DETAIL =============== */

export default function EmploymentStatusDetail({ params }: PageProps) {
  const router = useRouter()
  const employeeId = params.employee_id

  const [rows, setRows] = useState<StatusRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [employee, setEmployee] = useState<any>(null)

  async function loadStatus() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/hr/employment-status?employee_id=${encodeURIComponent(
          employeeId
        )}`,
        { cache: "no-store" }
      )

      const data = await res.json()

      if (!res.ok) {
        console.error("LOAD STATUS ERROR:", data)
        setError(data.error || "Gagal memuat status karyawan")
        return
      }

      setEmployee(data.employee || null)

const list: StatusRow[] = data.statuses || []

// Sort: status terbaru di atas (start_date desc)
list.sort((a, b) => {
  const da = a.start_date ? new Date(a.start_date).getTime() : 0
  const db = b.start_date ? new Date(b.start_date).getTime() : 0
  return db - da
})

setRows(list)
    } catch (e) {
      console.error("LOAD STATUS ERROR:", e)
      setError("Gagal memuat status karyawan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [employeeId])

  const current = rows.find(
    (r) => String(r.is_current).toUpperCase() === "TRUE"
  )

  return (
    <section className="p-6 md:p-10 space-y-6">
      {/* BREADCRUMB */}
      <button
        onClick={() => router.back()}
        className="text-xs text-gray-500 hover:text-gray-800"
      >
        ← Kembali ke daftar
      </button>

      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Employment Status
        </h1>
        <p className="text-sm text-gray-500">
          Riwayat status kerja karyawan
        </p>
      </div>

      {/* EMPLOYEE INFO */}
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-5">
        {employee && (
  <div className="space-y-0.5">
    <div className="text-sm font-semibold text-gray-900">
      {employee.nama_lengkap}
    </div>
    <div className="text-xs text-gray-600">
      {employee.jabatan} • {employee.divisi}
    </div>
  </div>
)}
        <div className="text-xs text-gray-500">Employee ID</div>
        <div className="font-mono text-sm font-semibold text-gray-900">
          {employeeId}
        </div>

        {current && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500">
              Status Saat Ini:
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
              {current.status} • {current.jenis_status}
            </span>
            {current.lokasi_kerja && (
              <span className="text-xs text-gray-600">
                Lokasi: {current.lokasi_kerja}
              </span>
            )}
            <span className="text-xs text-gray-500">
              Sejak {current.start_date}
            </span>
          </div>
        )}

        {!current && !loading && (
          <p className="text-xs text-amber-600">
            ⚠️ Karyawan ini belum memiliki status aktif.
          </p>
        )}

        <div className="mt-2">
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
          >
            + Tambah Status
          </button>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="rounded-xl border bg-white">
        <div className="border-b px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Riwayat Status
          </h2>
        </div>

        {loading && (
          <p className="px-5 py-4 text-sm text-gray-500">
            Memuat riwayat status...
          </p>
        )}

        {error && !loading && (
          <p className="px-5 py-4 text-sm text-rose-600">{error}</p>
        )}

        {!loading && !error && rows.length === 0 && (
          <p className="px-5 py-4 text-sm text-gray-500">
            Belum ada riwayat status. Tambahkan status pertama untuk
            karyawan ini.
          </p>
        )}

        {!loading &&
          !error &&
          rows.length > 0 && (
            <div className="divide-y">
              {rows.map((row, idx) => {
                const isActive =
                  String(row.is_current).toUpperCase() === "TRUE"

                return (
                  <div
                    key={idx}
                    className="flex gap-4 px-5 py-4 text-sm"
                  >
                    {/* TIMELINE DOT */}
                    <div className="pt-1">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${
                          isActive
                            ? "bg-emerald-600"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {row.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {row.jenis_status}
                        </span>
                        {isActive && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                            AKTIF
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-600">
                        {row.lokasi_kerja && (
                          <>
                            Lokasi: {row.lokasi_kerja} •{" "}
                          </>
                        )}
                        Mulai: {row.start_date}
                        {row.end_date && ` → ${row.end_date}`}
                      </div>

                      {row.keterangan && (
                        <p className="text-xs text-gray-500 mt-1">
                          {row.keterangan}
                        </p>
                      )}

                      {row.updated_by && (
                        <p className="text-[11px] text-gray-400 mt-1">
                          Diupdate oleh {row.updated_by} pada{" "}
                          {row.created_at}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>

      {showModal && (
        <AddStatusModal
          employeeId={employeeId}
          onClose={() => setShowModal(false)}
          onSaved={loadStatus}
        />
      )}
    </section>
  )
}
