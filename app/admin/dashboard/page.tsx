// app/admin/dashboard/page.tsx

import { fetchSheet } from "@/lib/sheetApi"

async function getDashboardData() {
  const materials = await fetchSheet("MASTER_MATERIAL")

  const totalMaterial = materials.length
  const needUpdate = materials.filter(
    (m: any) => m.status === "NEEDS_SUPPLIER_UPDATE"
  ).length

  const ready = totalMaterial - needUpdate

  return {
    materials,
    totalMaterial,
    needUpdate,
    ready,
  }
}

export default async function AdminDashboardPage() {
  const {
    materials,
    totalMaterial,
    needUpdate,
    ready,
  } = await getDashboardData()

  return (
    <section className="p-6 md:p-10 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Dashboard Utama
        </h1>
        <p className="text-gray-600 mt-1">
          Ringkasan performa perusahaan (semua divisi)
        </p>
      </div>

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Material</p>
          <p className="text-2xl font-bold">{totalMaterial}</p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Material Ready</p>
          <p className="text-2xl font-bold text-green-600">
            {ready}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Perlu Update Supplier
          </p>
          <p className="text-2xl font-bold text-yellow-600">
            {needUpdate}
          </p>
        </div>
      </div>

      {/* ALERT */}
      {needUpdate > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="font-semibold text-yellow-800 mb-2">
            ⚠️ Material perlu dilengkapi supplier
          </p>
          <ul className="list-disc ml-5 text-sm text-yellow-800 space-y-1">
            {materials
              .filter(
                (m: any) => m.status === "NEEDS_SUPPLIER_UPDATE"
              )
              .slice(0, 5)
              .map((m: any) => (
                <li key={m.material_id}>
                  {m.nama_material} ({m.spesifikasi})
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b font-semibold text-gray-900">
          Master Material (Terbaru)
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Material</th>
              <th>Spesifikasi</th>
              <th>Satuan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {materials.slice(0, 10).map((m: any) => (
              <tr
                key={m.material_id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3 font-medium">
                  {m.nama_material}
                </td>
                <td>{m.spesifikasi}</td>
                <td>{m.satuan}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold
                      ${
                        m.status === "READY"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
