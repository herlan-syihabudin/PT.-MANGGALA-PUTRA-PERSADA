export default function StatusItem({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="border rounded-xl p-4 flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  )
}
