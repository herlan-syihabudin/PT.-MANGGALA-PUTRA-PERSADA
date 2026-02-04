import Link from "next/link"
import Image from "next/image"

export default function MEPPage() {
  const faqs = [
    {
      question: "Apa saja lingkup pekerjaan MEP yang ditangani?",
      answer:
        "Lingkup pekerjaan MEP meliputi sistem Mechanical (HVAC & piping), Electrical (panel, distribusi daya, lighting), serta Plumbing & Fire Protection untuk proyek industri dan komersial.",
    },
    {
      question: "Apakah pekerjaan MEP terkoordinasi dengan struktur dan arsitektur?",
      answer:
        "Ya. Seluruh pekerjaan MEP dikoordinasikan secara engineering dengan struktur dan arsitektur untuk menghindari clash serta memastikan instalasi rapi dan fungsional.",
    },
    {
      question: "Apakah PT Manggala Putra Persada menangani HVAC industri?",
      answer:
        "Kami menangani sistem HVAC industri seperti VRV/VRF, chilled water, AHU, ventilation, dan exhaust system sesuai kebutuhan operasional bangunan.",
    },
    {
      question: "Apakah tersedia pekerjaan testing dan commissioning?",
      answer:
        "Ya. Seluruh sistem MEP melalui proses testing, commissioning, dan performance verification sebelum handover proyek.",
    },
    {
      question: "Apakah layanan MEP mencakup sistem fire protection?",
      answer:
        "Layanan MEP mencakup fire hydrant, sprinkler, fire pump, dan sistem proteksi kebakaran sesuai standar teknis dan regulasi yang berlaku.",
    },
  ]

  return (
    <section className="bg-white">
      {/* ===== SCHEMA SEO: SERVICE ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id":
              "https://pt-manggala-putra-persada.vercel.app/layanan/mep#service",
            name: "Mechanical, Electrical & Plumbing (MEP) Engineering Services",
            description:
              "Professional Mechanical, Electrical, and Plumbing (MEP) engineering and installation services in Indonesia for industrial and commercial projects.",
            provider: {
              "@type": "Organization",
              name: "PT Manggala Putra Persada",
              url: "https://pt-manggala-putra-persada.vercel.app",
            },
            areaServed: { "@type": "Country", name: "Indonesia" },
            serviceType: [
              "MEP Contractor",
              "HVAC Contractor",
              "Electrical Contractor",
              "Plumbing & Fire Protection Contractor",
            ],
          }),
        }}
      />

      {/* ===== SCHEMA SEO: FAQ ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.answer,
              },
            })),
          }),
        }}
      />

      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Mechanical, Electrical & Plumbing (MEP) Engineering
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Professional MEP engineering and installation services for
              industrial and commercial projects in Indonesia, delivered with
              coordinated design and strict technical compliance.
            </p>
          </div>

          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
            <Image
              src="/projects/mep-hero.jpg"
              alt="MEP contractor for industrial and commercial buildings in Indonesia"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            MEP Scope of Work
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our MEP services include engineering coordination, installation,
            testing, and commissioning of mechanical, electrical, plumbing, and
            fire protection systems to ensure safety, efficiency, and long-term
            reliability.
          </p>
        </div>

        <aside className="space-y-8">
          <Link
            href="/kontak"
            className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Konsultasi Proyek MEP
          </Link>
        </aside>
      </div>

      {/* ===== FAQ UI ===== */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-10 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {faqs.map((item, i) => (
              <div key={i} className="border rounded-xl p-6 bg-white">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  )
}
