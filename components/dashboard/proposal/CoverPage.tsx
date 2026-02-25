import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import type { ProposalData } from "./types"

interface CoverPageProps {
  data: ProposalData
}

export function CoverPage({ data }: CoverPageProps) {
  return (
    <div className="bg-white min-h-[1123px] relative overflow-hidden">
      {/* ===== BACKGROUND ACCENT ===== */}
      <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 p-12 flex flex-col min-h-[1123px]">
        
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-start">
          {/* LOGO */}
          <div>
            <Image
              src="/logo-mpp.png"
              alt="PT Manggala Putra Persada"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* NOMOR & TANGGAL */}
          <div className="text-right">
            <p className="text-sm text-gray-500">No. Penawaran</p>
            <p className="text-lg font-semibold text-gray-900">{data.nomor}</p>
            <p className="text-sm text-gray-500 mt-2">Tanggal</p>
            <p className="text-base text-gray-900">{data.tanggal}</p>
          </div>
        </div>

        {/* ===== JUDUL UTAMA ===== */}
        <div className="mt-16 text-center">
          <h1 className="text-5xl font-black tracking-tight text-gray-900">
            SURAT PENAWARAN HARGA
          </h1>
          <p className="text-xl text-gray-500 mt-2 tracking-wider">
            COMMERCIAL PROPOSAL
          </p>

          {/* Garis merah tipis */}
          <div className="w-24 h-0.5 bg-red-600 mx-auto mt-6" />
        </div>

        {/* ===== KEPADA ===== */}
        <div className="mt-16">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
            Kepada Yth.
          </p>
          <p className="text-2xl font-bold text-gray-900">{data.customer.nama}</p>
          <p className="text-lg text-gray-700">{data.customer.perusahaan}</p>
          <p className="text-gray-600 mt-1">{data.customer.alamat}</p>
        </div>

        {/* ===== PROYEK ===== */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
            Perihal
          </p>
          <p className="text-xl font-semibold text-gray-900">{data.proyek.nama}</p>
          <p className="text-gray-600 mt-1">{data.proyek.lokasi}</p>
        </div>

        {/* ===== TOTAL PENAWARAN (HIGHLIGHT) ===== */}
        <div className="mt-16 bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
            Total Penawaran
          </p>
          <p className="text-4xl md:text-5xl font-black text-red-600">
            {formatCurrency(data.total)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Sudah termasuk PPN 11%
          </p>
        </div>

        {/* ===== VALIDITY ===== */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
            Berlaku Hingga
          </p>
          <p className="text-lg font-semibold text-gray-900">{data.validity}</p>
        </div>

        {/* ===== TANDA TANGAN ===== */}
        <div className="mt-auto pt-16">
          <div className="flex justify-end">
            <div className="text-center w-72">
              <p className="text-gray-600 mb-8">Bekasi, {data.tanggal}</p>
              <p className="font-semibold text-gray-900">
                PT Manggala Putra Persada
              </p>
              <div className="my-6 flex justify-center">
                <div className="w-48 h-16 border-b-2 border-gray-400" />
              </div>
              <p className="font-semibold">(Nama Direktur)</p>
              <p className="text-sm text-gray-500 mt-1">Direktur</p>
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>PT Manggala Putra Persada - Engineering-Led Construction Contractor</p>
        </div>
      </div>
    </div>
  )
}
