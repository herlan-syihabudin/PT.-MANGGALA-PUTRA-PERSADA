"use client"

export default function MaterialSupplierForm() {
  return (
    <form className="bg-white border rounded-2xl p-6 space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900">
        Supplier & Harga Material
      </h2>

      {/* Material */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Material
        </label>
        <select className="mt-1 w-full rounded-lg border px-3 py-2">
          <option>Beton Ready Mix K-300</option>
          <option>Besi Beton Ulir D13</option>
        </select>
      </div>

      {/* Supplier */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Supplier
          </label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2">
            <option>PT Beton Jaya</option>
            <option>PT Beton Sentosa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Brand / Pabrik
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      {/* Harga & Lead Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Harga Supplier
          </label>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lead Time (hari)
          </label>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      {/* Keterangan */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Keterangan
        </label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-lg bg-gray-900 text-white">
          Simpan Supplier
        </button>
      </div>
    </form>
  )
}
