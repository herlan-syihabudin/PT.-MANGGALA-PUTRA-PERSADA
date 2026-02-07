"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

type EmployeeInfo = {
  employee_id: string
  nama_lengkap: string
  jabatan: string
  divisi: string
}

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

      if (!res.ok) throw new Error()

      alert("Status karyawan berhasil disimpan")
      onSaved()
      onClose()
    } catch {
      alert("Gagal menyimpan status")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 space-y-5">
        <h2 className="text-lg font-semibold">Tambah Status Karyawan</h2>

        <p className="text-xs text-gray-500">
          Employee ID: <b>{employeeId}</b>
        </p>

        {["status", "jenis_status", "lokasi_kerja", "start_date"].map((f) => (
          <input
            key={f}
            type={f === "start_date" ? "date" : "text"}
            placeholder={f.replace("_", " ")}
            className="w-full border rounded px-3 py-2 text-sm"
            onChange={(e) =>
              setForm((p) => ({ ...p, [f]: e.target.value }))
            }
          />
        ))}

        <textarea
          placeholder="Keterangan"
          className="w-full border rounded px-3 py-2 text-sm"
          onChange={(e) =>
            setForm((p) => ({ ...p, keterangan: e.target.value }))
          }
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Batal</button>
          <button
            onClick={handleSubmit}
            className="bg-gray-900 text-white px-4 py-2 rounded"
          >
            Simpan
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

  async function loadData() {
    setLoading(true)
    const res = await fetch(
      `/api/hr/employment-status?employee_id=${employeeId}`,
      { cache: "no-store" }
    )
    const json = await res.json()

    setEmployee(json.employee || null)
    setRows(json.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [employeeId])

  const current = rows.find(
    (r) => String(r.is_current).toUpperCase() === "TRUE"
  )

  return (
    <section className="p-6 space-y-6">
      <button onClick={() => router.back()} className="text-xs text-gray-500">
        ← Kembali
      </button>

      <div className="rounded-xl border bg-white p-5 space-y-1">
        <h2 className="text-lg font-bold">
          {employee?.nama_lengkap || "—"}
        </h2>
        <p className="text-sm text-gray-600">
          {employee?.jabatan} • {employee?.divisi}
        </p>
        <p className="text-xs text-gray-500 font-mono">
          {employeeId}
        </p>

        {current && (
          <span className="inline-block mt-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
            {current.status} • {current.jenis_status}
          </span>
        )}

        <div className="mt-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded text-xs"
          >
            + Tambah Status
          </button>
        </div>
      </div>

      {showModal && (
        <AddStatusModal
          employeeId={employeeId}
          onClose={() => setShowModal(false)}
          onSaved={loadData}
        />
      )}
    </section>
  )
}
