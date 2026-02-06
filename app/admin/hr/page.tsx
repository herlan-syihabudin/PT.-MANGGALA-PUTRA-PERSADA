// app/admin/hr/page.tsx

export const dynamic = "force-dynamic"

async function getHRDashboard() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/hr/dashboard`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    throw new Error("Failed load HR dashboard")
  }

  return res.json()
}

export default async function HRDashboardPage() {
  const data = await getHRDashboard()

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
        <Kpi title="Total Karyawan" value={data.total} />
        <Kpi title="Aktif" value={data.aktif} />
        <Kpi title="Nonaktif" value={data.nonaktif} />
        <Kpi title="Kontrak" value={data.kontrak} highlight />
      </div>

      {/* STATUS PEGAWAI */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Status Kepegawaian">
          <Item label="Tetap" value={data.tetap} />
          <Item label="Kontrak" value={data.kontrak} />
          <Item label="Harian / Tukang" value={data.harian} />
        </Card>

        <Card title="Catatan Sistem">
          <p className="text-sm text-gray-600">
            Data ditarik langsung dari <b>EMPLOYEE_MASTER</b> Google Sheet.
          </p>
          <p className="text-xs text-gray-400">
            Update realtime, tanpa input ganda.
          </p>
        </Card>
      </div>

      {/* QUICK ACTION */}
      <div className="bg-gray-50 border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <ActionButton label="Tambah Karyawan" />
          <ActionButton label="Employment Status" />
          <ActionButton label="Kontrak" />
          <ActionButton label="Payroll" />
        </div>
      </div>
    </section>
  )
}

/* ===== KOMPONEN ===== */

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
    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">
      {label}
    </button>
  )
}
