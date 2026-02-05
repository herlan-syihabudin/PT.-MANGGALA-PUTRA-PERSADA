import Link from "next/link"

const contractMenus = [
  {
    title: "Contract Management",
    desc: "PKWT, PKWTT, probation & masa berlaku",
    href: "/admin/hr/contract-evaluation/contract",
  },
  {
    title: "Contract Extension",
    desc: "Perpanjangan kontrak karyawan",
    href: "/admin/hr/contract-evaluation/extension",
  },
  {
    title: "Evaluation Period",
    desc: "Evaluasi berkala (bulanan / tahunan)",
    href: "/admin/hr/contract-evaluation/evaluation",
  },
  {
    title: "KPI & OKR",
    desc: "Target kerja & pencapaian",
    href: "/admin/hr/contract-evaluation/kpi",
  },
  {
    title: "Warning & SP",
    desc: "SP1, SP2, SP3 & catatan disiplin",
    href: "/admin/hr/contract-evaluation/warning",
  },
  {
    title: "Decision",
    desc: "Tetap, perpanjang, mutasi, atau exit",
    href: "/admin/hr/contract-evaluation/decision",
  },
  {
    title: "History",
    desc: "Riwayat kontrak & evaluasi",
    href: "/admin/hr/contract-evaluation/history",
  },
  {
    title: "Settings",
    desc: "Aturan kontrak & evaluasi",
    href: "/admin/hr/contract-evaluation/settings",
  },
]

export default function ContractEvaluationPage() {
  return (
    <section className="p-6 md:p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Contract & Evaluation
        </h1>
        <p className="text-gray-600 mt-1">
          Manajemen kontrak kerja & penilaian karyawan
        </p>
      </div>

      {/* FLOW */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Alur evaluasi:</strong>{" "}
        Employee → Contract → Evaluation → Decision → Extension / Exit
      </div>

      {/* MENU */}
      <div className="grid md:grid-cols-3 gap-6">
        {contractMenus.map((menu) => (
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
              Modul Contract & Evaluation
            </p>
          </Link>
        ))}
      </div>

    </section>
  )
}
