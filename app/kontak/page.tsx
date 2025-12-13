"use client"

import { useState } from "react"

export default function KontakPage() {
  const [form, setForm] = useState({
    nama: "",
    perusahaan: "",
    whatsapp: "",
    jenis: "",
    pesan: "",
  })

  const handleSubmit = () => {
    const text = `Halo PT Manggala Putra Persada,
    
Nama: ${form.nama}
Perusahaan: ${form.perusahaan}
WhatsApp: ${form.whatsapp}
Jenis Proyek: ${form.jenis}

Pesan:
${form.pesan}`

    window.open(
      `https://wa.me/6281297396612?text=${encodeURIComponent(text)}`,
      "_blank"
    )
  }

  return (
    <section className="container mx-auto px-6 py-20 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">
        Hubungi <span className="text-red-600">Kami</span>
      </h1>

      <p className="text-gray-700 mb-10">
        Silakan isi form di bawah ini untuk konsultasi atau diskusi awal proyek.
      </p>

      <div className="grid gap-4">
        <input
          placeholder="Nama"
          className="border p-3 rounded"
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
        />
        <input
          placeholder="Perusahaan (opsional)"
          className="border p-3 rounded"
          onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
        />
        <input
          placeholder="Nomor WhatsApp"
          className="border p-3 rounded"
          onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
        />
        <select
          className="border p-3 rounded"
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
          className="border p-3 rounded h-32"
          onChange={(e) => setForm({ ...form, pesan: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700 transition"
        >
          Kirim & Konsultasi via WhatsApp
        </button>
      </div>
    </section>
  )
}
