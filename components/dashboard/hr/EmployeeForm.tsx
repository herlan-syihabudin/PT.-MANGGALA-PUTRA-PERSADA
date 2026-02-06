"use client"

export default function EmployeeForm({
  form,
  setForm,
  employeeID,
  mode,
}: {
  form: any
  setForm: (v: any) => void
  employeeID: string
  mode: "add" | "edit"
}) {
  return (
    <div className="grid md:grid-cols-2 gap-3 text-sm">

      {/* EMPLOYEE ID */}
      <input
        className="border p-2 bg-gray-100"
        value={employeeID}
        disabled
      />

      <input
        className="border p-2"
        placeholder="Nama Lengkap *"
        value={form.nama_lengkap || ""}
        onChange={(e) =>
          setForm({ ...form, nama_lengkap: e.target.value })
        }
      />

      <input
        className="border p-2"
        placeholder="NIK KTP (16 digit) *"
        maxLength={16}
        value={form.nik_ktp || ""}
        onChange={(e) =>
          setForm({ ...form, nik_ktp: e.target.value })
        }
      />

      <select
        className="border p-2"
        value={form.jenis_kelamin || ""}
        onChange={(e) =>
          setForm({ ...form, jenis_kelamin: e.target.value })
        }
      >
        <option value="">Jenis Kelamin</option>
        <option value="Laki-laki">Laki-laki</option>
        <option value="Perempuan">Perempuan</option>
      </select>

      <input
        type="date"
        className="border p-2"
        value={form.tgl_lahir || ""}
        onChange={(e) =>
          setForm({ ...form, tgl_lahir: e.target.value })
        }
      />

      <input
        className="border p-2"
        placeholder="Tempat Lahir"
        value={form.tempat_lahir || ""}
        onChange={(e) =>
          setForm({ ...form, tempat_lahir: e.target.value })
        }
      />

      <input
        className="border p-2 md:col-span-2"
        placeholder="Alamat Domisili"
        value={form.alamat_domisili || ""}
        onChange={(e) =>
          setForm({ ...form, alamat_domisili: e.target.value })
        }
      />

      <input
        className="border p-2"
        placeholder="Email"
        value={form.email || ""}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        className="border p-2"
        placeholder="No HP"
        value={form.no_hp || ""}
        onChange={(e) =>
          setForm({ ...form, no_hp: e.target.value })
        }
      />

      <select
        className="border p-2"
        value={form.divisi || ""}
        onChange={(e) =>
          setForm({ ...form, divisi: e.target.value })
        }
        disabled={mode === "edit"}
      >
        <option value="">Divisi *</option>
        <option value="Engineering">Engineering</option>
        <option value="HRGA">HRGA</option>
        <option value="Finance">Finance</option>
        <option value="Project">Project</option>
      </select>

      <input
        className="border p-2"
        placeholder="Jabatan"
        value={form.jabatan || ""}
        onChange={(e) =>
          setForm({ ...form, jabatan: e.target.value })
        }
      />

      <input
        className="border p-2"
        placeholder="Atasan Langsung"
        value={form.atasan_langsung || ""}
        onChange={(e) =>
          setForm({ ...form, atasan_langsung: e.target.value })
        }
      />

      <select
        className="border p-2"
        value={form.lokasi_kerja || ""}
        onChange={(e) =>
          setForm({ ...form, lokasi_kerja: e.target.value })
        }
      >
        <option value="">Lokasi Kerja</option>
        <option value="Head Office">Head Office</option>
        <option value="Site Project">Site Project</option>
      </select>

      {/* STATUS KARYAWAN (LOGIC HR) */}
      <select
        className="border p-2"
        value={form.status_karyawan || "Aktif"}
        onChange={(e) =>
          setForm({
            ...form,
            status_karyawan: e.target.value,
            is_active: e.target.value === "Aktif",
          })
        }
      >
        <option value="Aktif">Aktif</option>
        <option value="Nonaktif">Nonaktif</option>
        <option value="Resign">Resign</option>
      </select>

      {/* TIPE KARYAWAN (DASHBOARD COUNT) */}
      <select
        className="border p-2"
        value={form.tipe_karyawan || ""}
        onChange={(e) =>
          setForm({ ...form, tipe_karyawan: e.target.value })
        }
      >
        <option value="">Tipe Karyawan *</option>
        <option value="Tetap">Tetap</option>
        <option value="Kontrak">Kontrak</option>
        <option value="Harian">Harian</option>
      </select>

      <input
        type="date"
        className="border p-2"
        value={form.tgl_masuk || ""}
        onChange={(e) =>
          setForm({ ...form, tgl_masuk: e.target.value })
        }
      />
    </div>
  )
}
