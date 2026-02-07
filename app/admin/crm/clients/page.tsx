export const dynamic = "force-dynamic"

export default function ClientListPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Klien</h1>

        <a
          href="/admin/crm/clients/create"
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + Tambah Klien
        </a>
      </div>

      <div className="bg-white border rounded p-6 text-gray-500">
        Belum ada data klien
      </div>
    </div>
  )
}
