"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Employee = {
  employee_id: string
  nama_lengkap: string
  type_karyawan: string
  jabatan: string
}

export default function ContractDetail({
  params,
}: {
  params: { employee_id: string }
}) {
  const router = useRouter()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [lokasiKerja, setLokasiKerja] = useState("")

  const [form, setForm] = useState({
    project_code: "",
    lokasi_kerja: "",
    sistem_bayar: "BULANAN",
    rate: "",
    start_date: "",
    end_date: "",
    keterangan: "",
  })

  /* ======================================================
     LOAD EMPLOYEE (IDENTITAS)
  ====================================================== */
  useEffect(() => {
    loadEmployee()
    loadLokasiKerja()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadEmployee() {
    try {
      const res = await fetch("/api/hr/contract-management", {
        cache: "no-store",
      })

      if (!res.ok) {
        console.error("Failed load contract-management")
        setEmployee(null)
        return
      }

      const json = await res.json()
      const rows = (json.data || []) as any[]

      const row = rows.find(
        (r) => r.employee_id === params.employee_id
      )

      if (!row) {
        setEmployee(null)
      } else {
        setEmployee({
          employee_id: row.employee_id,
          nama_lengkap: row.nama,
          type_karyawan: row.type,
          jabatan: row.jabatan,
        })
      }
    } catch (err) {
      console.error("LOAD EMPLOYEE ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  /* ======================================================
     LOAD LOKASI KERJA (EMPLOYMENT STATUS AKTIF)
  ====================================================== */
  async function loadLokasiKerja() {
    try {
      const res = await fetch(
        `/api/hr/employment-status?employee_id=${params.employee_id}&active=1`,
        { cache: "no-store" }
      )

      if (!res.ok) {
        console.error("Failed load employment-status")
        return
      }

      const json = await res.json()

      const lokasi = json?.lokasi_kerja || ""

      setLokasiKerja(lokasi)
      setForm((prev) => ({
        ...prev,
        lokasi_kerja: lokasi,
      }))
    } catch (err) {
      console.error("LOAD LOKASI ERROR:", err)
    }
  }

  /* ======================================================
     SUBMIT CONTRACT
  ====================================================== */
  async function submitContract() {
    if (!employee) return

    if (!form.start_date || !form.rate) {
      alert("Tanggal mulai & rate wajib diisi")
      return
    }

    if (!form.project_code) {
      alert("Project Code wajib dipilih")
      return
    }

    if (!form.lokasi_kerja) {
      alert("Lokasi kerja tidak valid")
      return
    }

    setSaving(true)

    try {
      const res = await fetch("/api/hr/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employee.employee_id,
          jenis_kontrak: employee.type_karyawan,
          start_date: form.start_date,
          end_date: form.end_date,
          sistem_bayar: form.sistem_bayar,
          rate: form.rate,
          project_code: form.project_code,
          lokasi_kerja: form.lokasi_kerja,
          keterangan: form.keterangan,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("SAVE CONTRACT ERROR:", err)
        alert(err?.error || "Gagal menyimpan kontrak")
        return
      }

      router.push("/admin/hr/contract")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="p-6">Loading...</p>
  if (!employee)
    return <p className="p-6">Employee tidak ditemukan</p>

  return (
    <section className="p-6 max-w-3xl space-y-6">
      <h1 className="text-xl font-bold">Buat Kontrak</h1>

      {/* ================= EMPLOYEE INFO ================= */}
      <div className="bg-white border rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
        <Info label="Employee ID" value={employee.employee_id} />
        <Info label="Nama" value={employee.nama_lengkap} />
        <Info label="Tipe Karyawan" value={employee.type_karyawan} />
        <Info label="Jabatan" value={employee.jabatan} />
      </div>

      {/* ================= FORM ================= */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <Input
          label="Project Code"
          value={form.project_code}
          onChange={(v) =>
            setForm({ ...form, project_code: v })
          }
        />

        <Input
          label="Lokasi Kerja"
          value={lokasiKerja}
          onChange={() => {}}
          disabled
        />

        <Select
          label="Sistem Bayar"
          value={form.sistem_bayar}
          options={["BULANAN", "HARIAN", "BORONGAN"]}
          onChange={(v) =>
            setForm({ ...form, sistem_bayar: v })
          }
        />

        <Input
          label="Rate / Gaji Pokok"
          type="number"
          value={form.rate}
          onChange={(v) =>
            setForm({ ...form, rate: v })
          }
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tanggal Mulai"
            type="date"
            value={form.start_date}
            onChange={(v) =>
              setForm({ ...form, start_date: v })
            }
          />
          <Input
            label="Tanggal Akhir (opsional)"
            type="date"
            value={form.end_date}
            onChange={(v) =>
              setForm({ ...form, end_date: v })
            }
          />
        </div>

        <Textarea
          label="Keterangan"
          value={form.keterangan}
          onChange={(v) =>
            setForm({ ...form, keterangan: v })
          }
        />
      </div>

      {/* ================= ACTION ================= */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg"
        >
          Batal
        </button>
        <button
          onClick={submitContract}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          {saving ? "Menyimpan..." : "Simpan Kontrak"}
        </button>
      </div>
    </section>
  )
}

/* ================= SMALL COMPONENTS ================= */

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
      />
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        rows={3}
      />
    </div>
  )
}
