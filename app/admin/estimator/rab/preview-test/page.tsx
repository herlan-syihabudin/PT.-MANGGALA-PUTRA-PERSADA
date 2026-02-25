"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Download, Printer } from "lucide-react"
import { CoverPage } from "@/components/dashboard/proposal/CoverPage"
import { SummaryPage } from "@/components/dashboard/proposal/SummaryPage"
import { BreakdownPage } from "@/components/dashboard/proposal/BreakdownPage"
import type { ProposalData } from "@/components/dashboard/proposal/types"

// Sample Data
const sampleData: ProposalData = {
  nomor: "001/MPP/PEN/III/2024",
  tanggal: "25 Maret 2024",
  customer: {
    nama: "Bapak Ahmad Subagio",
    perusahaan: "PT Industri Maju",
    alamat: "Jl. Raya Industri No. 45, Jakarta Timur",
  },
  proyek: {
    nama: "Pembangunan Gudang 5000 m²",
    lokasi: "Kawasan Industri MM2100, Cibitung",
  },
  total: 1258750000, // 1.25 M
  validity: "25 April 2024",
  
  summarySections: [
    { no: "A", section: "Pekerjaan Struktur", unit: "LS", qty: 1, amount: 425000000 },
    { no: "B", section: "Pekerjaan Arsitektur", unit: "LS", qty: 1, amount: 583000000 },
    { no: "C", section: "Pekerjaan MEP", unit: "LS", qty: 1, amount: 187000000 },
  ],

  breakdownItems: [
    // STRUKTUR
    { no: 1, description: "Besi H-Beam 200x200", unit: "Btg", qty: 25, unitPrice: 3500000, amount: 87500000, section: "struktur" },
    { no: 2, description: "Besi WF 250x125", unit: "Btg", qty: 30, unitPrice: 4250000, amount: 127500000, section: "struktur" },
    { no: 3, description: "Besi Beton D19", unit: "Btg", qty: 150, unitPrice: 185000, amount: 27750000, section: "struktur" },
    { no: 4, description: "Plat Baja 12mm", unit: "Lbr", qty: 45, unitPrice: 2450000, amount: 110250000, section: "struktur" },
    
    // ARSITEKTUR
    { no: 5, description: "Panel EPS 75mm", unit: "m²", qty: 850, unitPrice: 425000, amount: 361250000, section: "arsitektur" },
    { no: 6, description: "Atap Zincalume 0.35mm", unit: "m²", qty: 1200, unitPrice: 185000, amount: 222000000, section: "arsitektur" },
    
    // MEP
    { no: 7, description: "Panel Listrik Utama", unit: "Unit", qty: 1, unitPrice: 45000000, amount: 45000000, section: "mep" },
    { no: 8, description: "Kabel NYY 4x16mm", unit: "m", qty: 350, unitPrice: 125000, amount: 43750000, section: "mep" },
    { no: 9, description: "Instalasi Pipa Air", unit: "LS", qty: 1, unitPrice: 65000000, amount: 65000000, section: "mep" },
    { no: 10, description: "Fire Hydrant System", unit: "LS", qty: 1, unitPrice: 87500000, amount: 87500000, section: "mep" },
  ],
}

export default function ProposalPreviewPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 3

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      {/* Navigation Controls (hidden when printing) */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Printer size={18} />
            Print
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl print:shadow-none">
        {currentPage === 1 && <CoverPage data={sampleData} />}
        {currentPage === 2 && <SummaryPage data={sampleData} />}
        {currentPage === 3 && <BreakdownPage data={sampleData} />}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
