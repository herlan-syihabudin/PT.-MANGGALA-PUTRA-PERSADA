// app/admin/hr/page.tsx

export default async function HRDashboardPage() {
  // DUMMY DATA HR
  const data = {
    totalEmployee: 32,
    hadirHariIni: 28,
    cutiIzin: 4,
    kontrakHabis: 3,

    statusPegawai: {
      tetap: 18,
      kontrak: 11,
      probasi: 3,
    },

    absensi: {
      tepatWaktu: 24,
      terlambat: 4,
      alpha: 2,
      lembur: 5,
    },

    reminder: [
      "3 kontrak karyawan akan habis bulan ini",
      "2 pengajuan cuti menunggu approval",
      "5 KPI karyawan belum direview",
    ],
  }

  return (
    <section className="p-6 md:p-10 space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Human Resources
        </h1>
        <p className="text-gray-600 mt-1">
          Dashboard pengelolaan SDM
        </p>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-6">
        <Kpi title="Total Karyawan" value={data.totalEmployee} />
        <Kpi title="Hadir Hari Ini" value={data.hadirHariIni} />
        <Kpi title="Cuti / Izin" value={data.cutiIzin} />
        <Kpi
          title="Kontrak Habis"
          value={data.kontrakHabis}
          highlight
        />
      </div>

      {/* STATUS & ABSENSI */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Status Kepegawaian">
          <Item label="Tetap" value={data.statusPegawai.tetap} />
          <Item label="Kontrak" value={data.statusPegawai.kontrak} />
          <Item label="Probasi" value={data.statusPegawai.probasi} />
        </Card>

        <Card title="Absensi Hari Ini">
          <Item label="Tepat Waktu" value={data.absensi.tepatWaktu} />
          <Item label="Terlambat" value={data.absensi.terlambat} />
          <Item label="Alpha" value={data.absensi.alpha} />
          <Item label="Lembur" value={data.absensi.lembur} />
        </Card>
      </div>

      {/* REMINDER */}
      <Card title="Reminder HR">
        <ul className="list-disc ml-5 text-sm text-red-600 space-y-2">
          {data.reminder.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Card>

      {/* QUICK ACTION */}
      <div className="bg-gray-50 border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <ActionButton label="Tambah Karyawan" />
          <ActionButton label="Absensi" />
          <ActionButton label="Payroll" />
          <ActionButton label="Cuti" />
        </div>
      </div>
    </section>
  )
}

/* ===== KOMPONEN KECIL ===== */

function Kpi({
  title,
  value,
  highlight,
}: {
  title: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p
        className={`text-2xl font-bold ${
          highlight ? "text-yellow-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <div className="space-y-2 text-sm">
        {children}
      </div>
    </div>
  )
}

function Item({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function ActionButton({ label }: { label: string }) {
  return (
    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
      {label}
    </button>
  )
}
