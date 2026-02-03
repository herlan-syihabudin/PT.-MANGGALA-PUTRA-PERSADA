import Image from "next/image"
import Link from "next/link"

export default function KlienPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Clients & <span className="text-red-600">Partners</span>
          </h1>
          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            PT Manggala Putra Persada collaborates with clients and strategic
            partners across industrial, commercial, and residential sectors.
            Every partnership is built on engineering discipline, transparency,
            and long-term project accountability.
          </p>
        </div>

        {/* CLIENT SECTORS */}
        <div className="grid md:grid-cols-3 gap-10 mb-24">
          <div className="border rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Industrial Clients
            </h3>
            <p className="text-gray-600">
              Manufacturing plants, warehouses, and industrial facilities
              requiring structured engineering execution and strict HSE
              compliance.
            </p>
          </div>

          <div className="border rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Commercial Clients
            </h3>
            <p className="text-gray-600">
              Office buildings, commercial spaces, and mixed-use developments
              delivered through coordinated design and construction systems.
            </p>
          </div>

          <div className="border rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Residential Clients
            </h3>
            <p className="text-gray-600">
              Residential developments and private clients supported with
              quality-driven execution and controlled project timelines.
            </p>
          </div>
        </div>

        {/* PARTNERS */}
        <div className="mb-24">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
            Strategic <span className="text-red-600">Partners</span>
          </h2>

          <p className="text-lg text-gray-700 max-w-3xl mb-10">
            We work closely with trusted partners to ensure technical accuracy,
            supply reliability, and seamless project execution across all
            disciplines.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {/* PARTNER CARD */}
            <div className="border rounded-xl p-6 text-center">
              <p className="font-semibold text-gray-900">
                Engineering Consultants
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Structural & MEP specialists
              </p>
            </div>

            <div className="border rounded-xl p-6 text-center">
              <p className="font-semibold text-gray-900">
                Material Suppliers
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Steel, concrete, and MEP materials
              </p>
            </div>

            <div className="border rounded-xl p-6 text-center">
              <p className="font-semibold text-gray-900">
                Fabricators & Vendors
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Steel fabrication & finishing
              </p>
            </div>

            <div className="border rounded-xl p-6 text-center">
              <p className="font-semibold text-gray-900">
                Project Stakeholders
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Owners, consultants, authorities
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t pt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Interested in Working With Us?
          </h3>
          <p className="text-gray-700 mb-8">
            Let us discuss how structured engineering and professional execution
            can support your next project.
          </p>

          <Link
            href="/kontak"
            className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Start a Collaboration
          </Link>
        </div>

      </div>
    </section>
  )
}
