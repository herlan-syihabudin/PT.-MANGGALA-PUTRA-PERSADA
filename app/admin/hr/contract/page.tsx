import Link from "next/link"

export default async function ContractPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/hr/contract`,
    { cache: "no-store" }
  )
  const data = await res.json()

  return (
    <section className="p-6 md:p-10 space-y-6">
      <h1 className="text-2xl font-bold">Contract Management</h1>

      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Employee ID</th>
              <th>Jenis Kontrak</th>
              <th>Mulai</th>
              <th>Selesai</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.data?.map((c: any, i: number) => (
              <tr key={i} className="border-b">
                <td className="p-3">{c.employee_id}</td>
                <td>{c.jenis_kontrak}</td>
                <td>{c.start_date}</td>
                <td>{c.end_date || "-"}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${
                    c.status_kontrak === "AKTIF"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {c.status_kontrak}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/admin/hr/contract/${c.employee_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Detail →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
