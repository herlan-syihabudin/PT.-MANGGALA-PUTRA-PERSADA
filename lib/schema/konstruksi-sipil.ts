export const civilServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://mppindo.com/layanan/konstruksi-sipil#service",
  name: "Civil & Structural Construction Engineering Services",
  description:
    "Engineering-led civil and structural construction services in Indonesia covering reinforced concrete works, foundations, and structural systems for industrial, commercial, and residential projects with strict quality and safety control.",
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
    "Civil Construction Contractor",
    "Structural Construction Contractor",
    "Reinforced Concrete Works",
    "Foundation Construction Services",
    "Industrial Civil Construction",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Civil & Structural Construction Scope",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Site Preparation, Earthworks & Excavation" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Shallow & Deep Foundation Systems" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Reinforced Concrete Structures" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Structural Framing, Slabs & Retaining Walls" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Structural Repair, Strengthening & Retrofit" },
      },
    ],
  },
  url: "https://mppindo.com/layanan/konstruksi-sipil",
}
