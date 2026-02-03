export default function DealActions() {
  return (
    <div className="bg-white border rounded-2xl p-6 space-y-3">
      <h3 className="font-bold text-gray-900 mb-4">
        Deal Actions
      </h3>

      <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">
        Mark as Deal Won
      </button>

      <button className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold">
        Mark as Lost
      </button>

      <button className="w-full border border-gray-300 py-2 rounded-lg font-semibold">
        Convert to Project
      </button>
    </div>
  )
}
