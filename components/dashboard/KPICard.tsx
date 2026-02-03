export default function KPICard({
  title,
  value,
  note,
}: {
  title: string
  value: string
  note: string
}) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{note}</p>
    </div>
  )
}
