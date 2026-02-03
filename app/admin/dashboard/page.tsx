import KPICard from "@/components/dashboard/KPICard"
import StatusItem from "@/components/dashboard/StatusItem"
import InquiryTable from "@/components/dashboard/InquiryTable"

export default function AdminDashboard() {
  return (
    <section className="p-6 md:p-10">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">
          CRM Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Overview of inquiries, pipeline, and project status
        </p>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <KPICard
          title="New Inquiries"
          value="12"
          note="This month"
          trend="up"
        />
        <KPICard
          title="On Progress"
          value="8"
          note="Follow Up / Survey"
          trend="neutral"
        />
        <KPICard
          title="Deals Closed"
          value="3"
          note="This month"
          trend="up"
        />
        <KPICard
          title="Pipeline Value"
          value="Rp 4.8 B"
          note="Estimated"
          trend="neutral"
        />
      </div>

      {/* PIPELINE STATUS */}
      <div className="bg-white border rounded-2xl p-6 mb-12">
        <h3 className="font-bold text-gray-900 mb-4">
          Inquiry Pipeline Status
        </h3>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <StatusItem label="New" value={4} total={12} variant="new" />
          <StatusItem label="Follow Up" value={6} total={12} variant="followup" />
          <StatusItem label="Survey" value={3} total={12} variant="survey" />
          <StatusItem label="Penawaran" value={2} total={12} variant="offer" />
          <StatusItem label="Deal" value={1} total={12} variant="deal" />
          <StatusItem label="Lost" value={1} total={12} variant="lost" />
        </div>
      </div>

      {/* INQUIRY TABLE */}
      <InquiryTable />

    </section>
  )
}
