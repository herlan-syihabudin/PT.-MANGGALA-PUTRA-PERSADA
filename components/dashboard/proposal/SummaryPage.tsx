import { formatCurrency } from "@/lib/utils"
import type { ProposalData } from "./types"

interface SummaryPageProps {
  data: ProposalData
}

export function SummaryPage({ data }: SummaryPageProps) {
  // Hitung total dari summary sections
  const subtotal = data.summarySections.reduce((sum, item) => sum + item.amount, 0)
  const overhead = subtotal * 0.05 // 5%
  const grandTotal = subtotal + overhead
  const rounded = Math.round(grandTotal / 1000000) * 1000000 // Pembulatan ke juta terdekat

  return (
    <div className="bg-white min-h-[1123px] relative overflow-hidden">
      {/* ===== BACKGROUND ACCENT ===== */}
      <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-20" />

      <div className="relative z-10 p-12">
        
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            GRAND SUMMARY
          </h1>
          <p className="text-sm text-gray-500">
            No. {data.nomor} | {data.tanggal}
          </p>
        </div>

        {/* ===== CUSTOMER INFO ===== */}
        <div className="mt-6 mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{data.customer.perusahaan}</p>
          <p className="text-sm text-gray-600 mt-1">{data.proyek.nama}</p>
        </div>

        {/* ===== TABLE SUMMARY ===== */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="py-3 px-4 text-left w-16">No</th>
              <th className="py-3 px-4 text-left">Section Pekerjaan</th>
              <th className="py-3 px-4 text-center w-20">Unit</th>
              <th className="py-3 px-4 text-center w-20">Qty</th>
              <th className="py-3 px-4 text-right w-40">Amount (Rp)</th>
            </tr>
          </thead>
          <tbody className="border-x border-gray-200">
            {data.summarySections.map((item) => (
              <tr key={item.no} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{item.no}</td>
                <td className="py-3 px-4 font-medium">{item.section}</td>
                <td className="py-3 px-4 text-center">{item.unit}</td>
                <td className="py-3 px-4 text-center">{item.qty}</td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== TOTAL SECTION ===== */}
        <div className="mt-8 flex justify-end">
          <div className="w-96">
            <div className="flex justify-between py-2 text-sm">
              <span className="font-medium text-gray-700">Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm border-t border-gray-200">
              <span className="font-medium text-gray-700">Overhead (5%)</span>
              <span className="font-mono">{formatCurrency(overhead)}</span>
            </div>
            <div className="flex justify-between py-3 text-base font-bold border-t-2 border-gray-900">
              <span>GRAND TOTAL</span>
              <span className="font-mono text-red-600">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm bg-gray-50 px-4 rounded-lg mt-2">
              <span className="font-medium text-gray-700">Dibulatkan</span>
              <span className="font-mono font-semibold">{formatCurrency(rounded)}</span>
            </div>
          </div>
        </div>

        {/* ===== FOOTER NOTE ===== */}
        <div className="mt-12 text-sm text-gray-500 italic">
          <p>* Harga sudah termasuk material dan jasa</p>
          <p>* Overhead termasuk manajemen proyek, engineering, dan administrasi</p>
        </div>

        {/* ===== PAGE NUMBER ===== */}
        <div className="absolute bottom-8 right-12 text-sm text-gray-400">
          Page 2 of 3
        </div>
      </div>
    </div>
  )
}
