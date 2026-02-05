import Link from "next/link"

const payrollMenus = [
  {
    title: "Salary Structure",
    desc: "Gaji pokok berdasarkan jabatan & level",
    href: "/admin/hr/payroll/salary",
  },
  {
    title: "Allowance",
    desc: "Tunjangan tetap & tidak tetap",
    href: "/admin/hr/payroll/allowance",
  },
  {
    title: "Deduction",
    desc: "Potongan absensi, denda, pinjaman",
    href: "/admin/hr/payroll/deduction",
  },
  {
    title: "BPJS & Tax",
    desc: "BPJS Kesehatan, TK & PPh 21",
    href: "/admin/hr/payroll/bpjs-tax",
  },
  {
    title: "Payroll Process",
    desc: "Proses penggajian bulanan",
    href: "/admin/hr/payroll/process",
  },
  {
    title: "Payslip",
    desc: "Slip gaji digital (PDF)",
    href: "/admin/hr/payroll/slip",
  },
  {
    title: "Payroll Recap",
    desc: "Rekap gaji bulanan & tahunan",
    href: "/admin/hr/payroll/recap",
  },
  {
    title: "Payroll Settings",
    desc: "Aturan & konfigurasi payroll",
    href: "/admin/hr/payroll/settings",
  },
]

export default function PayrollPage() {
  return (
    <section className="p-6 md:p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Payroll
        </h1>
        <p className="text-gray-600 mt-1">
          Sistem penggajian, pajak, dan slip gaji karyawan
        </p>
      </div>

      {/* FLOW */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
        <strong>Alur payroll:</strong>{" "}
        Attendance → Overtime → Allowance & Deduction → BPJS & Tax → Payroll → Payslip
      </div>

      {/* MENU */}
      <div className="grid md:grid-cols-3 gap-6">
        {payrollMenus.map((menu) => (
          <Link
            key={menu.title}
            href={menu.href}
            className="bg-white border rounded-2xl p-6 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-900">
                {menu.title}
              </h3>
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">
                ACTIVE
              </span>
            </div>

            <p className="text-sm text-gray-600">
              {menu.desc}
            </p>

            <p className="mt-4 text-xs text-gray-400">
              Modul Payroll
            </p>
          </Link>
        ))}
      </div>

    </section>
  )
}
