import Link from "next/link"
import ConvertButton from "@/components/dashboard/ConvertButton"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

// Sesuai dengan interface Inquiry dari API
type Inquiry = {
  inquiry_id: string
  tanggal_masuk: string
  customer_id: string
  customer_name: string
  nama_pekerjaan: string
  layanan: string
  estimasi_nilai: number | null
  sumber: string
  assigned_to: string
  status: "new" | "survey" | "estimating" | "boq_created" | "proposal" | "negotiation" | "won" | "lost"
  prioritas: string
  lokasi: string
  catatan: string
  converted_rab_id: string
  converted_project_id: string
  created_at: string
  created_by: string
  stage: string
  converted_proposal_id: string
}

// Sesuai dengan response API terbaru (ada avg_deal_value)
type InquiryResponse = {
  data: Inquiry[]
  summary: {
    total: number
    active: number
    new: number
    survey: number
    estimating: number
    boq_created: number
    proposal: number
    negotiation: number
    won: number
    lost: number
    pipeline_value: number
    conversion_rate: number
    avg_deal_value: number
  }
  page: number
  totalPages: number
}

/* ================= FETCH ================= */

async function fetchInquiry(): Promise<InquiryResponse> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `https://${process.env.VERCEL_URL}`

    const res = await fetch(
      `${baseUrl}/api/crm/inquiry?page=1&limit=50`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    console.error("Error fetching inquiry:", error)

    return {
      data: [],
      summary: {
        total: 0,
        active: 0,
        new: 0,
        survey: 0,
        estimating: 0,
        boq_created: 0,
        proposal: 0,
        negotiation: 0,
        won: 0,
        lost: 0,
        pipeline_value: 0,
        conversion_rate: 0,
        avg_deal_value: 0,
      },
      page: 1,
      totalPages: 1,
    }
  }
}

/* ================= HELPER ================= */

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "-"

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/* ================= PAGE ================= */

export default async function InquiryPage() {
  const response = await fetchInquiry()
  const { data, summary, page, totalPages } = response

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inquiry / Lead Masuk</h1>
          <p className="text-sm text-gray-500">
            Monitoring pipeline marketing & konversi project
          </p>
        </div>

        <Link
          href="/admin/crm/inquiry/create"
          className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition"
        >
          + Tambah Inquiry
        </Link>
      </div>

      {/* KPI BARIS 1 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPI label="Total Inquiry" value={summary.total} />
        <KPI label="Active Pipeline" value={summary.active} highlight="blue" />
        <KPI label="Won (PO)" value={summary.won} highlight="green" />
        <KPI label="Lost" value={summary.lost} highlight="red" />
        <KPI label="Conversion Rate" value={`${summary.conversion_rate}%`} />
      </div>

      {/* KPI BARIS 2 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPI label="New" value={summary.new} />
        <KPI label="Survey" value={summary.survey} />
        <KPI label="Estimating" value={summary.estimating} />
        <KPI label="BOQ" value={summary.boq_created} />
        <KPI label="Proposal" value={summary.proposal} />
      </div>

      {/* KPI BARIS 3 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPI label="Negotiation" value={summary.negotiation} />
        <KPI label="Avg Deal" value={formatCurrency(summary.avg_deal_value)} highlight="purple" />
        <KPI label="Pipeline Value" value={formatCurrency(summary.pipeline_value)} highlight="blue" />
        <div /> {/* Spacer */}
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-x-auto shadow-sm">
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
                <td colSpan={8} className="p-12 text-center text-gray-400">
                  Belum ada inquiry
                </td>
              </tr>
            ) : (
              data.map((i) => (
                <tr key={i.inquiry_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap">
                    {i.tanggal_masuk
                      ? new Date(i.tanggal_masuk).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })
                      : "-"}
                  </td>

                  <td className="p-3 font-medium">
                    <Link 
                      href={`/admin/crm/inquiry/${i.inquiry_id}`}
                      className="hover:text-slate-600 hover:underline"
                    >
                      {i.customer_name || "-"}
                    </Link>
                  </td>

                  <td className="p-3">
                    {i.nama_pekerjaan || "-"}
                  </td>

                  <td className="p-3">
                    {i.layanan || "-"}
                  </td>

                  <td className="p-3 text-right font-medium">
                    {formatCurrency(i.estimasi_nilai)}
                  </td>

                  <td className="p-3">
                    {i.assigned_to ? (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs">
                        {i.assigned_name ?? i.assigned_to}
                      </span>
                    ) : "-"}
                  </td>

                  <td className="p-3">
                    <StatusBadge status={i.status} />
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/crm/inquiry/${i.inquiry_id}`}
                        className="text-xs text-slate-600 hover:text-slate-800"
                      >
                        Detail
                      </Link>

                      {!i.converted_project_id && 
                       i.status !== "won" && 
                       i.status !== "lost" && (
                        <Link
                          href={`/admin/crm/inquiry/${i.inquiry_id}/assign`}
                          className="text-xs text-amber-600 hover:text-amber-800"
                        >
                          Assign
                        </Link>
                      )}

                      {/* CONVERT BUTTON - UNTUK STATUS YANG BISA DI-CONVERT */}
                      {!i.converted_project_id && 
                       (i.status === "proposal" || i.status === "negotiation") && (
                        <ConvertButton inquiry_id={i.inquiry_id} />
                      )}

                      {i.converted_project_id && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Converted
                        </span>
                      )}

                      {i.status === "lost" && !i.converted_project_id && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Lost
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION INFO */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-gray-500">
          Page {page} of {totalPages}
        </div>
      </div>

    </div>
  )
}

/* ================= COMPONENTS ================= */

function KPI({ label, value, highlight }: { 
  label: string
  value: string | number
  highlight?: "green" | "red" | "blue" | "purple"
}) {
  const colorClasses = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
  }

  const color = highlight ? colorClasses[highlight] : "text-gray-900"

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: Inquiry["status"] }) {
  const config: Record<Inquiry["status"], { color: string; label: string }> = {
    new: { color: "bg-gray-100 text-gray-700", label: "New" },
    survey: { color: "bg-blue-100 text-blue-700", label: "Survey" },
    estimating: { color: "bg-amber-100 text-amber-700", label: "Estimating" },
    boq_created: { color: "bg-purple-100 text-purple-700", label: "BOQ" },
    proposal: { color: "bg-indigo-100 text-indigo-700", label: "Proposal" },
    negotiation: { color: "bg-orange-100 text-orange-700", label: "Negotiation" },
    won: { color: "bg-green-100 text-green-700", label: "WON" },
    lost: { color: "bg-red-100 text-red-700", label: "Lost" },
  }

  const { color, label } = config[status] || config.new

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
