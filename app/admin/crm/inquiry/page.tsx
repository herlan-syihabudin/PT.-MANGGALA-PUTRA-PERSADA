import Link from "next/link"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

type Inquiry = {
  inquiry_id: string
  tanggal_masuk: string
  customer_name: string
  nama_pekerjaan: string
  layanan?: string
  estimasi_nilai?: number
  assigned_to?: string
  status: string
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

/* ================= HELPER ================= */

const formatCurrency = (value?: number) => {
  if (!value) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

/* ================= PAGE ================= */

export default async function InquiryPage() {
  const rawData = await fetchInquiry()
  const data = rawData ?? []

  const normalized = data.map(i => ({
    ...i,
    status: i.status?.toLowerCase() || "new"
  }))

  const total = normalized.length
  const newCount = normalized.filter(i => i.status === "new").length
  const won = normalized.filter(i => i.status === "won").length
  const lost = normalized.filter(i => i.status === "lost").length

  // Ongoing = selain new / won / lost
  const ongoing = normalized.filter(i =>
    !["new", "won", "lost"].includes(i.status)
  ).length

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inquiry / Lead Masuk</h1>
          <p className="text-sm text-gray-500">
            Gerbang awal semua peluang project perusahaan
          </p>
        </div>

        <Link
          href="/admin/crm/inquiry/create"
          className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg"
        >
          + Tambah Inquiry
        </Link>
      </div>

      {/* KPI SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPI label="Total" value={total} />
        <KPI label="New" value={newCount} />
        <KPI label="Ongoing" value={ongoing} highlight="blue" />
        <KPI label="Won" value={won} highlight="green" />
        <KPI label="Lost" value={lost} highlight="red" />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Pekerjaan</th>
              <th className="p-3 text-left">Layanan</th>
              <th className="p-3 text-right">Budget</th>
              <th className="p-3 text-left">Assigned</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {normalized.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  Belum ada inquiry
                </td>
              </tr>
            ) : (
              normalized.map((i) => (
                <tr key={i.inquiry_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {i.tanggal_masuk
                      ? new Date(i.tanggal_masuk).toLocaleDateString("id-ID")
                      : "-"}
                  </td>

                  <td className="p-3 font-medium">
                    {i.customer_name || "-"}
                  </td>

                  <td className="p-3">
                    {i.nama_pekerjaan || "-"}
                  </td>

                  <td className="p-3">
                    {i.layanan || "-"}
                  </td>

                  <td className="p-3 text-right">
                    {formatCurrency(i.estimasi_nilai)}
                  </td>

                  <td className="p-3">
                    {i.assigned_to || "-"}
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
                      href={`/admin/crm/inquiry/${i.inquiry_id}/assign`}
                      className="text-xs text-amber-600"
                    >
                      Assign
                    </Link>

                    <Link
                      href={`/admin/crm/inquiry/${i.inquiry_id}/convert`}
                      className="text-xs text-green-600"
                    >
                      Convert
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

/* ================= COMPONENTS ================= */

function KPI({ label, value, highlight }: any) {
  const color =
    highlight === "green"
      ? "text-green-600"
      : highlight === "red"
      ? "text-red-600"
      : highlight === "blue"
      ? "text-blue-600"
      : ""

  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className={`text-xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-gray-100 text-gray-700",
    survey: "bg-blue-100 text-blue-700",
    estimating: "bg-amber-100 text-amber-700",
    sent: "bg-indigo-100 text-indigo-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        map[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  )
}
