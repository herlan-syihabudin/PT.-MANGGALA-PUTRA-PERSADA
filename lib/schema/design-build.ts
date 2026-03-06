export const designBuildServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://mppindo.com/layanan/design-build#service",
  name: "Design & Build Construction Services",
  description:
    "Integrated design and build construction services in Indonesia delivering engineering, construction planning, and execution under a single responsibility system for industrial and commercial projects.",
  provider: {
 "@type": "Organization",
 name: "PT Manggala Putra Persada",
 alternateName: "MPP Engineering",
 url: "https://mppindo.com",
 logo: "https://mppindo.com/logo-mp.png",
 sameAs: [
   "https://www.linkedin.com/company/mppindo"
 ]
},
  areaServed: {
    "@type": "Country",
    name: "Indonesia",
  },
  serviceType: [
    "Design and Build Contractor",
    "Engineering Procurement Construction",
    "Industrial Construction",
    "Commercial Construction",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Design & Build Services Scope",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Concept Design & Engineering" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Cost Estimation & Value Engineering" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Construction Planning & Scheduling" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Integrated Civil, Structural, MEP & Fit-Out Execution" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Testing, Commissioning & Project Handover" },
      },
    ],
  },
  url: "https://mppindo.com/layanan/design-build",
}
