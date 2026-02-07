"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Employee = {
  employee_id: string
  nama_lengkap: string
}

export default function OrganizationDetailPage({
  params,
}: {
  params: { employee_id: string }
}) {
  const router = useRouter()
  const employeeId = params.employee_id

  const [employees, setEmployees] = useState<Employee[]>([])
  const [employee, setEmployee] = useState<any>(null)
  const [form, setForm] = useState({
    divisi: "",
    jabatan: "",
    atasan_id: "",
  })
  const [saving, setSaving] = useState(false)

  /* ===== LOAD EMPLOYEE MASTER (UNTUK DROPDOWN ATASAN) ===== */
  useEffect(() => {
    fetch("/api/hr/employee-master", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setEmployees(d.data || []))
  }, [])

  /* ===== LOAD DETAIL ORGANIZATION (AUTO FILL) ===== */
  useEffect(() => {
    fetch(`/api/hr/organization/${employeeId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        setEmployee(d.employee)
        setForm({
          divisi: d.employee.divisi || "",
          jabatan: d.employee.jabatan || "",
          atasan_id: d.employee.atasan_id || "",
        })
      })
  }, [employeeId])

  /* ===== SUBMIT ===== */
  async function handleSave() {
    if (!form.divisi || !form.jabatan) {
      alert("Divisi dan jabatan wajib diisi")
      return
    }

    const atasan = employees.find(
      (e) => e.employee_id === form.atasan_id
    )

    setSaving(true)

    const res = await fetch("/api/hr/organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: employeeId,
        nama_lengkap: employee?.nama_lengkap || "",
        divisi: form.divisi,
        jabatan: form.jabatan,
        atasan_id: atasan?.employee_id || "",
        atasan_nama: atasan?.nama_lengkap || "",
        updated_by: "Admin ERP",
      }),
    })

    setSaving(false)

    if (!res.ok) {
      alert("Gagal menyimpan organisasi")
      return
    }

    alert("Struktur organisasi berhasil disimpan")
    router.push("/admin/hr/organization")
  }

  return (
    <section className="p-6 max-w-2xl space-y-6">
      <button
        onClick={() => router.back()}
        className="text-xs text-gray-500 hover:text-gray-800"
      >
        ← Kembali
      </button>

      <div>
        <h1 className="text-2xl font-bold">Atur Organisasi</h1>

        {employee && (
          <div className="mt-1">
            <div className="font-semibold">
              {employee.nama_lengkap}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {employee.employee_id}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        {/* DIVISI */}
        <div>
          <label className="text-xs font-medium text-gray-700">
            Divisi
          </label>
          <input
            value={form.divisi}
            onChange={(e) =>
              setForm({ ...form, divisi: e.target.value })
            }
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        {/* JABATAN */}
        <div>
          <label className="text-xs font-medium text-gray-700">
            Jabatan
          </label>
          <input
            value={form.jabatan}
            onChange={(e) =>
              setForm({ ...form, jabatan: e.target.value })
            }
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        {/* ATASAN */}
        <div>
          <label className="text-xs font-medium text-gray-700">
            Atasan Langsung
          </label>
          <select
            value={form.atasan_id}
            onChange={(e) =>
              setForm({ ...form, atasan_id: e.target.value })
            }
            className="w-full mt-1 rounded-lg border px-3 py-2 text-sm bg-white"
          >
            <option value="">— Tidak ada / Top Level —</option>
            {employees
              .filter(e => e.employee_id !== employeeId)
              .map(e => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.nama_lengkap}
                </option>
              ))}
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-2 border-t">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Organisasi"}
          </button>
        </div>
      </div>
    </section>
  )
}
