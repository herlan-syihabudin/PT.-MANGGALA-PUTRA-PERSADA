export default function EmployeePage() {
  return (
    <section className="p-6 md:p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Employee Module
        </h1>
        <p className="text-gray-600 mt-1">
          Pengelolaan siklus hidup karyawan (end-to-end)
        </p>
      </div>

      {/* FLOW INFO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800">
        Alur umum: <b>Daftar Karyawan → Status & Jabatan → Kontrak → Payroll → Absensi & KPI → Exit</b>
      </div>

      {/* SUB MODULE GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        <SubModule
          title="Employee Master"
          desc="Data inti karyawan (identitas & kontak)"
          status="ACTIVE"
        />

        <SubModule
          title="Employment Status"
          desc="Status kerja, tanggal masuk/keluar, lokasi"
          status="ACTIVE"
        />

        <SubModule
          title="Organization & Position"
          desc="Divisi, jabatan, atasan langsung"
          status="ACTIVE"
        />

        <SubModule
          title="Contract Management"
          desc="Kontrak PKWT/PKWTT & masa berlaku"
          status="ACTIVE"
        />

        <SubModule
          title="Compensation & Payroll Info"
          desc="Gaji pokok, tunjangan, rekening"
          status="ACTIVE"
        />

        <SubModule
          title="BPJS & Tax"
          desc="BPJS Kesehatan, TK, NPWP, status pajak"
          status="ACTIVE"
        />

        <SubModule
          title="Attendance (Link)"
          desc="Relasi ke absensi & lembur"
          status="LINK"
        />

        <SubModule
          title="Performance (Link)"
          desc="KPI, OKR & penilaian karyawan"
          status="LINK"
        />

        <SubModule
          title="Employee Exit"
          desc="Resign, clearance & penonaktifan"
          status="ACTIVE"
        />

      </div>

    </section>
  )
}

/* ===== SUB MODULE CARD ===== */

function SubModule({
  title,
  desc,
  status,
}: {
  title: string
  desc: string
  status: "ACTIVE" | "LINK"
}) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-2 hover:shadow transition">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {title}
        </h3>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded
            ${
              status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
        >
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        {desc}
      </p>
      <p className="text-xs text-gray-400">
        Modul Employee
      </p>
    </div>
  )
}
