export const fitOutServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://pt-manggala-putra-persada.vercel.app/layanan/fit-out#service",
  name: "Interior & Fit-Out Construction Services",
  description:
    "Engineering-oriented interior and fit-out construction services in Indonesia for offices, commercial spaces, and industrial facilities, focusing on functionality, durability, and high-quality finishing.",
  provider: {
    "@type": "Organization",
    name: "PT Manggala Putra Persada",
    alternateName: "MPP Engineering",
    url: "https://mppindo.com",
  },
  areaServed: {
    "@type": "Country",
    name: "Indonesia",
  },
  serviceType: [
    "Interior Fit-Out Contractor",
    "Office Interior Construction",
    "Commercial Interior Fit-Out",
    "Industrial Fit-Out Services",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Interior & Fit-Out Scope of Work",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Partition, Ceiling & Flooring Works" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Wall Finishing, Coating & Painting" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Custom Joinery & Built-In Furniture" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Interior Lighting & Architectural Elements" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "MEP & Structural Coordination for Fit-Out" },
      },
    ],
  },
  url: "https://pt-manggala-putra-persada.vercel.app/layanan/fit-out",
}
