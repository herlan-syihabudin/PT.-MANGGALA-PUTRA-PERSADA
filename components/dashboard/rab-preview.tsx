"use client"

import { useRef } from "react"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Download, Printer } from "lucide-react"

// ================= TYPES =================
export interface RABItem {
  no: number
  uraian: string
  volume: number
  satuan: string
  hargaSatuan: number
  total: number
}

export interface RABData {
  // Nomor & Tanggal
  nomor: string
  tanggal: string

  // Customer Data
  customer: {
    nama: string
    perusahaan?: string
    alamat: string
    proyek: string
    lokasi: string
  }

  // Items
  items: RABItem[]

  // Catatan
  catatan?: string

  // Validitas
  berlakuHingga: string
}

// ================= COMPONENT =================
export function RABPreview({ data }: { data: RABData }) {
  const componentRef = useRef<HTMLDivElement>(null)

  // Hitung total
  const subtotal = data.items.reduce((sum, item) => sum + item.total, 0)
  const ppn = subtotal * 0.11 // PPN 11%
  const total = subtotal + ppn

  // Fungsi terbilang (sederhana)
  const terbilang = (angka: number) => {
    const bilangan = [
      "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
    ]
    
    if (angka < 12) return bilangan[angka]
    if (angka < 20) return bilangan[angka - 10] + " Belas"
    if (angka < 100) return bilangan[Math.floor(angka / 10)] + " Puluh " + bilangan[angka % 10]
    if (angka < 200) return "Seratus " + terbilang(angka - 100)
    if (angka < 1000) return bilangan[Math.floor(angka / 100)] + " Ratus " + terbilang(angka % 100)
    if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + " Ribu " + terbilang(angka % 1000)
    if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + " Juta " + terbilang(angka % 1000000)
    
    return "Angka terlalu besar"
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-white p-8 max-w-5xl mx-auto shadow-2xl print:shadow-none print:p-0">
      {/* Tombol Aksi (hilang saat print) */}
      <div className="flex justify-end gap-4 mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Printer size={18} />
          Print / PDF
        </button>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <Download size={18} />
          Download PDF
        </button>
      </div>

      {/* SURAT PENAWARAN */}
      <div ref={componentRef} className="border border-gray-300 p-8 rounded-lg print:border-none">
        
        {/* ===== KOP SURAT ===== */}
        <div className="border-b-4 border-red-600 pb-6 mb-6">
          <div className="flex items-start gap-4">
            {/* LOGO */}
            <div className="w-20 h-20 relative">
              <Image
                src="/logo-mpp.png"
                alt="PT Manggala Putra Persada"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>

            {/* COMPANY INFO */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                PT Manggala Putra Persada
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Engineering-Led Construction Contractor
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2 text-xs text-gray-600">
                <div>📞 (021) 1234-5678</div>
                <div>📧 info@mpp-engineering.com</div>
                <div>📱 0812-9739-6612</div>
                <div>📍 Bekasi, Jawa Barat</div>
              </div>
            </div>

            {/* NOMOR SURAT */}
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">No. RAB/{data.nomor}</p>
              <p className="text-xs text-gray-500 mt-1">Tanggal: {data.tanggal}</p>
            </div>
          </div>
        </div>

        {/* ===== JUDUL ===== */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
            RENCANA ANGGARAN BIAYA (RAB)
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Proyek: {data.customer.proyek}
          </p>
        </div>

        {/* ===== DATA CUSTOMER ===== */}
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Data Customer:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium text-gray-700">Nama:</span> {data.customer.nama}</p>
              {data.customer.perusahaan && (
                <p><span className="font-medium text-gray-700">Perusahaan:</span> {data.customer.perusahaan}</p>
              )}
              <p><span className="font-medium text-gray-700">Alamat:</span> {data.customer.alamat}</p>
            </div>
            <div>
              <p><span className="font-medium text-gray-700">Nama Proyek:</span> {data.customer.proyek}</p>
              <p><span className="font-medium text-gray-700">Lokasi:</span> {data.customer.lokasi}</p>
            </div>
          </div>
        </div>

        {/* ===== TABEL RAB ===== */}
        <div className="mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-red-600 text-white">
                <th className="py-3 px-2 text-center w-12">No</th>
                <th className="py-3 px-4 text-left">Uraian Pekerjaan</th>
                <th className="py-3 px-2 text-center w-20">Volume</th>
                <th className="py-3 px-2 text-center w-20">Satuan</th>
                <th className="py-3 px-3 text-right w-32">Harga Satuan (Rp)</th>
                <th className="py-3 px-3 text-right w-32">Total (Rp)</th>
              </tr>
            </thead>
            <tbody className="border-x border-gray-300">
              {data.items.map((item) => (
                <tr key={item.no} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-2 px-2 text-center">{item.no}</td>
                  <td className="py-2 px-4">{item.uraian}</td>
                  <td className="py-2 px-2 text-center">{item.volume}</td>
                  <td className="py-2 px-2 text-center">{item.satuan}</td>
                  <td className="py-2 px-3 text-right font-mono">
                    {formatCurrency(item.hargaSatuan)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== TOTAL ===== */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="flex justify-between py-2 text-sm">
              <span className="font-medium">Subtotal:</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm border-t border-gray-300">
              <span className="font-medium">PPN 11%:</span>
              <span className="font-mono">{formatCurrency(ppn)}</span>
            </div>
            <div className="flex justify-between py-3 text-base font-bold border-t-2 border-gray-800">
              <span>TOTAL:</span>
              <span className="font-mono text-red-600">{formatCurrency(total)}</span>
            </div>
            <div className="mt-2 text-xs text-gray-600 italic text-right">
              * {terbilang(total)} Rupiah
            </div>
          </div>
        </div>

        {/* ===== CATATAN ===== */}
        {data.catatan && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Catatan:</h4>
            <p className="text-sm text-gray-700 whitespace-pre-line">{data.catatan}</p>
          </div>
        )}

        {/* ===== VALIDITAS ===== */}
        <div className="mb-8 text-sm text-gray-600">
          <p>Penawaran ini berlaku sampai dengan: <span className="font-semibold">{data.berlakuHingga}</span></p>
        </div>

        {/* ===== TANDA TANGAN ===== */}
        <div className="flex justify-end mt-12">
          <div className="text-center w-64">
            <p className="text-sm text-gray-600 mb-8">Bekasi, {data.tanggal}</p>
            <p className="font-semibold text-gray-900">PT Manggala Putra Persada</p>
            <div className="my-4 flex justify-center">
              {/* Tempat tanda tangan */}
              <div className="w-40 h-16 border-b-2 border-gray-400" />
            </div>
            <p className="font-semibold">(Nama Direktur)</p>
            <p className="text-xs text-gray-500 mt-1">Direktur</p>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>PT Manggala Putra Persada - Engineering-Led Construction Contractor</p>
          <p></p>
          <p>Bekasi, Jawa Barat - Indonesia | Telp: (021) 1234-5678 | Email: info@mpp-engineering.com</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body {
            background: white;
            font-size: 12pt;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
