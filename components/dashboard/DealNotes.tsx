export default function DealNotes() {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 mb-4">
        Notes & Follow Up
      </h3>

      <textarea
        className="w-full border rounded-lg p-3 text-sm"
        placeholder="Add negotiation note or follow up result..."
      />

      <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold">
        Save Note
      </button>
    </div>
  )
}
