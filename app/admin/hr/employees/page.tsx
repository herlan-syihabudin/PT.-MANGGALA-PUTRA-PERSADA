import Link from "next/link"

/* ================= MOCK STATUS (NANTI DIGANTI API) ================= */

const HR_STATUS = {
  master: true,
  employment: true,
  organization: true,
  contract: false,
  payroll: false,
  bpjs: false,
  attendance: true,
  performance: true,
  exit: true,
}

/* ================= PAGE ================= */

export default function EmployeePage() {
  const totalModules = 6
  const completedModules = [
    HR_STATUS.master,
    HR_STATUS.employment,
    HR_STATUS.organization,
    HR_STATUS.contract,
    HR_STATUS.payroll,
    HR_STATUS.bpjs,
  ].filter(Boolean).length

  const progress = Math.round((completedModules / totalModules) * 100)

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

      {/* PROGRESS */}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <div className="flex justify-between text-sm font-semibold">
          <span>Employee Lifecycle Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          Progress berdasarkan kesiapan modul HR utama
        </p>
      </div>

      {/* FLOW INFO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800">
        Alur umum: <b>Employee Master → Status → Organisasi → Kontrak → Payroll → Exit</b>
      </div>

      {/* MODULE GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        <SubModule
          title="Employee Master"
          desc="Data inti karyawan (identitas & kontak)"
          status={HR_STATUS.master ? "ACTIVE" : "DRAFT"}
          href="/admin/hr/employees/master"
        />

        <SubModule
  title="Employment Status"
  desc="Status kerja, tanggal masuk/keluar, lokasi"
  status={HR_STATUS.employment ? "ACTIVE" : "DRAFT"}
  href="/admin/hr/employment-status"
/>

        <SubModule
          title="Organization & Position"
          desc="Divisi, jabatan, atasan langsung"
          status={HR_STATUS.organization ? "ACTIVE" : "DRAFT"}
        />

        <SubModule
          title="Contract Management"
          desc="Kontrak PKWT / PKWTT & masa berlaku"
          status={HR_STATUS.contract ? "ACTIVE" : "LOCKED"}
          lockedReason="Lengkapi data organisasi terlebih dahulu"
        />

        <SubModule
          title="Compensation & Payroll"
          desc="Gaji pokok, tunjangan, rekening"
          status={HR_STATUS.payroll ? "ACTIVE" : "LOCKED"}
          lockedReason="Kontrak belum lengkap"
        />

        <SubModule
          title="BPJS & Tax"
          desc="BPJS Kesehatan, TK, NPWP"
          status={HR_STATUS.bpjs ? "ACTIVE" : "LOCKED"}
          lockedReason="Payroll belum aktif"
        />

        <SubModule
          title="Attendance"
          desc="Relasi absensi & lembur"
          status="LINK"
        />

        <SubModule
          title="Performance"
          desc="KPI, OKR & penilaian"
          status="LINK"
        />

        <SubModule
          title="Employee Exit"
          desc="Resign, clearance & nonaktif"
          status="ACTIVE"
        />

      </div>

    </section>
  )
}

/* ================= SUB MODULE ================= */

function SubModule({
  title,
  desc,
  status,
  href = "#",
  lockedReason,
}: {
  title: string
  desc: string
  status: "ACTIVE" | "DRAFT" | "LOCKED" | "LINK"
  href?: string
  lockedReason?: string
}) {
  return (
    <Link
      href={href}
      className="relative bg-white border rounded-xl p-6 space-y-2 transition hover:shadow hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {title}
        </h3>

        <span
          className={`text-xs font-semibold px-2 py-1 rounded
            ${
              status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : status === "DRAFT"
                ? "bg-yellow-100 text-yellow-700"
                : status === "LOCKED"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
        >
          {status}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        {desc}
      </p>

      {lockedReason && (
        <p className="text-xs text-red-500">
          ⚠️ {lockedReason}
        </p>
      )}

      <p className="text-xs text-gray-400">
        Modul Employee
      </p>
    </Link>
  )
}
