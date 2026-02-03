export default function DealTimeline() {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 mb-4">
        Activity Timeline
      </h3>

      <ul className="space-y-4 text-sm">
        <li>
          <p className="font-semibold">Survey Completed</p>
          <p className="text-gray-500">2024-02-08</p>
        </li>
        <li>
          <p className="font-semibold">Quotation Sent</p>
          <p className="text-gray-500">2024-02-05</p>
        </li>
        <li>
          <p className="font-semibold">Inquiry Converted to Deal</p>
          <p className="text-gray-500">2024-02-01</p>
        </li>
      </ul>
    </div>
  )
}
