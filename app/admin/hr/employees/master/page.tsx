"use client"

import { useEffect, useState } from "react"
import EmployeeForm from "@/components/dashboard/hr/EmployeeForm"

/* ================= PAGE ================= */

export default function EmployeeMasterPage() {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ DETAIL & EDIT
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [editEmployee, setEditEmployee] = useState<any | null>(null)

  // ✅ SEARCH & FILTER
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("aktif")
  const [divisiFilter, setDivisiFilter] = useState("")
  const [lokasiFilter, setLokasiFilter] = useState("")
  const [tipeFilter, setTipeFilter] = useState("")

  async function loadEmployees() {
    const res = await fetch("/api/hr/employees", { cache: "no-store" })
    const data = await res.json()
    setEmployees(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  // ✅ LOGIC FILTER (data asli tidak diubah)
  const filteredEmployees = employees.filter((e) => {
    const q = search.toLowerCase()

    const matchSearch =
      !search ||
      e.nama_lengkap?.toLowerCase().includes(q) ||
      e.divisi?.toLowerCase().includes(q) ||
      e.jabatan?.toLowerCase().includes(q)

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "aktif" && e.is_active) ||
      (statusFilter === "nonaktif" && !e.is_active)

    const matchDivisi = !divisiFilter || e.divisi === divisiFilter
    const matchLokasi = !lokasiFilter || e.lokasi_kerja === lokasiFilter
    const matchTipe = !tipeFilter || e.tipe_karyawan === tipeFilter

    return matchSearch && matchStatus && matchDivisi && matchLokasi && matchTipe
  })

  const total = filteredEmployees.length
const totalTetap = filteredEmployees.filter(
  (e) => e.tipe_karyawan === "Tetap"
).length

const totalKontrak = filteredEmployees.filter(
  (e) => e.tipe_karyawan === "Kontrak"
).length

const totalHarian = filteredEmployees.filter(
  (e) => e.tipe_karyawan === "Harian"
).length
  
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
        Input data inti karyawan (master HR)
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 text-sm">
        <div className="bg-white border rounded-xl px-4 py-3 text-sm flex flex-wrap gap-4">
  <span className="font-semibold text-gray-700">
    Total: {total}
  </span>

  <span className="text-green-700">
    Tetap: {totalTetap}
  </span>

  <span className="text-blue-700">
    Kontrak: {totalKontrak}
  </span>

  <span className="text-orange-700">
    Harian: {totalHarian}
  </span>
</div>
        <input
          className="border p-2 rounded w-64"
          placeholder="Cari nama / divisi / jabatan"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
          <option value="all">Semua Status</option>
        </select>

        <select
          className="border p-2 rounded"
          value={divisiFilter}
          onChange={(e) => setDivisiFilter(e.target.value)}
        >
          <option value="">Semua Divisi</option>
          <option>Engineering</option>
          <option>HRGA</option>
          <option>Finance</option>
          <option>Project</option>
        </select>

        <select
          className="border p-2 rounded"
          value={lokasiFilter}
          onChange={(e) => setLokasiFilter(e.target.value)}
        >
          <option value="">Semua Lokasi</option>
          <option>Head Office</option>
          <option>Site Project</option>
        </select>

        <select
          className="border p-2 rounded"
          value={tipeFilter}
          onChange={(e) => setTipeFilter(e.target.value)}
        >
          <option value="">Semua Tipe</option>
          <option>Tetap</option>
          <option>Kontrak</option>
          <option>Probation</option>
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
              {/* LEFT INFO */}
              <div>
                <p className="font-semibold text-gray-900">{e.nama_lengkap}</p>
                <p className="text-[11px] text-gray-400">
                  ID: {e.employee_id || "-"}
                </p>
                <p className="text-xs text-gray-500">
                  {e.divisi} • {e.jabatan}
                </p>
              </div>

              {/* RIGHT ACTION */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 text-xs rounded font-semibold ${
                    e.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {e.is_active ? "AKTIF" : "NONAKTIF"}
                </span>

                <button
                  className="text-blue-600 text-xs hover:underline"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    setEditEmployee(e)
                  }}
                >
                  Edit
                </button>

                {e.is_active && (
                  <button
                    className="text-red-600 text-xs hover:underline"
                    onClick={async (ev) => {
                      ev.stopPropagation()
                      if (!confirm(`Nonaktifkan ${e.nama_lengkap}?`)) return

                      const res = await fetch("/api/hr/employees", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "nonaktif",
                          employee_id: e.employee_id,
                        }),
                      })

                      if (!res.ok) {
                        alert("Gagal menonaktifkan karyawan")
                        return
                      }

                      alert("Karyawan berhasil dinonaktifkan")
                      loadEmployees()
                    }}
                  >
                    Nonaktif
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL ADD */}
      {open && (
        <AddEmployeeModal onClose={() => setOpen(false)} onSaved={loadEmployees} />
      )}

      {/* MODAL DETAIL */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {/* MODAL EDIT */}
      {editEmployee && (
        <EditEmployeeModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onSaved={loadEmployees}
        />
      )}
    </section>
  )
}

