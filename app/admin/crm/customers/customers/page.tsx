export const dynamic = "force-dynamic"

export default function CustomerListPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer / Klien</h1>

        <a
          href="/admin/crm/customers/create"
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + Tambah Customer
        </a>
      </div>

      <div className="border rounded bg-white p-6 text-gray-500">
        Belum ada customer
      </div>
    </div>
  )
}
