import { RABPreview, RABData } from "@/components/dashboard/rab-preview"

export default function PreviewTestPage() {
  const dummyData: RABData = {
    nomor: "001/II/2026",
    tanggal: "24 Februari 2026",
    customer: {
      nama: "Bapak Herlan Syihabudin",
      perusahaan: "PT Bhaskara Buana Mulya",
      alamat: "Grand Wisata Bekasi",
      proyek: "Pekerjaan Struktur Baja",
      lokasi: "Cikarang, Jawa Barat",
    },
    items: [
      {
        no: 1,
        uraian: "Pekerjaan Struktur Baja WF 300",
        volume: 10,
        satuan: "Ton",
        hargaSatuan: 15000000,
        total: 150000000,
      },
      {
        no: 2,
        uraian: "Pekerjaan Pengecatan Epoxy",
        volume: 500,
        satuan: "m2",
        hargaSatuan: 75000,
        total: 37500000,
      },
    ],
    catatan: "Harga sudah termasuk mobilisasi dan alat kerja.\nBelum termasuk pekerjaan tambahan di luar scope.",
    berlakuHingga: "31 Maret 2026",
  }

  return <RABPreview data={dummyData} />
}
