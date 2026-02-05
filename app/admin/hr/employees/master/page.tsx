"use client"

import { useEffect, useState } from "react"

/* ================= PAGE ================= */

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
        Tahap awal HR: input data inti karyawan sebelum lanjut ke kontrak,
        payroll, absensi, dan KPI.
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

function generateEmployeeID(divisi: string) {
  const company = "MPP"
  const year = new Date().getFullYear()
  const divCode = divisi.replace(/\s/g, "").toUpperCase()
  const random = Math.floor(100 + Math.random() * 900)
  return `${company}-${divCode}-${year}-${random}`
}

function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const [division, setDivision] = useState("")
  const [employeeID, setEmployeeID] = useState("")
  const [nikKTP, setNikKTP] = useState("")

  useEffect(() => {
    if (division) {
      setEmployeeID(generateEmployeeID(division))
    }
  }, [division])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">

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
        <form className="grid md:grid-cols-2 gap-4 text-sm">

  {/* ================= IDENTITAS ================= */}
  <input className="border rounded-lg p-2" placeholder="Nama Lengkap *" />

  <input
    type="text"
    maxLength={16}
    value={nikKTP}
    onChange={(e) => setNikKTP(e.target.value)}
    className="border rounded-lg p-2"
    placeholder="NIK KTP (16 digit) *"
  />

  <select className="border rounded-lg p-2">
    <option>Jenis Kelamin *</option>
    <option>Laki-laki</option>
    <option>Perempuan</option>
  </select>

  {/* TANGGAL LAHIR */}
  <div className="space-y-1">
    <label className="text-xs text-gray-500">
      Tanggal Lahir
    </label>
    <input
      type="date"
      className="border rounded-lg p-2 w-full"
    />
  </div>

  <input
    className="border rounded-lg p-2"
    placeholder="Tempat Lahir"
  />

  <select className="border rounded-lg p-2">
    <option>Status Pernikahan</option>
    <option>Belum Menikah</option>
    <option>Menikah</option>
    <option>Cerai</option>
  </select>

  {/* ================= KONTAK ================= */}
  <input
    className="border rounded-lg p-2 md:col-span-2"
    placeholder="Alamat Domisili"
  />
  <input className="border rounded-lg p-2" placeholder="Email" />
  <input className="border rounded-lg p-2" placeholder="No HP" />

  {/* ================= ORGANISASI ================= */}
  <select
    className="border rounded-lg p-2"
    value={division}
    onChange={(e) => setDivision(e.target.value)}
  >
    <option value="">Divisi *</option>
    <option value="Engineering">Engineering</option>
    <option value="HRGA">HR & GA</option>
    <option value="Finance">Finance</option>
    <option value="Project">Project</option>
  </select>

  <input
    className="border rounded-lg p-2 bg-gray-100"
    value={employeeID}
    disabled
    placeholder="Employee ID (Auto)"
  />

  <input className="border rounded-lg p-2" placeholder="Jabatan *" />

  <select className="border rounded-lg p-2">
    <option>Lokasi Kerja</option>
    <option>Head Office</option>
    <option>Site Project</option>
  </select>

  <input
    className="border rounded-lg p-2"
    placeholder="Atasan Langsung"
  />

  {/* ================= STATUS KERJA ================= */}
  <select className="border rounded-lg p-2">
    <option>Status Karyawan *</option>
    <option>Tetap</option>
    <option>Kontrak</option>
    <option>Probation</option>
  </select>

  {/* TANGGAL MASUK KERJA */}
  <div className="space-y-1">
    <label className="text-xs text-gray-500">
      Tanggal Masuk Kerja
    </label>
    <input
      type="date"
      className="border rounded-lg p-2 w-full"
    />
  </div>

  <select className="border rounded-lg p-2">
    <option>Tipe Karyawan</option>
    <option>HO</option>
    <option>Project</option>
    <option>Site</option>
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
              if (nikKTP.length !== 16 || !division) {
                alert("Lengkapi NIK KTP & Divisi")
                return
              }
              alert("Karyawan berhasil ditambahkan (dummy)")
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
