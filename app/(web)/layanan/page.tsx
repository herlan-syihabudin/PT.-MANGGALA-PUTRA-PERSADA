import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Engineering & Construction Services | PT Manggala Putra Persada",
  description:
    "Engineering-led construction services in Indonesia including civil construction, steel structures, MEP systems, interior fit-out, and design-build projects.",
  alternates: {
    canonical: "https://mppindo.com/layanan",
  },
  openGraph: {
    title: "Engineering & Construction Services | PT Manggala Putra Persada",
    description:
      "Integrated engineering-led construction services for industrial and commercial projects.",
    url: "https://mppindo.com/layanan",
    siteName: "PT Manggala Putra Persada",
    type: "website",
    images: [
      {
        url: "https://mppindo.com/images/og-layanan.jpg",
        width: 1200,
        height: 630,
        alt: "Engineering & Construction Services",
      },
    ],
  },
}

export default function LayananPage() {
  return (
    <section className="py-28 bg-white">

      {/* =========================
          SCHEMA SEO – SERVICE HUB
      ========================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Engineering & Construction Services",
            description:
              "Engineering-led construction services in Indonesia covering civil, structural, steel structure, MEP, fit-out, and design & build projects.",
            url: "https://mppindo.com/layanan",
            mainEntity: {
              "@type": "ItemList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Civil & Structural Construction",
                  url: "https://mppindo.com/layanan/konstruksi-sipil",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Steel Structure Engineering",
                  url: "https://mppindo.com/layanan/struktur-baja",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Mechanical Electrical Plumbing (MEP)",
                  url: "https://mppindo.com/layanan/mep",
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "Interior & Fit-Out Services",
                  url: "https://mppindo.com/layanan/fit-out",
                },
                {
                  "@type": "ListItem",
                  position: 5,
                  name: "Design & Build Construction",
                  url: "https://mppindo.com/layanan/design-build",
                },
              ],
            },
            provider: {
  "@type": "Organization",
  name: "PT Manggala Putra Persada",
  alternateName: "MPP Engineering",
  url: "https://mppindo.com",
  logo: "https://mppindo.com/logo-mp.png"
},
          }),
        }}
      />

      {/* =========================
          BREADCRUMB SCHEMA
      ========================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://mppindo.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Services",
                item: "https://mppindo.com/layanan",
              },
            ],
          }),
        }}
      />

      <div className="max-w-7xl mx-auto px-6">

        {/* SECTION TITLE */}
        <div className="mb-16 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Engineering & <span className="text-red-600">Construction Services</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Integrated engineering-led construction services for industrial,
            commercial, and residential projects, delivered through structured
            planning, execution, and quality control.
          </p>
        </div>

        {/* SERVICE OVERVIEW CARDS */}
        <div className="grid gap-6 md:grid-cols-3 mb-20">
          {[
            {
              title: "Civil & Structural",
              desc: "Concrete works, foundations, and structural construction.",
              link: "/layanan/konstruksi-sipil",
            },
            {
              title: "Steel Structure",
              desc: "Fabrication and erection of industrial steel structures.",
              link: "/layanan/struktur-baja",
            },
            {
              title: "MEP Systems",
              desc: "Mechanical, Electrical, Plumbing, HVAC & Fire Protection.",
              link: "/layanan/mep",
            },
            {
              title: "Interior & Fit-Out",
              desc: "Functional interior construction and finishing works.",
              link: "/layanan/fit-out",
            },
            {
              title: "Design & Build",
              desc: "Integrated engineering, construction, and execution.",
              link: "/layanan/design-build",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.link}
              className="group border rounded-xl p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-red-600">
                View Details →
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24">
          <Link
            href="/kontak"
            className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Discuss Your Project Requirements
          </Link>
        </div>

      </div>
    </section>
  )
}
