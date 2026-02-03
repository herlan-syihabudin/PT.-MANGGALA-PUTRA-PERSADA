export default function DealInfo() {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 mb-4">
        Deal Information
      </h3>

      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Client</p>
          <p className="font-semibold">Budi Santoso</p>
          <p className="text-xs text-gray-400">PT Maju Jaya</p>
        </div>

        <div>
          <p className="text-gray-500">Deal Value</p>
          <p className="font-semibold text-green-600">Rp 2.500.000.000</p>
        </div>

        <div>
          <p className="text-gray-500">Project Type</p>
          <p className="font-semibold">Warehouse Construction</p>
        </div>

        <div>
          <p className="text-gray-500">PIC</p>
          <p className="font-semibold">Admin</p>
        </div>
      </div>
    </div>
  )
}
