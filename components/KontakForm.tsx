"use client"

import { useState } from "react"
import { ChevronRight, Shield } from "lucide-react"

export default function KontakForm() {
  const [form, setForm] = useState({
    nama: "",
    perusahaan: "",
    whatsapp: "",
    jenis: "",
    estimasi: "",
    pesan: "",
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateWhatsApp = (number: string) => {
    const digits = number.replace(/\D/g, "")
    return digits.length >= 10
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi
    if (!form.nama.trim()) {
      alert("Nama lengkap harus diisi.")
      return
    }

    if (!form.whatsapp.trim()) {
      alert("Nomor WhatsApp harus diisi.")
      return
    }

    if (!validateWhatsApp(form.whatsapp)) {
      alert("Nomor WhatsApp minimal 10 digit.")
      return
    }

    setIsSubmitting(true)

    const text = `Hello PT Manggala Putra Persada,

Saya ingin mendiskusikan proyek dengan detail berikut:

Nama: ${form.nama}
Perusahaan: ${form.perusahaan || "-"}
WhatsApp: ${form.whatsapp}
Tipe Proyek: ${form.jenis || "-"}
Estimasi Budget: ${form.estimasi || "-"}

Deskripsi Singkat:
${form.pesan || "-"}

Terima kasih.`

    window.open(
      `https://wa.me/6281297396612?text=${encodeURIComponent(text)}`,
      "_blank"
    )
    
    setIsSubmitting(false)
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-8 shadow-soft bg-white">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Honeypot (anti-spam) */}
        <input
          type="text"
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="form-group">
          <label htmlFor="nama" className="form-label">
            Nama Lengkap <span className="text-red-600">*</span>
          </label>
          <input
            id="nama"
            type="text"
            placeholder="John Doe"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="perusahaan" className="form-label">
            Perusahaan / Instansi
          </label>
          <input
            id="perusahaan"
            type="text"
            placeholder="PT. Contoh"
            value={form.perusahaan}
            onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="whatsapp" className="form-label">
            Nomor WhatsApp <span className="text-red-600">*</span>
          </label>
          <input
            id="whatsapp"
            type="tel"
            placeholder="0812 3456 7890"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            required
            className="form-input"
          />
          <p className="form-hint">Minimal 10 digit, bisa dengan atau tanpa kode negara</p>
        </div>

        <div className="form-group">
          <label htmlFor="jenis" className="form-label">
            Tipe Proyek
          </label>
          <select
            id="jenis"
            value={form.jenis}
            onChange={(e) => setForm({ ...form, jenis: e.target.value })}
            className="form-select"
          >
            <option value="">Pilih Tipe Proyek</option>
            <option value="Industrial / Factory / Warehouse">
              Industrial / Factory / Warehouse
            </option>
            <option value="Commercial Building">Commercial Building</option>
            <option value="Residential Development">
              Residential Development
            </option>
            <option value="Renovation">Renovation</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="estimasi" className="form-label">
            Estimasi Budget (Opsional)
          </label>
          <select
            id="estimasi"
            value={form.estimasi}
            onChange={(e) => setForm({ ...form, estimasi: e.target.value })}
            className="form-select"
          >
            <option value="">Pilih Estimasi Budget</option>
            <option value="< 500 Million IDR">&lt; 500 Juta IDR</option>
            <option value="500M – 1B IDR">500 Juta – 1 Miliar IDR</option>
            <option value="> 1B IDR">&gt; 1 Miliar IDR</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="pesan" className="form-label">
            Deskripsi Singkat Proyek
          </label>
          <textarea
            id="pesan"
            placeholder="Jelaskan kebutuhan proyek Anda..."
            value={form.pesan}
            onChange={(e) => setForm({ ...form, pesan: e.target.value })}
            className="form-textarea"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full shadow-lg shadow-red-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
        >
          {isSubmitting ? (
            "Memproses..."
          ) : (
            <>
              Submit & Diskusi via WhatsApp
              <ChevronRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Tim kami biasanya merespon dalam 1 hari kerja
        </p>
      </form>
    </div>
  )
}
