"use client"

import { useState } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kontak | PT Manggala Putra Persada",
  description:
    "Hubungi PT Manggala Putra Persada untuk konsultasi proyek konstruksi dan engineering. Diskusi awal proyek pabrik, perumahan, dan pekerjaan MEP.",
  keywords: [
    "kontak kontraktor",
    "jasa konstruksi bekasi",
    "konsultasi proyek konstruksi",
    "engineering dan konstruksi",
    "PT Manggala Putra Persada",
  ],
  openGraph: {
    title: "Kontak PT Manggala Putra Persada",
    description:
      "Hubungi kami untuk konsultasi proyek konstruksi dan engineering.",
    url: "https://pt-manggala-putra-persada.vercel.app/kontak",
    siteName: "PT Manggala Putra Persada",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kontak PT Manggala Putra Persada",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
}

export default function KontakPage() {
  const [form, setForm] = useState({
    nama: "",
    perusahaan: "",
    whatsapp: "",
    jenis: "",
    pesan: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nama || !form.whatsapp) {
      alert("Nama dan nomor WhatsApp wajib diisi.")
      return
    }

    const text = `Halo PT Manggala Putra Persada,

Nama: ${form.nama}
Perusahaan: ${form.perusahaan || "-"}
WhatsApp: ${form.whatsapp}
Jenis Proyek: ${form.jenis || "-"}

Pesan:
${form.pesan || "-"}`

    window.open(
      `https://wa.me/6281297396612?text=${encodeURIComponent(text)}`,
      "_blank"
    )
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6 text-gray-900">
          Hubungi <span className="text-red-600">Kami</span>
        </h1>

        <p className="text-lg text-gray-700 mb-10">
          Silakan isi form di bawah ini untuk konsultasi atau diskusi awal proyek.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            placeholder="Nama *"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />

          <input
            placeholder="Perusahaan (opsional)"
            value={form.perusahaan}
            onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
          />

          <input
            placeholder="Nomor WhatsApp *"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />

          <select
            value={form.jenis}
            onChange={(e) => setForm({ ...form, jenis: e.target.value })}
          >
            <option value="">Pilih Jenis Proyek</option>
            <option value="Pabrik / Gudang">Pabrik / Gudang</option>
            <option value="Perumahan / Hunian">Perumahan / Hunian</option>
            <option value="Renovasi">Renovasi</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          <textarea
            placeholder="Pesan singkat"
            value={form.pesan}
            onChange={(e) => setForm({ ...form, pesan: e.target.value })}
          />

          <button
            type="submit"
            className="bg-red-600 text-white py-3 rounded-md font-semibold hover:bg-red-700 transition"
          >
            Kirim & Konsultasi via WhatsApp
          </button>
        </form>
      </div>
    </section>
  )
}