/* ================= DETAIL MODAL ================= */

function EmployeeDetailModal({
  employee,
  onClose,
}: {
  employee: any
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Detail Karyawan</h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:underline"
          >
            Tutup
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <Detail label="ID Karyawan" value={employee.employee_id} />
          <Detail label="Nama Lengkap" value={employee.nama_lengkap} />
          <Detail label="NIK KTP" value={employee.nik_ktp} />
          <Detail label="Jenis Kelamin" value={employee.jenis_kelamin} />
          <Detail label="Tanggal Lahir" value={employee.tgl_lahir} />
          <Detail label="Tempat Lahir" value={employee.tempat_lahir} />
          <Detail label="Status Pernikahan" value={employee.status_pernikahan} />
          <Detail label="Alamat Domisili" value={employee.alamat_domisili} />
          <Detail label="Email" value={employee.email} />
          <Detail label="No HP" value={employee.no_hp} />
          <Detail label="Divisi" value={employee.divisi} />
          <Detail label="Jabatan" value={employee.jabatan} />
          <Detail label="Atasan Langsung" value={employee.atasan_langsung} />
          <Detail label="Lokasi Kerja" value={employee.lokasi_kerja} />
          <Detail label="Status Karyawan" value={employee.status_karyawan} />
          <Detail label="Tipe Karyawan" value={employee.tipe_karyawan} />
          <Detail label="Tanggal Masuk" value={employee.tgl_masuk} />
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || "-"}</p>
    </div>
  )
}

/* ================= MODAL EDIT ================= */

function EditEmployeeModal({
  employee,
  onClose,
  onSaved,
}: {
  employee: any
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<any>({ ...employee })

  async function submit() {
    const res = await fetch("/api/hr/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        employee_id: employee.employee_id, // ❗ ID DIKUNCI
        ...form,
      }),
    })

    if (!res.ok) {
      alert("Gagal update data")
      return
    }

    alert("Data karyawan berhasil diperbarui")
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-bold">Edit Data Karyawan</h2>

        <EmployeeForm
          mode="edit"
          form={form}
          setForm={setForm}
          employeeID={form.employee_id}
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Batal
          </button>
          <button onClick={submit} className="px-4 py-2 bg-gray-900 text-white rounded">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= MODAL TAMBAH ================= */

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
  const [form, setForm] = useState<any>({
    nama_lengkap: "",
    nik_ktp: "",
    jenis_kelamin: "",
    tgl_lahir: "",
    tempat_lahir: "",
    status_pernikahan: "",
    alamat_domisili: "",
    email: "",
    no_hp: "",
    divisi: "",
    jabatan: "",
    atasan_langsung: "",
    lokasi_kerja: "",
    status_karyawan: "",
    tipe_karyawan: "",
    tgl_masuk: "",
  })

  const employeeID = form.divisi ? generateEmployeeID(form.divisi) : ""

  async function submit() {
    if (form.nik_ktp.length !== 16 || !form.divisi || !form.nama_lengkap) {
      alert("Lengkapi Nama, NIK (16 digit), dan Divisi")
      return
    }

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
      return
    }

    alert("Karyawan berhasil ditambahkan")
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-bold">Tambah Karyawan</h2>

        {/* 🔥 FORM SATU PINTU */}
        <EmployeeForm mode="add" form={form} setForm={setForm} employeeID={employeeID} />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Batal
          </button>
          <button onClick={submit} className="px-4 py-2 bg-gray-900 text-white rounded">
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}
