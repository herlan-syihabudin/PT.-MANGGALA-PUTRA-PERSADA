import KPICard from "@/components/dashboard/KPICard"

export default function HRGADashboardPage() {
  return (
    <section className="p-6 md:p-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          HR & General Affairs
        </h1>
        <p className="text-gray-600 mt-1">
          Ringkasan SDM dan operasional kantor
        </p>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-6">
        <KPICard title="Total Karyawan" value="32" note="Aktif" />
        <KPICard title="Hadir Hari Ini" value="28" note="4 izin / cuti" />
        <KPICard title="Aset Aktif" value="64" note="Inventaris" />
        <KPICard title="Kontrak Habis" value="3" note="30 hari ke depan" />
      </div>

      {/* HR SECTION */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Status Kepegawaian
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>✔ Karyawan Tetap: 18</li>
            <li>✔ Kontrak: 11</li>
            <li>✔ Probasi: 3</li>
          </ul>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Absensi Hari Ini
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>🕘 Tepat Waktu: 24</li>
            <li>⏰ Terlambat: 4</li>
            <li>❌ Alpha: 2</li>
          </ul>
        </div>
      </div>

      {/* GA SECTION */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Asset & Inventaris
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>💻 Laptop: 22 unit</li>
            <li>🚗 Kendaraan: 6 unit</li>
            <li>🛠 Maintenance Due: 2 aset</li>
          </ul>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Reminder Dokumen
          </h3>
          <ul className="text-sm text-red-600 space-y-2">
            <li>⚠ STNK kendaraan hampir habis</li>
            <li>⚠ Sewa gedung jatuh tempo</li>
          </ul>
        </div>
      </div>

      {/* QUICK ACTION */}
      <div className="bg-gray-50 border rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">
            + Tambah Karyawan
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">
            Absensi
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">
            Inventaris
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">
            Request ATK
          </button>
        </div>
      </div>

    </section>
  )
}
