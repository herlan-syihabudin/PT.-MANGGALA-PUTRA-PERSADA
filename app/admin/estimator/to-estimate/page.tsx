import Link from "next/link"
import { formatIDR } from "@/lib/format"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

type Inquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai: number
  tanggal_masuk: string
  prioritas?: string
}

/* ================= FETCH ================= */

async function fetchPending(): Promise<Inquiry[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL

  const res = await fetch(
    `${base}/api/estimator/inquiry/pending`,
    { cache: "no-store" }
  )

  if (!res.ok) return []
  return res.json()
}

/* ================= HELPER ================= */

function formatTanggal(dateString: string) {
  if (!dateString) return "-"

  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/* ================= PAGE ================= */

export default async function ToEstimatePage() {
  const rawData = await fetchPending()

  // Sorting terbaru di atas
  const inquiries = (rawData ?? []).sort(
    (a, b) =>
      new Date(b.tanggal_masuk).getTime() -
      new Date(a.tanggal_masuk).getTime()
  )

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          To Estimate
        </h1>
        <p className="text-sm text-gray-500">
          Inquiry baru yang perlu dibuatkan RAB
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4 text-left">Tanggal</th>
              <th className="p-4 text-left">Client & Proyek</th>
              <th className="p-4 text-right">Estimasi</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  <div className="space-y-2">
                    <div className="text-3xl">🎉</div>
                    <p className="font-medium">
                      Tidak ada inquiry baru
                    </p>
                    <p className="text-xs text-gray-400">
                      Semua inquiry sudah ditindaklanjuti
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              inquiries.map((i) => (
                <tr
                  key={i.inquiry_id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  {/* TANGGAL */}
                  <td className="p-4 text-gray-600">
                    {formatTanggal(i.tanggal_masuk)}
                  </td>

                  {/* CLIENT + PROYEK */}
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">
                      {i.customer_name || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {i.nama_pekerjaan}
                    </div>

                    {/* PRIORITY BADGE */}
                    {i.prioritas && i.prioritas !== "normal" && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full font-semibold">
                        PRIORITY: {i.prioritas.toUpperCase()}
                      </span>
                    )}
                  </td>

                  {/* ESTIMASI */}
                  <td className="p-4 text-right font-bold text-blue-700">
                    {formatIDR(i.estimasi_nilai || 0)}
                  </td>

                  {/* AKSI */}
                  <td className="p-4 text-center">
                    <Link
                      href={`/admin/estimator/rab/create?from=${i.inquiry_id}`}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition active:scale-95"
                    >
                      Buat RAB →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER INFO */}
      <div className="text-xs text-gray-400 flex items-center gap-2">
        📌 Inquiry otomatis hilang dari halaman ini setelah status berubah menjadi <b>estimating</b>
      </div>

    </div>
  )
}
