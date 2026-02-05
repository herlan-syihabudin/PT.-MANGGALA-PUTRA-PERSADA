"use client"

import { useEffect, useState } from "react"

/* ================= PAGE ================= */

export default function EmployeeMasterPage() {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ TAMBAHAN (DETAIL KARYAWAN)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)

  async function loadEmployees() {
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
        Input data inti karyawan (master HR)
      </div>

      {/* LIST */}
      <div className="bg-white border rounded-xl divide-y text-sm">
        {loading ? (
          <p className="p-6 text-gray-400">Loading...</p>
        ) : employees.length === 0 ? (
          <p className="p-6 text-gray-400">Belum ada data karyawan</p>
        ) : (
          employees.map((e, i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedEmployee(e)}
            >
              {/* LEFT */}
              <div>
                <p className="font-semibold text-gray-900">
                  {e.nama_lengkap}
                </p>
                <p className="text-xs text-gray-500">
                  {e.divisi} • {e.jabatan}
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">
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

                <button
                  className="text-blue-600 text-xs hover:underline"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    alert(`EDIT ${e.employee_id} (next step)`)
                  }}
                >
                  Edit
                </button>

                {e.is_active && (
                  <button
                    className="text-red-600 text-xs hover:underline"
                    onClick={(ev) => {
                      ev.stopPropagation()
                      alert(`NONAKTIF ${e.employee_id} (next step)`)
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
        <AddEmployeeModal
          onClose={() => setOpen(false)}
          onSaved={loadEmployees}
        />
      )}

      {/* MODAL DETAIL */}
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
          <Detail label="Nama Lengkap" value={employee.nama_lengkap} />
          <Detail label="NIK KTP" value={employee.nik_ktp} />
          <Detail label="Jenis Kelamin" value={employee.jenis_kelamin} />
          <Detail label="Tanggal Lahir" value={employee.tgl_lahir} />
          <Detail label="Tempat Lahir" value={employee.tempat_lahir} />
          <Detail label="Status Pernikahan" value={employee.status_pernikahan} />
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
      <p className="font-medium text-gray-900">
        {value || "-"}
      </p>
    </div>
  )
}

/* ================= ADD MODAL (TETAP) ================= */

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

  const employeeID = form.divisi
    ? generateEmployeeID(form.divisi)
    : ""

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

    if (!res.ok) {
      alert("Gagal menyimpan")
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 space-y-6">

        <h2 className="text-xl font-bold">Tambah Karyawan</h2>

        {/* FORM TIDAK DIUBAH */}
        {/* (form lu tetap sama persis) */}

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
