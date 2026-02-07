"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

/* ================= TYPE ================= */

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

type EmployeeInfo = {
  employee_id: string
  nama_lengkap: string
  divisi?: string
  jabatan?: string
}

type PageProps = {
  params: { employee_id: string }
}

/* ================= MODAL ================= */

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
          ...form,
          updated_by: "Admin ERP",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Gagal menyimpan status")
        return
      }

      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Tambah Status Karyawan</h2>

        <p className="text-xs text-gray-500">
          Employee ID: <span className="font-mono font-semibold">{employeeId}</span>
        </p>

        <select className="w-full border rounded px-3 py-2 text-sm"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="">Pilih status</option>
          <option value="AKTIF">AKTIF</option>
          <option value="KONTRAK">KONTRAK</option>
          <option value="MUTASI">MUTASI</option>
          <option value="RESIGN">RESIGN</option>
          <option value="CUTI">CUTI</option>
        </select>

        <select className="w-full border rounded px-3 py-2 text-sm"
          value={form.jenis_status}
          onChange={(e) => setForm({ ...form, jenis_status: e.target.value })}
        >
          <option value="">Pilih jenis status</option>
          <option value="Tetap">Tetap</option>
          <option value="Kontrak 1 Tahun">Kontrak 1 Tahun</option>
          <option value="Kontrak 6 Bulan">Kontrak 6 Bulan</option>
          <option value="Probation">Probation</option>
          <option value="Project Based">Project Based</option>
        </select>

        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Lokasi kerja"
          value={form.lokasi_kerja}
          onChange={(e) => setForm({ ...form, lokasi_kerja: e.target.value })}
        />

        <input
          type="date"
          className="w-full border rounded px-3 py-2 text-sm"
          value={form.start_date}
          onChange={(e) => setForm({ ...form, start_date: e.target.value })}
        />

        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          rows={3}
          placeholder="Keterangan"
          value={form.keterangan}
          onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="border px-4 py-2 rounded text-sm">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm"
          >
            {saving ? "Menyimpan..." : "Simpan Status"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= PAGE ================= */

export default function EmploymentStatusDetail({ params }: PageProps) {
  const router = useRouter()
  const employeeId = params.employee_id

  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [rows, setRows] = useState<StatusRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function loadStatus() {
    setLoading(true)
    const res = await fetch(`/api/hr/employment-status?employee_id=${employeeId}`, {
      cache: "no-store",
    })
    const data = await res.json()

    setEmployee(data.employee || null)

    const list: StatusRow[] = data.data || []
    list.sort(
      (a, b) =>
        new Date(b.start_date).getTime() -
        new Date(a.start_date).getTime()
    )
    setRows(list)
    setLoading(false)
  }

  useEffect(() => {
    loadStatus()
  }, [employeeId])

  const current = rows.find((r) => r.is_current === "TRUE")

  return (
    <section className="p-6 space-y-6">
      <button onClick={() => router.back()} className="text-xs text-gray-500">
        ← Kembali
      </button>

      {/* EMPLOYEE HEADER */}
      <div className="rounded-xl border bg-white p-5 space-y-1">
        <div className="text-lg font-semibold">
          {employee?.nama_lengkap || "Nama tidak ditemukan"}
        </div>
        <div className="text-sm text-gray-600">
          {employee?.divisi} • {employee?.jabatan}
        </div>
        <div className="font-mono text-xs text-gray-500">{employeeId}</div>

        {current && (
          <div className="mt-3 flex gap-2 text-xs">
            <span className="bg-emerald-50 border px-2 py-1 rounded-full font-semibold text-emerald-700">
              {current.status} • {current.jenis_status}
            </span>
            <span className="text-gray-600">Sejak {current.start_date}</span>
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="mt-3 bg-gray-900 text-white px-4 py-2 rounded text-xs"
        >
          + Tambah Status
        </button>
      </div>

      {/* TIMELINE */}
      {rows.length > 0 && (
        <div className="rounded-xl border bg-white divide-y">
          {rows.map((row, i) => (
            <div key={i} className="px-5 py-4 text-sm">
              <div className="font-semibold">{row.status}</div>
              <div className="text-xs text-gray-600">
                {row.jenis_status} • {row.start_date}
              </div>
              {row.keterangan && (
                <div className="text-xs text-gray-500 mt-1">
                  {row.keterangan}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
