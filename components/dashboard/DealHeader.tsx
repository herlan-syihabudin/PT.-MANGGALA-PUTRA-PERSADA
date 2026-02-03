export default function DealHeader({ dealId }: { dealId: string }) {
  return (
    <div className="bg-white border rounded-2xl p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Deal ID</p>
        <h1 className="text-2xl font-extrabold text-gray-900">
          DEAL-{dealId}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Warehouse Construction · Bekasi
        </p>
      </div>

      <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
        On Negotiation
      </span>
    </div>
  )
}
