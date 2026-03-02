"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import EmployeeForm from "@/components/dashboard/hr/EmployeeForm"
import { toast } from "sonner"

/* ================= TYPES ================= */

type Employee = {
  employee_id: string
  nama_lengkap: string
  nik_ktp?: string
  jenis_kelamin?: string
  tgl_lahir?: string
  tempat_lahir?: string
  status_pernikahan?: string
  alamat_domisili?: string
  email?: string
  no_hp?: string
  divisi?: string
  jabatan?: string
  atasan_langsung?: string
  lokasi_kerja?: string
  status_karyawan?: string
  tipe_karyawan?: string
  tgl_masuk?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
  [key: string]: any
}

type DashboardStats = {
  total: number
  aktif: number
  nonaktif: number
  tetap: number
  kontrak: number
  harian: number
}

type FilterStatus = "aktif" | "nonaktif" | "all"

/* ================= CONSTANTS ================= */

const DIVISI_OPTIONS = [
  "Engineering",
  "HRGA",
  "Finance",
  "Project",
  "Marketing",
  "Operations",
  "Procurement",
  "HSE",
]

const LOKASI_OPTIONS = ["Head Office", "Site Project", "Workshop", "Gudang"]

const TIPE_OPTIONS = ["Tetap", "Kontrak", "Harian", "Magang", "Outsource"]

/* ================= HELPER FUNCTIONS ================= */

// FIX 1: Safe array extraction from API response
function extractEmployeesFromResponse(data: any): Employee[] {
  if (!data) return []
  
  // Jika data adalah array langsung
  if (Array.isArray(data)) return data
  
  // Jika data adalah object dengan property data
  if (data.data && Array.isArray(data.data)) return data.data
  
  // Jika data adalah object dengan property employees
  if (data.employees && Array.isArray(data.employees)) return data.employees
  
  // Jika data adalah object dengan values array
  const possibleArrays = Object.values(data).filter(Array.isArray)
  if (possibleArrays.length > 0) return possibleArrays[0] as Employee[]
  
  // Log warning untuk debugging
  console.warn("Unexpected API response format:", data)
  return []
}

// FIX 2: Generate employee ID dengan format konsisten
function generateEmployeeID(divisi: string): string {
  const company = "MPP"
  const year = new Date().getFullYear()
  const divCode = divisi
    .replace(/\s/g, "")
    .toUpperCase()
    .substring(0, 3)
  const rand = Math.floor(100 + Math.random() * 900)
  return `${company}-${divCode}-${year}-${rand}`
}

// FIX 3: Format tanggal untuk display
function formatDate(date?: string): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/* ================= MAIN PAGE ================= */

