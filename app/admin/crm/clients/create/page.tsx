export const dynamic = "force-dynamic"

export default function CreateCustomerPage() {
  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Tambah Customer</h1>
        <p className="text-gray-500 text-sm">
          Master data customer / owner proyek
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white border rounded p-6 space-y-6">
        {/* === IDENTITAS PERUSAHAAN === */}
        <section>
          <h2 className="font-semibold mb-4">Identitas Perusahaan</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="PT Contoh Sejahtera"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Tipe Customer <span className="text-red-500">*</span>
              </label>
              <select className="w-full border rounded px-3 py-2 mt-1">
                <option value="">-- Pilih --</option>
                <option>Owner</option>
                <option>Developer</option>
                <option>Main Contractor</option>
                <option>Sub Contractor</option>
                <option>Consultant</option>
                <option>Supplier</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">NPWP</label>
              <input
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="99.999.999.9-999.999"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status Customer</label>
              <select className="w-full border rounded px-3 py-2 mt-1">
                <option>Active</option>
                <option>Inactive</option>
                <option>Blacklist</option>
              </select>
            </div>
          </div>
        </section>

        <hr />

        {/* === PIC / CONTACT === */}
        <section>
          <h2 className="font-semibold mb-4">PIC / Contact Person</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Nama PIC <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="Nama PIC"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Jabatan</label>
              <input
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="Direktur / Manager / Procurement"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="email@company.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                No. Telepon / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>
        </section>

        <hr />

        {/* === ALAMAT === */}
        <section>
          <h2 className="font-semibold mb-4">Alamat Perusahaan</h2>

          <div className="space-y-4">
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Alamat lengkap perusahaan"
            />

            <div className="grid md:grid-cols-3 gap-4">
              <input
                className="border rounded px-3 py-2"
                placeholder="Kota"
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Provinsi"
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Kode Pos"
              />
            </div>
          </div>
        </section>

        <hr />

        {/* === CATATAN INTERNAL === */}
        <section>
          <h2 className="font-semibold mb-4">Catatan Internal</h2>

          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Catatan karakter customer, histori komunikasi, dll"
          />
        </section>

        {/* ACTION */}
        <div className="flex gap-3 pt-6">
          <button className="bg-red-600 text-white px-6 py-2 rounded">
            Simpan Customer
          </button>

          <button className="bg-gray-800 text-white px-6 py-2 rounded">
            Simpan & Buat Project
          </button>
        </div>
      </div>
    </div>
  )
}
