"use client"

import { useState } from "react"

export default function KontakPage() {
  const [form, setForm] = useState({
    nama: "",
    perusahaan: "",
    whatsapp: "",
    jenis: "",
    estimasi: "",
    pesan: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nama || !form.whatsapp) {
      alert("Name and WhatsApp number are required.")
      return
    }

    const text = `Hello PT Manggala Putra Persada,

Project Inquiry Details:

Name: ${form.nama}
Company: ${form.perusahaan || "-"}
WhatsApp: ${form.whatsapp}
Project Type: ${form.jenis || "-"}
Estimated Budget: ${form.estimasi || "-"}

Message:
${form.pesan || "-"}

Thank you.`

    window.open(
      `https://wa.me/6281297396612?text=${encodeURIComponent(text)}`,
      "_blank"
    )
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6 text-gray-900">
          Project <span className="text-red-600">Inquiry</span>
        </h1>

        <p className="text-lg text-gray-700 mb-10 max-w-2xl">
          Please complete the form below to discuss your project requirements.
          Our team will review your inquiry and respond accordingly.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <input
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Full Name *"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />

          <input
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Company / Organization"
            value={form.perusahaan}
            onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
          />

          <input
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="WhatsApp Number *"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />

          <select
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={form.jenis}
            onChange={(e) => setForm({ ...form, jenis: e.target.value })}
          >
            <option value="">Select Project Type</option>
            <option value="Industrial / Factory / Warehouse">
              Industrial / Factory / Warehouse
            </option>
            <option value="Residential Development">
              Residential Development
            </option>
            <option value="Renovation">
              Renovation
            </option>
            <option value="Others">
              Others
            </option>
          </select>

          <select
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={form.estimasi}
            onChange={(e) => setForm({ ...form, estimasi: e.target.value })}
          >
            <option value="">Estimated Project Budget (Optional)</option>
            <option value="< 500 Million IDR">&lt; 500 Million IDR</option>
            <option value="500M – 1B IDR">500M – 1B IDR</option>
            <option value="> 1B IDR">&gt; 1B IDR</option>
          </select>

          <textarea
            className="border border-gray-300 rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Brief project description"
            value={form.pesan}
            onChange={(e) => setForm({ ...form, pesan: e.target.value })}
          />

          <button
            type="submit"
            className="bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Submit & Discuss via WhatsApp
          </button>
        </form>
      </div>
    </section>
  )
}
