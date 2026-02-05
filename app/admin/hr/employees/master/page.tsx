"use client"

import { useEffect, useState } from "react"

/* ================= PAGE ================= */

export default function EmployeeMasterPage() {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadEmployees() {
    setLoading(true)
    const res = await fetch("/api/hr/employees", { cache: "no-store" })
    const data = await res.json()
    setEmployees(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  return (
    <section className="p-6 md:p-10 space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Employee Master
          </h1>
          <p className="text-gray-600 mt-1">
            Daftar & data inti karyawan
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800"
        >
          + Tambah Karyawan
        </button>
      </div>

      {/* INFO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        Master data karyawan (sumber utama HR, Payroll & Contract)
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading...</p>
        ) : employees.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">Belum ada data karyawan</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-3">Nama</th>
                <th className="p-3">Divisi</th>
                <th className="p-3">Jabatan</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((e, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">
                    {e.nama_lengkap}
                  </td>

                  <td className="p-3">{e.divisi}</td>
                  <td className="p-3">{e.jabatan}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded font-semibold
                        ${
                          e.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {e.is_active ? "AKTIF" : "NONAKTIF"}
                    </span>
                  </td>

                  <td className="p-3 text-center space-x-2">
                    <button
                      className="text-blue-600 hover:underline text-xs"
                      onClick={() =>
                        alert("EDIT akan dibuka (next step)")
                      }
                    >
                      Edit
                    </button>

                    {e.is_active && (
                      <button
                        className="text-red-600 hover:underline text-xs"
                        onClick={() =>
                          alert("NONAKTIF akan diproses (next step)")
                        }
                      >
                        Nonaktif
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL ADD */}
      {open && (
        <AddEmployeeModal
          onClose={() => setOpen(false)}
          onSaved={loadEmployees}
        />
      )}
    </section>
  )
}

/* ================= MODAL ADD ================= */

function generateEmployeeID(divisi: string) {
  const company = "MPP"
  const year = new Date().getFullYear()
  const divCode = divisi.replace(/\s/g, "").toUpperCase()
  const rand = Math.floor(100 + Math.random() * 900)
  return `${company}-${divCode}-${year}-${rand}`
}

function AddEmployeeModal({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({
    nama_lengkap: "",
    nik_ktp: "",
    divisi: "",
    jabatan: "",
    status_karyawan: "",
  })

  const employeeID = form.divisi
    ? generateEmployeeID(form.divisi)
    : ""

  async function submit() {
    if (saving) return

    if (!form.nama_lengkap || !form.divisi || form.nik_ktp.length !== 16) {
      alert("Nama, Divisi & NIK wajib diisi")
      return
    }

    setSaving(true)

    const res = await fetch("/api/hr/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        employee_id: employeeID,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Gagal menyimpan")
      setSaving(false)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 space-y-4">

        <h2 className="text-xl font-bold">Tambah Karyawan</h2>

        <input
          className="border p-2 w-full"
          placeholder="Nama Lengkap *"
          onChange={(e) =>
            setForm({ ...form, nama_lengkap: e.target.value })
          }
        />

        <input
          className="border p-2 w-full"
          placeholder="NIK KTP (16 digit) *"
          maxLength={16}
          onChange={(e) =>
            setForm({ ...form, nik_ktp: e.target.value })
          }
        />

        <select
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({ ...form, divisi: e.target.value })
          }
        >
          <option value="">Divisi *</option>
          <option>Engineering</option>
          <option>HRGA</option>
          <option>Finance</option>
          <option>Project</option>
        </select>

        <input
          className="border p-2 w-full bg-gray-100"
          value={employeeID}
          disabled
        />

        <input
          className="border p-2 w-full"
          placeholder="Jabatan"
          onChange={(e) =>
            setForm({ ...form, jabatan: e.target.value })
          }
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Batal
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white rounded"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  )
}
