import Link from "next/link"
import ConvertButton from "@/components/dashboard/ConvertButton"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

type Inquiry = {
  inquiry_id: string
  tanggal_masuk: string
  customer_name: string
  nama_pekerjaan: string
  layanan?: string
  estimasi_nilai?: number | null
  assigned_to?: string
  status: string
}

type InquiryResponse = {
  data: Inquiry[]
  summary: {
    total: number
    new: number
    ongoing: number
    won: number
    lost: number
    pipeline_value: number
  }
  page: number
  totalPages: number
}

/* ================= FETCH ================= */

async function fetchInquiry(): Promise<InquiryResponse> {
  const base = process.env.NEXT_PUBLIC_BASE_URL

  const res = await fetch(`${base}/api/crm/inquiry?page=1&limit=20`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return {
      data: [],
      summary: {
        total: 0,
        new: 0,
        ongoing: 0,
        won: 0,
        lost: 0,
        pipeline_value: 0,
      },
      page: 1,
      totalPages: 1,
    }
  }

  return res.json()
}

/* ================= HELPER ================= */

const formatCurrency = (value?: number | null) => {
 if (value === null || value === undefined) return "-"

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

/* ================= PAGE ================= */

export default async function InquiryPage() {
  const response = await fetchInquiry()

  const data = response.data
  const summary = response.summary

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

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPI label="Total" value={summary.total} />
        <KPI label="New" value={summary.new} />
        <KPI label="Ongoing" value={summary.ongoing} highlight="blue" />
        <KPI label="Won" value={summary.won} highlight="green" />
        <KPI label="Lost" value={summary.lost} highlight="red" />
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-5xl">📭</div>
                    <p className="text-gray-500 text-sm">
                      Belum ada inquiry masuk
                    </p>
                    <Link
                      href="/admin/crm/inquiry/create"
                      className="text-blue-600 text-xs underline"
                    >
                      Buat inquiry pertama
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((i) => (
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

                    {i.status !== "lost" && !i.converted_rab_id ? (
  <ConvertButton inquiry_id={i.inquiry_id} />
) : (
  <span className="text-xs text-gray-300">Convert</span>
)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* OPTIONAL: PIPELINE VALUE */}
      <div className="text-right text-sm text-gray-600">
        Total Pipeline:{" "}
        <span className="font-semibold">
          {formatCurrency(summary.pipeline_value)}
        </span>
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
