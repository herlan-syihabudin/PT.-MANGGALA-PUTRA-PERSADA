import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

/* ======================
   SEO METADATA (LOCK)
====================== */
export const metadata: Metadata = {
  title:
    "Steel Structure Contractor Indonesia | Industrial Steel Construction – PT Manggala Putra Persada",
  description:
    "PT Manggala Putra Persada (MPP Engineering) is a steel structure contractor in Indonesia providing engineering, fabrication, and erection services for industrial buildings, factories, and warehouses.",
}

export default function StrukturBajaPage() {
  return (
    <section className="bg-white">

      {/* ======================
          HERO SECTION
      ====================== */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT: TEXT */}
          <div>
            {/* PRIMARY SEO H1 */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Steel Structure Contractor in Indonesia
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Engineering-led steel structure services covering design
              coordination, fabrication, and erection for industrial,
              commercial, and warehouse projects with strict quality and
              safety control.
            </p>
          </div>

          {/* RIGHT: IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
            <Image
              src="/projects/steel-hero.jpg"
              alt="Steel structure contractor for industrial building construction in Indonesia"
              fill
              priority
              className="object-cover"
            />
          </div>

        </div>
      </div>

      {/* ======================
          CONTENT SECTION
      ====================== */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">

        {/* MAIN CONTENT */}
        <div className="md:col-span-2 space-y-10">

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Steel Structure Engineering Scope
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our steel structure services cover the complete process from
              engineering detailing, material fabrication, surface treatment,
              to on-site erection. All works are executed in accordance with
              approved drawings, specifications, and applicable engineering
              standards to ensure structural safety and long-term durability.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Steel Fabrication & Erection Services
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Structural steel design coordination & shop drawings</li>
              <li>Fabrication of steel members (H-Beam, WF, I-Beam, Plate)</li>
              <li>Surface treatment (blasting & coating system)</li>
              <li>Steel erection and alignment on site</li>
              <li>High-strength bolting and welding works</li>
              <li>Dimensional control and as-built documentation</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Technical Standards & Quality Assurance
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Steel structure works are carried out under engineering
              supervision and comply with SNI, AISC, AWS, and applicable
              international standards. Fabrication and erection activities
              are supported by inspection and test plans (ITP), material
              traceability, and systematic quality control procedures.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Safety & Execution Control
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All steel fabrication and erection activities are performed
              with strict HSE implementation, including lifting plans,
              work-at-height procedures, and coordinated site execution
              to minimize risk and ensure safe project delivery.
            </p>
          </div>

        </div>

        {/* ======================
            SIDEBAR
        ====================== */}
        <aside className="space-y-8">

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Typical Steel Structure Applications
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Industrial factories & manufacturing plants</li>
              <li>Warehouses & logistics buildings</li>
              <li>Steel canopies & platforms</li>
              <li>Pipe racks & supporting structures</li>
              <li>Commercial & utility buildings</li>
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">
              Why Choose Our Steel Structure Services
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Engineering-led detailing & execution</li>
              <li>Controlled fabrication & erection process</li>
              <li>Strict quality & dimensional control</li>
              <li>Clear documentation & reporting</li>
              <li>Strong focus on safety, schedule, and cost efficiency</li>
            </ul>
          </div>

          <Link
            href="/kontak"
            className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Consult Steel Structure Project
          </Link>

        </aside>
      </div>
    </section>
  )
}