export default function EmployeeMasterPage() {
  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null)

  // State Management
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // DETAIL & EDIT
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)

  // SEARCH & FILTER
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("aktif")
  const [divisiFilter, setDivisiFilter] = useState("")
  const [lokasiFilter, setLokasiFilter] = useState("")
  const [tipeFilter, setTipeFilter] = useState("")

  // DASHBOARD
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    aktif: 0,
    nonaktif: 0,
    tetap: 0,
    kontrak: 0,
    harian: 0,
  })

  // Export loading state
  const [exporting, setExporting] = useState(false)

  /* ========== LOAD DATA ========== */

  const loadEmployees = useCallback(async () => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/hr/employees", {
        cache: "no-store",
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      const employeeArray = extractEmployeesFromResponse(data)
      setEmployees(employeeArray)
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Request aborted")
        return
      }
      console.error("LOAD EMPLOYEES ERROR:", err)
      setError("Gagal memuat data karyawan")
      toast.error("Gagal memuat data karyawan")
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/hr/dashboard", {
        cache: "no-store",
      })
      if (!res.ok) return
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error("LOAD DASHBOARD ERROR:", err)
    }
  }, [])

  useEffect(() => {
    loadEmployees()
    loadDashboard()

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [loadEmployees, loadDashboard])

  /* ========== FILTER DATA ========== */

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase()

      const matchSearch =
        !search ||
        e.nama_lengkap?.toLowerCase().includes(q) ||
        e.divisi?.toLowerCase().includes(q) ||
        e.jabatan?.toLowerCase().includes(q) ||
        e.employee_id?.toLowerCase().includes(q)

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "aktif" && e.is_active === true) ||
        (statusFilter === "nonaktif" && e.is_active === false)

      const matchDivisi = !divisiFilter || e.divisi === divisiFilter
      const matchLokasi = !lokasiFilter || e.lokasi_kerja === lokasiFilter
      const matchTipe = !tipeFilter || e.tipe_karyawan === tipeFilter

      return matchSearch && matchStatus && matchDivisi && matchLokasi && matchTipe
    })
  }, [employees, search, statusFilter, divisiFilter, lokasiFilter, tipeFilter])

  // Unique values for filters
  const uniqueDivisi = useMemo(() => {
    const values = employees.map((e) => e.divisi).filter(Boolean) as string[]
    return [...new Set(values)]
  }, [employees])

  const uniqueLokasi = useMemo(() => {
    const values = employees.map((e) => e.lokasi_kerja).filter(Boolean) as string[]
    return [...new Set(values)]
  }, [employees])

  /* ========== EXPORT CSV ========== */

  const exportCSV = useCallback(async () => {
    const dataToExport =
      selectedIds.length > 0
        ? filteredEmployees.filter((e) => selectedIds.includes(e.employee_id))
        : filteredEmployees

    if (dataToExport.length === 0) {
      toast.error("Tidak ada data untuk diexport")
      return
    }

    setExporting(true)

    try {
      const headers = [
        "employee_id",
        "nama_lengkap",
        "nik_ktp",
        "divisi",
        "jabatan",
        "lokasi_kerja",
        "status_karyawan",
        "tipe_karyawan",
        "tgl_masuk",
        "is_active",
        "email",
        "no_hp",
      ]

      const rows = dataToExport.map((e) =>
        headers.map((h) => `"${(e as any)[h] ?? ""}"`).join(",")
      )

      const csvContent = [headers.join(","), ...rows].join("\n")

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download =
        selectedIds.length > 0
          ? `employees_selected_${Date.now()}.csv`
          : `employees_filtered_${Date.now()}.csv`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`${dataToExport.length} data berhasil diexport`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Gagal mengexport data")
    } finally {
      setExporting(false)
    }
  }, [filteredEmployees, selectedIds])

  /* ========== BULK ACTIONS ========== */

  const handleBulkNonaktif = useCallback(async () => {
    if (!confirm(`Nonaktifkan ${selectedIds.length} karyawan?`)) return

    try {
      const res = await fetch("/api/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_nonaktif",
          employee_ids: selectedIds,
        }),
      })

      if (!res.ok) throw new Error("Failed to deactivate")

      toast.success(`${selectedIds.length} karyawan dinonaktifkan`)
      setSelectedIds([])
      loadEmployees()
      loadDashboard()
    } catch (error) {
      console.error("Bulk nonaktif error:", error)
      toast.error("Gagal menonaktifkan karyawan")
    }
  }, [selectedIds, loadEmployees, loadDashboard])

  const handleBulkDelete = useCallback(async () => {
    const confirmText = prompt("Ketik DELETE untuk hapus permanen")
    if (confirmText !== "DELETE") return

    try {
      const res = await fetch("/api/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_delete",
          employee_ids: selectedIds,
        }),
      })

      if (!res.ok) throw new Error("Failed to delete")

      toast.success(`${selectedIds.length} karyawan dihapus`)
      setSelectedIds([])
      loadEmployees()
      loadDashboard()
    } catch (error) {
      console.error("Bulk delete error:", error)
      toast.error("Gagal menghapus karyawan")
    }
  }, [selectedIds, loadEmployees, loadDashboard])

  /* ========== SELECT ALL ========== */

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(filteredEmployees.map((e) => e.employee_id))
      } else {
        setSelectedIds([])
      }
    },
    [filteredEmployees]
  )

  const isAllSelected = useMemo(() => {
    return (
      filteredEmployees.length > 0 &&
      filteredEmployees.every((e) => selectedIds.includes(e.employee_id))
    )
  }, [filteredEmployees, selectedIds])

  /* ========== RENDER ========== */

  // Error State
  if (error) {
    return (
      <section className="p-6 md:p-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => {
              setError(null)
              loadEmployees()
            }}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </section>
    )
  }

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
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          + Tambah Karyawan
        </button>
      </div>

      {/* INFO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        Input data inti karyawan (master HR). Status aktif / mutasi /
        resign diatur di menu <b>Employment Status</b>.
      </div>

      {/* CARD SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setTipeFilter("")}
          className="border rounded-lg px-4 py-2 text-left hover:bg-gray-50 transition"
        >
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
          <p className="text-[11px] text-gray-400">
            Aktif: {stats.aktif} • Nonaktif: {stats.nonaktif}
          </p>
        </button>

        <button
          onClick={() => setTipeFilter("Tetap")}
          className="border rounded-lg px-4 py-2 text-left text-green-700 hover:bg-green-50 transition"
        >
          <p className="text-xs">Tetap</p>
          <p className="text-xl font-bold">{stats.tetap}</p>
        </button>

        <button
          onClick={() => setTipeFilter("Kontrak")}
          className="border rounded-lg px-4 py-2 text-left text-blue-700 hover:bg-blue-50 transition"
        >
          <p className="text-xs">Kontrak</p>
          <p className="text-xl font-bold">{stats.kontrak}</p>
        </button>

        <button
          onClick={() => setTipeFilter("Harian")}
          className="border rounded-lg px-4 py-2 text-left text-orange-700 hover:bg-orange-50 transition"
        >
          <p className="text-xs">Harian</p>
          <p className="text-xl font-bold">{stats.harian}</p>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap items-center gap-3">
        {/* SEARCH */}
        <input
          className="border p-2 rounded flex-1 min-w-[240px]"
          placeholder="Cari nama / divisi / jabatan / ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* STATUS */}
        <select
          className="border p-2 rounded w-28"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
        >
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
          <option value="all">Semua</option>
        </select>

        {/* DIVISI */}
        <select
          className="border p-2 rounded w-36"
          value={divisiFilter}
          onChange={(e) => setDivisiFilter(e.target.value)}
        >
          <option value="">Divisi</option>
          {uniqueDivisi.map((div) => (
            <option key={div} value={div}>
              {div}
            </option>
          ))}
        </select>

        {/* LOKASI */}
        <select
          className="border p-2 rounded w-36"
          value={lokasiFilter}
          onChange={(e) => setLokasiFilter(e.target.value)}
        >
          <option value="">Lokasi</option>
          {uniqueLokasi.map((lok) => (
            <option key={lok} value={lok}>
              {lok}
            </option>
          ))}
        </select>

        {/* TIPE */}
        <select
          className="border p-2 rounded w-32"
          value={tipeFilter}
          onChange={(e) => setTipeFilter(e.target.value)}
        >
          <option value="">Tipe</option>
          {TIPE_OPTIONS.map((tipe) => (
            <option key={tipe} value={tipe}>
              {tipe}
            </option>
          ))}
        </select>

        {/* EXPORT */}
        <button
          onClick={exportCSV}
          disabled={filteredEmployees.length === 0 || exporting}
          className="ml-auto px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting
            ? "Exporting..."
            : selectedIds.length > 0
            ? `Export (${selectedIds.length})`
            : "Export"}
        </button>
      </div>

      {/* BULK ACTION BAR */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            disabled={filteredEmployees.length === 0}
          />
          Pilih semua ({filteredEmployees.length})
        </label>

        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              onClick={handleBulkNonaktif}
            >
              Nonaktifkan ({selectedIds.length})
            </button>

            <button
              className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
              onClick={handleBulkDelete}
            >
              Hapus Permanen
            </button>
          </div>
        )}
      </div>

      {/* LIST */}
      <div className="bg-white border rounded-xl divide-y text-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Data tidak ditemukan
          </div>
        ) : (
          filteredEmployees.map((e) => (
            <div
              key={e.employee_id}
              className="grid grid-cols-[32px_1fr_auto] items-center gap-4 p-4 hover:bg-gray-50"
            >
              {/* CHECKBOX */}
              <input
                type="checkbox"
                checked={selectedIds.includes(e.employee_id)}
                onChange={(ev) => {
                  if (ev.target.checked) {
                    setSelectedIds([...selectedIds, e.employee_id])
                  } else {
                    setSelectedIds(selectedIds.filter((id) => id !== e.employee_id))
                  }
                }}
              />

              {/* INFO */}
              <div
                className="cursor-pointer"
                onClick={() => setSelectedEmployee(e)}
              >
                <p className="font-semibold text-gray-900">{e.nama_lengkap}</p>
                <p className="text-[11px] text-gray-400">ID: {e.employee_id}</p>
                <p className="text-xs text-gray-500">
                  {e.divisi} • {e.jabatan}
                </p>
              </div>

              {/* ACTION */}
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
                  onClick={() => setEditEmployee(e)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL ADD */}
      {open && (
        <AddEmployeeModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            loadEmployees()
            loadDashboard()
          }}
        />
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
          onSaved={() => {
            loadEmployees()
            loadDashboard()
          }}
        />
      )}
    </section>
  )
}

