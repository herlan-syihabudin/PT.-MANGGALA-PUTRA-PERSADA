"use client"

import { useState } from "react"
import { ChevronRight, Shield } from "lucide-react"
import { toast } from "sonner"

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6281229222463"

const initialForm = {
  nama: "",
  perusahaan: "",
  whatsapp: "",
  jenis: "",
  estimasi: "",
  pesan: "",
}

export default function KontakForm() {
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateWhatsApp = (number: string) => {
    const digits = number.replace(/\D/g, "")
    if (digits.length < 10 || digits.length > 15) return false
    // Validasi format Indonesia (62 atau 08)
    return digits.startsWith('62') || digits.startsWith('08')
  }

  const formatWhatsApp = (number: string) => {
    const digits = number.replace(/\D/g, "")
    if (digits.startsWith('62')) return `+${digits}`
    if (digits.startsWith('08')) return `+62 ${digits.slice(1)}`
    return number
  }
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Honeypot anti spam
    const honeypot = (e.currentTarget as HTMLFormElement).website?.value
    if (honeypot) {
      console.log("Spam detected")
      return
    }

    // Validasi
    if (!form.nama.trim()) {
      toast.error("Nama lengkap harus diisi")
      return
    }

    if (!form.whatsapp.trim()) {
      toast.error("Nomor WhatsApp harus diisi")
      return
    }

    if (!validateWhatsApp(form.whatsapp)) {
      toast.error("Nomor WhatsApp tidak valid (minimal 10 digit, format 62xxx atau 08xxx)")
      return
    }

    setIsSubmitting(true)

    const text = `Hello PT Manggala Putra Persada,

Saya ingin mendiskusikan proyek dengan detail berikut:

Nama: ${form.nama}
Perusahaan: ${form.perusahaan || "-"}
WhatsApp: ${formatWhatsApp(form.whatsapp)}
Tipe Proyek: ${form.jenis || "-"}
Estimasi Budget: ${form.estimasi || "-"}

Deskripsi Singkat:
${form.pesan || "-"}

Terima kasih.`

    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank"
    )

    // Success feedback
    toast.success("Pesan berhasil dikirim via WhatsApp")
    
    // Reset form
    setForm(initialForm)
    setIsSubmitting(false)
  }
  
  return (
    <div className="border border-gray-200 rounded-2xl p-8 shadow-lg bg-white">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Honeypot (anti-spam) */}
        <input
          type="text"
          name="website"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />
        <input
          type="hidden"
          name="form_loaded"
          value={Date.now()}
        />

        <div>
          <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-600">*</span>
          </label>
          <input
            id="nama"
            type="text"
            placeholder="John Doe"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label htmlFor="perusahaan" className="block text-sm font-medium text-gray-700 mb-1">
            Perusahaan / Instansi
          </label>
          <input
            id="perusahaan"
            type="text"
            placeholder="PT. Contoh"
            value={form.perusahaan}
            onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
            Nomor WhatsApp <span className="text-red-600">*</span>
          </label>
          <input
            id="whatsapp"
            type="tel"
            placeholder="0812 3456 7890"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimal 10 digit, format 62xxx atau 08xxx
          </p>
        </div>

        <div>
          <label htmlFor="jenis" className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Proyek
          </label>
          <select
            id="jenis"
            value={form.jenis}
            onChange={(e) => setForm({ ...form, jenis: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition bg-white"
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

        <div>
          <label htmlFor="estimasi" className="block text-sm font-medium text-gray-700 mb-1">
            Estimasi Budget (Opsional)
          </label>
          <select
            id="estimasi"
            value={form.estimasi}
            onChange={(e) => setForm({ ...form, estimasi: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition bg-white"
          >
            <option value="">Pilih Estimasi Budget</option>
            <option value="< 500 Million IDR">&lt; 500 Juta IDR</option>
            <option value="500M – 1B IDR">500 Juta – 1 Miliar IDR</option>
            <option value="> 1B IDR">&gt; 1 Miliar IDR</option>
          </select>
        </div>

        <div>
          <label htmlFor="pesan" className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi Singkat Proyek
          </label>
          <textarea
            id="pesan"
            placeholder="Jelaskan kebutuhan proyek Anda..."
            value={form.pesan}
            onChange={(e) => setForm({ ...form, pesan: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20 hover:shadow-xl"
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
