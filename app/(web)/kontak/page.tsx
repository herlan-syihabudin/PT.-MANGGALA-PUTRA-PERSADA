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
      alert("Full name and WhatsApp number are required.")
      return
    }

    const text = `Hello PT Manggala Putra Persada,

I would like to discuss a project with the following details:

Name: ${form.nama}
Company: ${form.perusahaan || "-"}
WhatsApp: ${form.whatsapp}
Project Type: ${form.jenis || "-"}
Estimated Budget: ${form.estimasi || "-"}

Project Brief:
${form.pesan || "-"}

Thank you.`

    window.open(
      `https://wa.me/6281297396612?text=${encodeURIComponent(text)}`,
      "_blank"
    )
  }

  return (
    <section className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">

        {/* LEFT – INFO */}
        <div>
          <span className="inline-block mb-4 text-sm font-semibold text-gold">
            Project Inquiry
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Discuss Your <span className="text-red-600">Project</span>
          </h1>

          <p className="mt-6 text-lg text-gray-700 max-w-xl">
            PT Manggala Putra Persada provides engineering-led construction
            solutions for industrial, commercial, and residential projects.
            Submit your inquiry and our team will respond accordingly.
          </p>

          <div className="mt-10 space-y-4 text-sm text-gray-700">
            <p><strong>Office:</strong> Bekasi, West Java – Indonesia</p>
            <p><strong>Email:</strong> info@mpp-engineering.com</p>
            <p><strong>Business Hours:</strong> Mon–Fri | 08.00 – 17.00 WIB</p>
            <p className="text-xs text-gray-500">
              Your information will be kept confidential and used solely for
              project communication purposes.
            </p>
          </div>
        </div>

        {/* RIGHT – FORM */}
        <div className="border border-gray-200 rounded-2xl p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="grid gap-5">

            <input
              placeholder="Full Name *"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
            />

            <input
              placeholder="Company / Organization"
              value={form.perusahaan}
              onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
            />

            <input
              placeholder="WhatsApp Number *"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              required
            />

            <select
              value={form.jenis}
              onChange={(e) => setForm({ ...form, jenis: e.target.value })}
            >
              <option value="">Select Project Type</option>
              <option value="Industrial / Factory / Warehouse">
                Industrial / Factory / Warehouse
              </option>
              <option value="Commercial Building">
                Commercial Building
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
              value={form.estimasi}
              onChange={(e) => setForm({ ...form, estimasi: e.target.value })}
            >
              <option value="">Estimated Project Budget (Optional)</option>
              <option value="< 500 Million IDR">&lt; 500 Million IDR</option>
              <option value="500M – 1B IDR">500M – 1B IDR</option>
              <option value="> 1B IDR">&gt; 1B IDR</option>
            </select>

            <textarea
              placeholder="Brief project description"
              value={form.pesan}
              onChange={(e) => setForm({ ...form, pesan: e.target.value })}
              className="min-h-[120px]"
            />

            <button
              type="submit"
              className="btn-primary"
            >
              Submit & Discuss via WhatsApp
            </button>

            <p className="text-xs text-gray-500 text-center">
              Our team typically responds within 1 business day.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
