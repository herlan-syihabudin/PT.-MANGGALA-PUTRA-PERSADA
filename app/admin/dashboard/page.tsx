// app/admin/dashboard/page.tsx

async function getDashboardData() {
  // DUMMY DATA SEMUA DIVISI (sementara)
  return {
    hr: {
      totalEmployee: 32,
      hadirHariIni: 28,
      cutiIzin: 4,
      kontrakHabis: 3,
    },
    ga: {
      totalAsset: 64,
      assetMaintenance: 5,
      dokumenExpired: 2,
    },
    inventory: {
      totalMaterial: 120,
      materialReady: 98,
      materialNeedUpdate: 22,
    },
    project: {
      projectAktif: 6,
      projectTerlambat: 1,
    },
    finance: {
      invoicePending: 4,
      cashflowWarning: 1,
    },
  }
}

export default async function AdminDashboardPage() {
  const { hr, ga, inventory, project, finance } =
    await getDashboardData()

  return (
    <section className="p-6 md:p-10 space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Dashboard Utama
        </h1>
        <p className="text-gray-600 mt-1">
          Ringkasan seluruh divisi perusahaan
        </p>
      </div>

      {/* HR */}
      <Section title="Human Resources">
        <Kpi title="Total Karyawan" value={hr.totalEmployee} />
        <Kpi title="Hadir Hari Ini" value={hr.hadirHariIni} />
        <Kpi title="Cuti / Izin" value={hr.cutiIzin} />
        <Kpi
          title="Kontrak Habis"
          value={hr.kontrakHabis}
          highlight
        />
      </Section>

      {/* GA */}
      <Section title="General Affairs">
        <Kpi title="Total Aset" value={ga.totalAsset} />
        <Kpi
          title="Perlu Maintenance"
          value={ga.assetMaintenance}
          highlight
        />
        <Kpi
          title="Dokumen Expired"
          value={ga.dokumenExpired}
          danger
        />
      </Section>

      {/* INVENTORY */}
      <Section title="Inventory & Procurement">
        <Kpi title="Total Material" value={inventory.totalMaterial} />
        <Kpi
          title="Material Ready"
          value={inventory.materialReady}
        />
        <Kpi
          title="Perlu Update Supplier"
          value={inventory.materialNeedUpdate}
          highlight
        />
      </Section>

      {/* PROJECT */}
      <Section title="Project">
        <Kpi title="Project Aktif" value={project.projectAktif} />
        <Kpi
          title="Project Terlambat"
          value={project.projectTerlambat}
          danger
        />
      </Section>

      {/* FINANCE */}
      <Section title="Finance">
        <Kpi
          title="Invoice Pending"
          value={finance.invoicePending}
          highlight
        />
        <Kpi
          title="Cashflow Warning"
          value={finance.cashflowWarning}
          danger
        />
      </Section>
    </section>
  )
}

/* ===== KOMPONEN ===== */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="font-semibold text-gray-900 mb-3">
        {title}
      </h2>
      <div className="grid md:grid-cols-4 gap-6">
        {children}
      </div>
    </div>
  )
}

function Kpi({
  title,
  value,
  highlight,
  danger,
}: {
  title: string
  value: number
  highlight?: boolean
  danger?: boolean
}) {
  let color = "text-gray-900"
  if (highlight) color = "text-yellow-600"
  if (danger) color = "text-red-600"

  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  )
}