/* ================= DETAIL MODAL ================= */

function EmployeeDetailModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between sticky top-0 bg-white py-2">
          <h2 className="text-xl font-bold">Detail Karyawan</h2>
          <button onClick={onClose} className="text-sm text-gray-500 hover:underline">
            Tutup
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <Detail label="ID Karyawan" value={employee.employee_id} />
          <Detail label="Nama Lengkap" value={employee.nama_lengkap} />
          <Detail label="NIK KTP" value={employee.nik_ktp} />
          <Detail label="Jenis Kelamin" value={employee.jenis_kelamin} />
          <Detail label="Tanggal Lahir" value={formatDate(employee.tgl_lahir)} />
          <Detail label="Tempat Lahir" value={employee.tempat_lahir} />
          <Detail label="Status Pernikahan" value={employee.status_pernikahan} />
          <Detail label="Alamat Domisili" value={employee.alamat_domisili} />
          <Detail label="Email" value={employee.email} />
          <Detail label="No HP" value={employee.no_hp} />
          <Detail label="Divisi" value={employee.divisi} />
          <Detail label="Jabatan" value={employee.jabatan} />
          <Detail label="Atasan Langsung" value={employee.atasan_langsung} />
          <Detail label="Lokasi Kerja" value={employee.lokasi_kerja} />
          <Detail
            label="Status Karyawan"
            value={employee.is_active ? "Aktif" : employee.status_karyawan || "Nonaktif"}
          />
          <Detail label="Tipe Karyawan" value={employee.tipe_karyawan} />
          <Detail label="Tanggal Masuk" value={formatDate(employee.tgl_masuk)} />
          <Detail label="Tanggal Dibuat" value={formatDate(employee.created_at)} />
          <Detail label="Terakhir Update" value={formatDate(employee.updated_at)} />
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
  employee: Employee
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<any>({ ...employee })
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch("/api/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          employee_id: employee.employee_id,
          ...form,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Gagal update data")
      }

      await fetch("/api/hr/employment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employee.employee_id,
          status: form.status_karyawan || "Aktif",
          jenis_status: form.tipe_karyawan || "Tetap",
          lokasi_kerja: form.lokasi_kerja || "",
          start_date: form.tgl_masuk || new Date().toISOString().slice(0, 10),
          updated_by: "admin",
          keterangan: "Update data karyawan",
        }),
      })

      toast.success("Data karyawan berhasil diperbarui")
      onSaved()
      onClose()
    } catch (error: any) {
      console.error("Update error:", error)
      toast.error(error.message || "Gagal update data")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold sticky top-0 bg-white py-2">Edit Data Karyawan</h2>

        <EmployeeForm mode="edit" form={form} setForm={setForm} employeeID={form.employee_id} />

        <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= MODAL TAMBAH ================= */

function AddEmployeeModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
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
    tipe_karyawan: "",
    tgl_masuk: new Date().toISOString().slice(0, 10),
  })
  const [submitting, setSubmitting] = useState(false)

  const employeeID = form.divisi ? generateEmployeeID(form.divisi) : ""

  async function submit() {
    // Validasi
    if (!form.nama_lengkap?.trim()) {
      toast.error("Nama lengkap wajib diisi")
      return
    }

    if (!form.divisi) {
      toast.error("Divisi wajib dipilih")
      return
    }

    if (form.nik_ktp && form.nik_ktp.length !== 16) {
      toast.error("NIK harus 16 digit")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          employee_id: employeeID,
          status_karyawan: "Aktif",
          is_active: true,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan")
      }

      await fetch("/api/hr/employment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeID,
          status: "Aktif",
          jenis_status: form.tipe_karyawan || "Tetap",
          lokasi_kerja: form.lokasi_kerja || "",
          start_date: form.tgl_masuk || new Date().toISOString().slice(0, 10),
          updated_by: "admin",
          keterangan: "Karyawan baru",
        }),
      })

      toast.success("Karyawan berhasil ditambahkan")
      onSaved()
      onClose()
    } catch (error: any) {
      console.error("Add error:", error)
      toast.error(error.message || "Gagal menambah karyawan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold sticky top-0 bg-white py-2">Tambah Karyawan</h2>

        <EmployeeForm mode="add" form={form} setForm={setForm} employeeID={employeeID} />

        <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  )
}
