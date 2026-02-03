export default function CRMPipelinePage() {
  return (
    <section className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Pipeline & Deals
        </h1>
        <p className="text-gray-600 mt-1">
          Inquiry progress, negotiation, and deal tracking
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">
          Deal Pipeline Overview
        </h3>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="border rounded-xl p-4">
            <p className="font-semibold text-blue-600">Follow Up</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">6</p>
          </div>

          <div className="border rounded-xl p-4">
            <p className="font-semibold text-orange-600">Penawaran</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">2</p>
          </div>

          <div className="border rounded-xl p-4">
            <p className="font-semibold text-green-600">Deal</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">1</p>
          </div>
        </div>
      </div>
    </section>
  )
}
