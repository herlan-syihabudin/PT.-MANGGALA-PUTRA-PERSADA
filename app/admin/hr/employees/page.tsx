import Link from "next/link";

export const dynamic = "force-dynamic";

type HrModuleCard = {
  title: string;
  description: string;
  status: "ACTIVE" | "LOCKED" | "LINK";
  href: string;
  note?: string;
};

const hrModules: HrModuleCard[] = [
  {
    title: "Employee Master",
    description: "Data inti karyawan (identitas & kontak)",
    status: "ACTIVE",
    href: "/admin/hr/employees",
    note: "Modul Employee",
  },
  {
    title: "Employment Status",
    description: "Status kerja, tanggal masuk/keluar, lokasi",
    status: "ACTIVE",
    href: "/admin/hr/employment-status",
    note: "Modul Employee",
  },
  {
    title: "Organization & Position",
    description: "Divisi, jabatan, atasan langsung",
    status: "ACTIVE",
    href: "/admin/hr/organization",
    note: "Modul Employee",
  },
  {
    title: "Contract Management",
    description: "Kontrak PKWT / PKWTT & masa berlaku",
    status: "LOCKED",
    href: "/admin/hr/contract",
    note: "Lengkapi data organisasi terlebih dahulu",
  },
  {
    title: "Compensation & Payroll",
    description: "Gaji pokok, tunjangan, rekening",
    status: "LOCKED",
    href: "/admin/hr/payroll",
    note: "Payroll belum aktif (menunggu kontrak)",
  },
  {
    title: "BPJS & Tax",
    description: "BPJS Kesehatan, TK, NPWP",
    status: "LOCKED",
    href: "/admin/hr/bpjs-tax",
    note: "Aktif jika payroll sudah jalan",
  },
  {
    title: "Attendance",
    description: "Relasi absensi & lembur",
    status: "LINK",
    href: "/admin/hr/attendance",
    note: "Terkait dengan timesheet / absensi",
  },
  {
    title: "Performance",
    description: "KPI, OKR & penilaian",
    status: "LINK",
    href: "/admin/hr/performance",
    note: "Modul penilaian & review",
  },
  {
    title: "Employee Exit",
    description: "Resign, clearance & nonaktif",
    status: "ACTIVE",
    href: "/admin/hr/employee-exit",
    note: "Modul Employee",
  },
];

function StatusBadge({ status }: { status: HrModuleCard["status"] }) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        ACTIVE
      </span>
    );
  }

  if (status === "LOCKED") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
        LOCKED
      </span>
    );
  }

  // LINK
  return (
    <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
      LINK
    </span>
  );
}

export default function HrDashboardPage() {
  return (
    <section className="p-6 md:p-10 space-y-6">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Employee Module
        </h1>
        <p className="text-sm text-gray-500">
          Modul HR untuk mengelola data karyawan, status, organisasi, kontrak,
          payroll, dan exit.
        </p>
      </div>

      {/* ALUR UMUM */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs md:text-sm text-gray-600">
        <span className="font-medium text-gray-700">Alur umum:</span>{" "}
        <span className="font-semibold text-blue-700">Employee Master</span>{" "}
        <span className="text-gray-400">→</span>{" "}
        <span className="font-semibold text-blue-700">Status</span>{" "}
        <span className="text-gray-400">→</span>{" "}
        <span className="font-semibold text-blue-700">Organisasi</span>{" "}
        <span className="text-gray-400">→</span>{" "}
        <span className="font-semibold text-blue-700">Kontrak</span>{" "}
        <span className="text-gray-400">→</span>{" "}
        <span className="font-semibold text-blue-700">Payroll</span>{" "}
        <span className="text-gray-400">→</span>{" "}
        <span className="font-semibold text-blue-700">Exit</span>
      </div>

      {/* GRID MODULES */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hrModules.map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500/60 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  {mod.title}
                </h2>
                <p className="text-xs text-gray-500">{mod.description}</p>
              </div>
              <StatusBadge status={mod.status} />
            </div>

            {mod.note && (
              <p className="mt-auto text-[11px] text-gray-400">
                {mod.status === "LOCKED" && "⚠ "}
                {mod.note}
              </p>
            )}

            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600">
              <span>Masuk modul</span>
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}import Link from "next/link"

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
  href,
  lockedReason,
}: {
  title: string
  desc: string
  status: "ACTIVE" | "DRAFT" | "LOCKED" | "LINK"
  href?: string
  lockedReason?: string
}) {
  const isClickable = status === "ACTIVE" || status === "LINK"
  const Wrapper: any = isClickable && href ? Link : "div"

  return (
    <Wrapper
      href={isClickable && href ? href : ""}
      className={`relative bg-white border rounded-xl p-6 space-y-2 transition
        ${isClickable ? "hover:shadow cursor-pointer" : "opacity-60"}
      `}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {title}
        </h3>

        <span className={`text-xs font-semibold px-2 py-1 rounded
          ${
            status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : status === "DRAFT"
              ? "bg-yellow-100 text-yellow-700"
              : status === "LOCKED"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600"
          }`}>
          {status}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        {desc}
      </p>

      {status === "LOCKED" && lockedReason && (
        <p className="text-xs text-red-500">
          ⚠️ {lockedReason}
        </p>
      )}

      <p className="text-xs text-gray-400">
        Modul Employee
      </p>
    </Wrapper>
  )
}
