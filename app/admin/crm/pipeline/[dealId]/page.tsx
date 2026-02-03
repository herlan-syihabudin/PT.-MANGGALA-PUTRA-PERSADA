import { notFound } from "next/navigation"

type Deal = {
  dealId: string
  clientName: string
  company: string
  whatsapp: string
  projectType: string
  location: string
  estimatedValue: string
  status: string
  pic: string
  nextFollowUp: string
  scope: string
  notes: string
}

// sementara dummy → nanti ganti dari Google Sheet
const mockDeal: Deal = {
  dealId: "DEAL-2025-001",
  clientName: "Budi Santoso",
  company: "PT ABC Industri",
  whatsapp: "0812xxxxxxx",
  projectType: "Industrial / Warehouse",
  location: "Bekasi",
  estimatedValue: "Rp 4.800.000.000",
  status: "Survey",
  pic: "Admin MPP",
  nextFollowUp: "2026-02-10",
  scope: "Pekerjaan struktur baja dan MEP gudang produksi",
  notes: "Client tertarik, minta estimasi RAB detail",
}

export default function DealDetailPage({
  params,
}: {
  params: { dealId: string }
}) {
  if (!params.dealId) return notFound()

  const deal = mockDeal

  return (
    <section className="p-6 md:p-10 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-sm text-gray-500">Deal Detail</p>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {deal.dealId}
          </h1>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            {deal.status}
          </span>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border bg-white text-sm">
            Update Status
          </button>
          <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm">
            Convert to Project
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          {/* CLIENT INFO */}
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Client Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <p><b>Name:</b> {deal.clientName}</p>
              <p><b>Company:</b> {deal.company}</p>
              <p><b>WhatsApp:</b> {deal.whatsapp}</p>
              <p><b>Location:</b> {deal.location}</p>
            </div>
          </div>

          {/* PROJECT INFO */}
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Project Information</h3>
            <div className="space-y-2 text-sm">
              <p><b>Project Type:</b> {deal.projectType}</p>
              <p><b>Estimated Value:</b> {deal.estimatedValue}</p>
              <p><b>Scope:</b> {deal.scope}</p>
            </div>
          </div>

          {/* NOTES */}
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">Notes</h3>
            <p className="text-sm text-gray-700">
              {deal.notes}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">Follow Up</h3>
            <p className="text-sm"><b>PIC:</b> {deal.pic}</p>
            <p className="text-sm"><b>Next Follow Up:</b> {deal.nextFollowUp}</p>
          </div>
        </div>

      </div>
    </section>
  )
}
