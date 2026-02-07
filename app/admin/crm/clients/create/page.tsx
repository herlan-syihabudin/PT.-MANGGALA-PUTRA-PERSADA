export const dynamic = "force-dynamic"

export default function CreateClientPage() {
  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Klien</h1>
        <p className="text-gray-500 text-sm">
          Data klien / owner proyek
        </p>
      </div>

      <div className="bg-white border rounded p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Nama Perusahaan / Klien</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="PT Contoh Sejahtera"
          />
        </div>

        <div>
          <label className="text-sm font-medium">PIC / Contact Person</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="Nama PIC"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="email@company.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium">No. Telepon</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Alamat</label>
          <textarea
            className="w-full border rounded px-3 py-2 mt-1"
            rows={3}
          />
        </div>

        <div className="pt-4">
          <button className="bg-red-600 text-white px-5 py-2 rounded">
            Simpan Klien
          </button>
        </div>
      </div>
    </div>
  )
}
