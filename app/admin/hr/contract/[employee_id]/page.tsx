import { notFound } from "next/navigation"

export default async function ContractDetail({ params }: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/hr/contract?employee_id=${params.employee_id}`,
    { cache: "no-store" }
  )

  if (!res.ok) return notFound()
  const data = await res.json()

  return (
    <section className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Kontrak Karyawan</h1>

      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-500">Employee ID</p>
        <p className="font-semibold">{params.employee_id}</p>
      </div>

      <div className="bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Jenis</th>
              <th>Mulai</th>
              <th>Selesai</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((c: any, i: number) => (
              <tr key={i} className="border-b">
                <td className="p-3">{c.jenis_kontrak}</td>
                <td>{c.start_date}</td>
                <td>{c.end_date || "-"}</td>
                <td>{c.status_kontrak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
