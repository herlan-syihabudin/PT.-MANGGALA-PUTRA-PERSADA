export const mepServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://mppindo.com/layanan/mep#service",
  name: "Mechanical, Electrical & Plumbing (MEP) Engineering Services",
  description:
    "Professional Mechanical, Electrical, and Plumbing (MEP) engineering and installation services in Indonesia for industrial, commercial, and building projects, delivered with coordinated design, safe execution, and full compliance with technical standards.",
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
    "MEP Engineering Contractor",
    "Mechanical Electrical Plumbing Contractor",
    "HVAC Engineering Services",
    "Fire Protection System Contractor",
    "Building Services Engineering",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "MEP Engineering Services Scope",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "HVAC Systems (Split, VRV/VRF, Chilled Water)" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Electrical Power Distribution & Lighting Systems" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Plumbing & Sanitary Systems" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Fire Protection Systems (Hydrant & Sprinkler)" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Testing, Commissioning & System Handover" },
      },
    ],
  },
  url: "https://mppindo.com/layanan/mep",
}
