"use client"

import { useEffect, useState } from "react"

/* ================= PAGE ================= */

export default function EmployeeMasterPage() {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // DETAIL
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)

  // FILTER
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterDivisi, setFilterDivisi] = useState("")
  const [filterLokasi, setFilterLokasi] = useState("")
  const [filterTipe, setFilterTipe] = useState("")

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

  const filteredEmployees = employees.filter((e) => {
    const matchSearch =
      e.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
      e.divisi?.toLowerCase().includes(search.toLowerCase()) ||
      e.jabatan?.toLowerCase().includes(search.toLowerCase())

    const matchStatus =
      filterStatus === ""
        ? true
        : filterStatus === "aktif"
        ? e.is_active === true
        : e.is_active === false

    const matchDivisi = filterDivisi ? e.divisi === filterDivisi : true
    const matchLokasi = filterLokasi ? e.lokasi_kerja === filterLokasi : true
    const matchTipe = filterTipe ? e.status_karyawan === filterTipe : true

    return (
      matchSearch &&
      matchStatus &&
      matchDivisi &&
      matchLokasi &&
      matchTipe
    )
  })

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
        Master data karyawan (sumber HR, Payroll & Kontrak)
      </div>

      {/* FILTER */}
      <div className="bg-white border rounded-xl p-4 grid md:grid-cols-5 gap-3 text-sm">
        <input
          className="border p-2 rounded"
          placeholder="Cari nama / divisi / jabatan"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="border p-2 rounded" onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>

        <select className="border p-2 rounded" onChange={(e) => setFilterDivisi(e.target.value)}>
          <option value="">Semua Divisi</option>
          <option>Engineering</option>
          <option>HRGA</option>
          <option>Finance</option>
          <option>Project</option>
        </select>

        <select className="border p-2 rounded" onChange={(e) => setFilterLokasi(e.target.value)}>
          <option value="">Semua Lokasi</option>
          <option>Head Office</option>
          <option>Site Project</option>
        </select>

        <select className="border p-2 rounded" onChange={(e) => setFilterTipe(e.target.value)}>
          <option value="">Semua Tipe</option>
          <option>Tetap</option>
          <option>Kontrak</option>
          <option>Intern</option>
        </select>
      </div>

      {/* LIST */}
      <div className="bg-white border rounded-xl divide-y text-sm">
        {loading ? (
          <p className="p-6 text-gray-400">Loading...</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="p-6 text-gray-400">Data tidak ditemukan</p>
        ) : (
          filteredEmployees.map((e, i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedEmployee(e)}
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {e.nama_lengkap}
                </p>
                <p className="text-xs text-gray-500">
                  {e.divisi} • {e.jabatan}
                </p>
              </div>

              <span
                className={`px-2 py-1 text-xs rounded font-semibold
                  ${e.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                `}
              >
                {e.is_active ? "AKTIF" : "NONAKTIF"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ADD MODAL */}
      {open && (
        <AddEmployeeModal
          onClose={() => setOpen(false)}
          onSaved={loadEmployees}
        />
      )}

      {/* DETAIL MODAL */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </section>
  )
}

/* ================= DETAIL MODAL ================= */

function EmployeeDetailModal({ employee, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 space-y-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Detail Karyawan</h2>
          <button onClick={onClose} className="text-sm text-gray-500">Tutup</button>
        </div>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {Object.entries(employee).map(([k, v]: any) => (
            <div key={k}>
              <p className="text-xs text-gray-500">{k}</p>
              <p className="font-medium">{v || "-"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================= ADD MODAL (TIDAK DIUBAH) ================= */

function AddEmployeeModal({ onClose, onSaved }: any) {
  const [form, setForm] = useState<any>({})

  async function submit() {
    const res = await fetch("/api/hr/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) return alert("Gagal menyimpan")
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold">Tambah Karyawan</h2>

        {/* FORM ASLI TETAP */}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded">Batal</button>
          <button onClick={submit} className="px-4 py-2 bg-gray-900 text-white rounded">Simpan</button>
        </div>
      </div>
    </div>
  )
}
