import Link from "next/link"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

type Inquiry = {
  inquiry_id: string
  tanggal_masuk: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai?: number
  sumber: string
  assigned_to?: string
  status: string
  prioritas?: string
}

/* ================= FETCH ================= */

async function fetchInquiry(): Promise<Inquiry[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL

  const res = await fetch(`${base}/api/marketing/inquiry`, {
    cache: "no-store",
  })

  if (!res.ok) return []
  return res.json()
}

/* ================= PAGE ================= */

export default async function InquiryPage() {
  const data = await fetchInquiry()

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inquiry / Lead Masuk</h1>
          <p className="text-sm text-gray-500">
            Semua permintaan customer sebelum menjadi RAB atau Project
          </p>
        </div>

        <Link
          href="/admin/crm/inquiry/create"
          className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg"
        >
          + Tambah Inquiry
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Pekerjaan</th>
              <th className="p-3 text-right">Estimasi</th>
              <th className="p-3 text-left">Sumber</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Belum ada inquiry masuk
                </td>
              </tr>
            ) : (
              data.map((i) => (
                <tr key={i.inquiry_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {new Date(i.tanggal_masuk).toLocaleDateString()}
                  </td>

                  <td className="p-3 font-medium">
                    {i.customer_name}
                  </td>

                  <td className="p-3">
                    {i.nama_pekerjaan}
                  </td>

                  <td className="p-3 text-right">
                    {i.estimasi_nilai
                      ? `Rp ${i.estimasi_nilai.toLocaleString()}`
                      : "-"}
                  </td>

                  <td className="p-3">
                    {i.sumber}
                  </td>

                  <td className="p-3">
                    <StatusBadge status={i.status} />
                  </td>

                  <td className="p-3 text-center space-x-3">
                    <Link
                      href={`/admin/crm/inquiry/${i.inquiry_id}`}
                      className="text-xs text-blue-600"
                    >
                      Detail
                    </Link>

                    <Link
                      href={`/admin/crm/inquiry/${i.inquiry_id}/convert`}
                      className="text-xs text-green-600"
                    >
                      Buat RAB
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-gray-100 text-gray-700",
    survey: "bg-blue-100 text-blue-700",
    estimating: "bg-amber-100 text-amber-700",
    sent: "bg-indigo-100 text-indigo-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  }

  const normalized = status?.toLowerCase()

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        map[normalized] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  )
}
