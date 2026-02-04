"use client"

export default function MaterialForm() {
  return (
    <form className="bg-white border rounded-2xl p-6 space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900">
        Master Material
      </h2>

      {/* Nama Material */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nama Material
        </label>
        <input
          type="text"
          placeholder="Contoh: Beton Ready Mix"
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* Spesifikasi */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Spesifikasi / Mutu
        </label>
        <input
          type="text"
          placeholder="Contoh: K-300"
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* Kategori & Satuan */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Kategori
          </label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2">
            <option>Struktur</option>
            <option>Arsitektur</option>
            <option>MEP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Satuan
          </label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2">
            <option>m3</option>
            <option>kg</option>
            <option>batang</option>
            <option>ls</option>
          </select>
        </div>
      </div>

      {/* Harga Dasar */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Harga Dasar (Estimasi)
        </label>
        <input
          type="number"
          placeholder="1050000"
          className="mt-1 w-full rounded-lg border px-3 py-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          Harga estimasi untuk RAB (bukan harga beli)
        </p>
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

      {/* Action */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gray-900 text-white"
        >
          Simpan Material
        </button>
      </div>
    </form>
  )
}
