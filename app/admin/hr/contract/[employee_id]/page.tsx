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

  const [form, setForm] = useState({
    project_code: "",
    lokasi_kerja: "",
    sistem_bayar: "BULANAN",
    rate: "",
    start_date: "",
    end_date: "",
    keterangan: "",
  })

  /* ================= LOAD EMPLOYEE MASTER ================= */
  useEffect(() => {
    loadEmployee()
  }, [])

  async function loadEmployee() {
    const res = await fetch(
      `/api/hr/employee?employee_id=${params.employee_id}`,
      { cache: "no-store" }
    )
    const json = await res.json()
    setEmployee(json.data)
    setLoading(false)
  }

  /* ================= SUBMIT CONTRACT ================= */
  async function submitContract() {
    if (!form.start_date || !form.rate) {
      alert("Tanggal mulai & rate wajib diisi")
      return
    }

    setSaving(true)

    await fetch("/api/hr/contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: employee?.employee_id,
        jenis_kontrak: employee?.type_karyawan,
        start_date: form.start_date,
        end_date: form.end_date,
        sistem_bayar: form.sistem_bayar,
        rate: form.rate,
        project_code: form.project_code,
        lokasi_kerja: form.lokasi_kerja,
        keterangan: form.keterangan,
      }),
    })

    setSaving(false)
    router.push("/admin/hr/contract")
  }

  if (loading) return <p className="p-6">Loading...</p>
  if (!employee) return <p className="p-6">Employee tidak ditemukan</p>

  return (
    <section className="p-6 max-w-3xl space-y-6">
      <h1 className="text-xl font-bold">Buat Kontrak</h1>

      {/* EMPLOYEE INFO */}
      <div className="bg-white border rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
        <Info label="Employee ID" value={employee.employee_id} />
        <Info label="Nama" value={employee.nama_lengkap} />
        <Info label="Tipe" value={employee.type_karyawan} />
        <Info label="Jabatan" value={employee.jabatan} />
      </div>

      {/* FORM */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <Input
          label="Project Code"
          value={form.project_code}
          onChange={(v) => setForm({ ...form, project_code: v })}
        />
        <Input
          label="Lokasi Kerja"
          value={form.lokasi_kerja}
          onChange={(v) => setForm({ ...form, lokasi_kerja: v })}
        />

        <Select
          label="Sistem Bayar"
          value={form.sistem_bayar}
          options={["BULANAN", "HARIAN", "BORONGAN"]}
          onChange={(v) => setForm({ ...form, sistem_bayar: v })}
        />

        <Input
          label="Rate / Gaji Pokok"
          type="number"
          value={form.rate}
          onChange={(v) => setForm({ ...form, rate: v })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tanggal Mulai"
            type="date"
            value={form.start_date}
            onChange={(v) => setForm({ ...form, start_date: v })}
          />
          <Input
            label="Tanggal Akhir (opsional)"
            type="date"
            value={form.end_date}
            onChange={(v) => setForm({ ...form, end_date: v })}
          />
        </div>

        <Textarea
          label="Keterangan"
          value={form.keterangan}
          onChange={(v) => setForm({ ...form, keterangan: v })}
        />
      </div>

      {/* ACTION */}
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
}: any) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  )
}

function Select({ label, value, options, onChange }: any) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
      >
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function Textarea({ label, value, onChange }: any) {
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
