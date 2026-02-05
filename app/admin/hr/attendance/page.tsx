import Link from "next/link"

const attendanceMenus = [
  {
    title: "Daily Attendance",
    desc: "Kehadiran karyawan hari ini",
    href: "/admin/hr/attendance/daily",
    status: "ACTIVE",
  },
  {
    title: "Clock In / Clock Out",
    desc: "Absen masuk & pulang karyawan",
    href: "/admin/hr/attendance/clock",
    status: "ACTIVE",
  },
  {
    title: "Overtime",
    desc: "Pengajuan & approval lembur",
    href: "/admin/hr/attendance/overtime",
    status: "ACTIVE",
  },
  {
    title: "Leave & Permission",
    desc: "Cuti, sakit, izin",
    href: "/admin/hr/attendance/leave",
    status: "ACTIVE",
  },
  {
    title: "Shift Management",
    desc: "Pengaturan jam & pola kerja",
    href: "/admin/hr/attendance/shift",
    status: "ACTIVE",
  },
  {
    title: "Attendance Recap",
    desc: "Rekap absensi bulanan",
    href: "/admin/hr/attendance/recap",
    status: "ACTIVE",
  },
  {
    title: "Attendance Settings",
    desc: "Aturan jam kerja & kebijakan",
    href: "/admin/hr/attendance/settings",
    status: "ACTIVE",
  },
]

export default function AttendancePage() {
  return (
    <section className="p-6 md:p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Attendance
        </h1>
        <p className="text-gray-600 mt-1">
          Manajemen kehadiran, absensi, lembur, dan cuti karyawan
        </p>
      </div>

      {/* FLOW INFO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Alur umum:</strong>{" "}
        Clock In → Daily Attendance → Leave / Overtime → Recap → Payroll
      </div>

      {/* MENU GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {attendanceMenus.map((menu) => (
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
                {menu.status}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              {menu.desc}
            </p>

            <p className="mt-4 text-xs text-gray-400">
              Modul Attendance
            </p>
          </Link>
        ))}
      </div>

    </section>
  )
}
