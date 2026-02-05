import Link from "next/link"

const gaMenus = [
  {
    title: "Asset Management",
    desc: "Inventaris aset kantor & penanggung jawab",
    href: "/admin/hr/general-affair/assets",
  },
  {
    title: "Asset Maintenance",
    desc: "Jadwal servis & riwayat perbaikan",
    href: "/admin/hr/general-affair/maintenance",
  },
  {
    title: "Facility Management",
    desc: "Ruang meeting, listrik, AC & fasilitas",
    href: "/admin/hr/general-affair/facility",
  },
  {
    title: "Procurement (GA)",
    desc: "Request ATK & kebutuhan kantor",
    href: "/admin/hr/general-affair/procurement",
  },
  {
    title: "Vendor & Supplier",
    desc: "Vendor ATK, maintenance & gedung",
    href: "/admin/hr/general-affair/vendors",
  },
  {
    title: "Document Control",
    desc: "Surat masuk/keluar & dokumen legal",
    href: "/admin/hr/general-affair/documents",
  },
  {
    title: "Fleet Management",
    desc: "Kendaraan operasional & BBM",
    href: "/admin/hr/general-affair/fleet",
  },
  {
    title: "GA Reports",
    desc: "Laporan aset & biaya GA",
    href: "/admin/hr/general-affair/reports",
  },
  {
    title: "GA Settings",
    desc: "Kategori aset & aturan GA",
    href: "/admin/hr/general-affair/settings",
  },
]

export default function GeneralAffairPage() {
  return (
    <section className="p-6 md:p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          General Affair
        </h1>
        <p className="text-gray-600 mt-1">
          Manajemen aset, fasilitas & operasional kantor
        </p>
      </div>

      {/* FLOW */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
        <strong>Alur GA:</strong>{" "}
        Asset → Maintenance → Facility → Procurement → Vendor → Report
      </div>

      {/* MENU GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {gaMenus.map((menu) => (
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
              Modul General Affair
            </p>
          </Link>
        ))}
      </div>

    </section>
  )
}
