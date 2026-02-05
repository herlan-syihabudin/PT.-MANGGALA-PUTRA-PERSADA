"use client"

import { useState } from "react"

export default function EmployeeMasterPage() {
  const [open, setOpen] = useState(false)

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

      {/* INFO FLOW */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        Tahap awal HR: input data inti karyawan sebelum lanjut ke kontrak, payroll,
        absensi, dan KPI.
      </div>

      {/* LIST PLACEHOLDER */}
      <div className="bg-white border rounded-xl p-6 text-sm text-gray-500">
        📋 List karyawan akan ditampilkan di sini
      </div>

      {/* MODAL */}
      {open && <AddEmployeeModal onClose={() => setOpen(false)} />}
    </section>
  )
}

/* ================= MODAL ================= */

function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Tambah Karyawan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form className="space-y-4">
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Nama lengkap"
          />
          <input
            className="w-full border rounded-lg p-2"
            placeholder="NIK / ID Karyawan"
          />
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Jabatan"
          />
          <select className="w-full border rounded-lg p-2">
            <option>Divisi</option>
            <option>Engineering</option>
            <option>HR & GA</option>
            <option>Finance</option>
            <option>Project</option>
          </select>
        </form>

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Batal
          </button>
          <button
            onClick={() => {
              alert("Data karyawan tersimpan (dummy)")
              onClose()
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
          >
            Simpan
          </button>
        </div>

      </div>
    </div>
  )
}
