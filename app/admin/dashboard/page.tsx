import KPICard from "@/components/dashboard/KPICard"
import StatusItem from "@/components/dashboard/StatusItem"

export default function AdminDashboard() {
  return (
    <section className="p-6 md:p-10">

      <h1 className="text-3xl font-extrabold text-gray-900">
        CRM Dashboard
      </h1>
      <p className="text-gray-600 mt-1 mb-10">
        Overview of inquiries, pipeline, and project status
      </p>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <KPICard title="New Inquiries" value="12" note="This month" />
        <KPICard title="On Progress" value="8" note="Follow Up / Survey" />
        <KPICard title="Deals Closed" value="3" note="This month" />
        <KPICard title="Pipeline Value" value="Rp 4.8 B" note="Estimated" />
      </div>

      {/* PIPELINE */}
      <div className="bg-white border rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">
          Inquiry Pipeline Status
        </h3>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <StatusItem label="New" value={4} />
          <StatusItem label="Follow Up" value={6} />
          <StatusItem label="Survey" value={3} />
          <StatusItem label="Penawaran" value={2} />
          <StatusItem label="Deal" value={1} />
          <StatusItem label="Lost" value={1} />
        </div>
      </div>

    </section>
  )
}
