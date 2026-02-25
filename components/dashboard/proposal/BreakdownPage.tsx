import { formatCurrency } from "@/lib/utils"
import type { ProposalData } from "./types"

interface BreakdownPageProps {
  data: ProposalData
}

export function BreakdownPage({ data }: BreakdownPageProps) {
  // Group items by section
  const strukturItems = data.breakdownItems.filter(i => i.section === 'struktur')
  const arsitekturItems = data.breakdownItems.filter(i => i.section === 'arsitektur')
  const mepItems = data.breakdownItems.filter(i => i.section === 'mep')
  const lainnyaItems = data.breakdownItems.filter(i => i.section === 'lainnya')

  const SectionHeader = ({ title, color }: { title: string; color: string }) => (
    <tr>
      <td colSpan={6} className="pt-6 pb-2">
        <div className={`text-sm font-bold uppercase tracking-wider text-${color}-700 bg-${color}-50 px-4 py-2 rounded`}>
          {title}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="bg-white min-h-[1123px] relative overflow-hidden">
      {/* ===== BACKGROUND ACCENT ===== */}
      <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />

      <div className="relative z-10 p-12">
        
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            BREAKDOWN COST
          </h1>
          <p className="text-sm text-gray-500">
            No. {data.nomor} | {data.tanggal}
          </p>
        </div>

        {/* ===== TABLE BREAKDOWN ===== */}
        <table className="w-full text-sm mt-6">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="py-3 px-2 text-center w-12">No</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-2 text-center w-16">Unit</th>
              <th className="py-3 px-2 text-center w-16">Qty</th>
              <th className="py-3 px-3 text-right w-32">Unit Price</th>
              <th className="py-3 px-3 text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="border-x border-gray-200">
            
            {/* STRUKTUR */}
            {strukturItems.length > 0 && (
              <>
                <SectionHeader title="A. PEKERJAAN STRUKTUR" color="gray" />
                {strukturItems.map((item) => (
                  <tr key={item.no} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-center">{item.no}</td>
                    <td className="py-2 px-4">{item.description}</td>
                    <td className="py-2 px-2 text-center">{item.unit}</td>
                    <td className="py-2 px-2 text-center">{item.qty}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* ARSITEKTUR */}
            {arsitekturItems.length > 0 && (
              <>
                <SectionHeader title="B. PEKERJAAN ARSITEKTUR" color="gray" />
                {arsitekturItems.map((item) => (
                  <tr key={item.no} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-center">{item.no}</td>
                    <td className="py-2 px-4">{item.description}</td>
                    <td className="py-2 px-2 text-center">{item.unit}</td>
                    <td className="py-2 px-2 text-center">{item.qty}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* MEP */}
            {mepItems.length > 0 && (
              <>
                <SectionHeader title="C. PEKERJAAN MEP" color="gray" />
                {mepItems.map((item) => (
                  <tr key={item.no} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-center">{item.no}</td>
                    <td className="py-2 px-4">{item.description}</td>
                    <td className="py-2 px-2 text-center">{item.unit}</td>
                    <td className="py-2 px-2 text-center">{item.qty}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* LAINNYA */}
            {lainnyaItems.length > 0 && (
              <>
                <SectionHeader title="D. PEKERJAAN LAIN-LAIN" color="gray" />
                {lainnyaItems.map((item) => (
                  <tr key={item.no} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-center">{item.no}</td>
                    <td className="py-2 px-4">{item.description}</td>
                    <td className="py-2 px-2 text-center">{item.unit}</td>
                    <td className="py-2 px-2 text-center">{item.qty}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>

        {/* ===== FOOTER NOTE ===== */}
        <div className="mt-8 text-sm text-gray-500 border-t border-gray-200 pt-4">
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-red-600 rounded-full" />
            Harga sudah termasuk material, jasa, dan peralatan
          </p>
          <p className="flex items-center gap-2 mt-1">
            <span className="w-1 h-1 bg-red-600 rounded-full" />
            PPN 11% akan ditambahkan pada invoice
          </p>
        </div>

        {/* ===== PAGE NUMBER ===== */}
        <div className="absolute bottom-8 right-12 text-sm text-gray-400">
          Page 3 of 3
        </div>
      </div>
    </div>
  )
}
