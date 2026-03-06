export const civilServiceSchema = {
  "@context": "https://schema.org",
  "@type": ["Service", "ProfessionalService"],
  "@id": "https://mppindo.com/layanan/konstruksi-sipil#service",

  name: "Civil & Structural Construction Engineering Services",

  description:
    "Engineering-led civil and structural construction services in Indonesia covering reinforced concrete works, foundation systems, and structural engineering solutions for industrial, commercial, and infrastructure projects with strict quality and safety control.",

  url: "https://mppindo.com/layanan/konstruksi-sipil",

  image: "https://mppindo.com/images/services/civil-construction.jpg",

  provider: {
  "@type": "Organization",
  "@id": "https://mppindo.com/#organization",
  name: "PT Manggala Putra Persada",
  alternateName: "MPP Engineering",
  url: "https://mppindo.com",
  logo: "https://mppindo.com/logo-mp.png",
  sameAs: [
    "https://www.linkedin.com/company/mppindo"
  ]
},

  areaServed: [
    {
      "@type": "Country",
      name: "Indonesia"
    },
    {
      "@type": "AdministrativeArea",
      name: "Jakarta"
    },
    {
      "@type": "AdministrativeArea",
      name: "Bandung"
    },
    {
      "@type": "AdministrativeArea",
      name: "Surabaya"
    },
    {
      "@type": "AdministrativeArea",
      name: "Semarang"
    },
    {
      "@type": "AdministrativeArea",
      name: "Medan"
    }
  ],

  serviceType: "Civil & Structural Construction Contractor",

  serviceOutput: [
    "Reinforced Concrete Structures",
    "Industrial Building Foundations",
    "Structural Framing Systems",
    "Civil Infrastructure Structures"
  ],

  audience: {
    "@type": "Audience",
    audienceType: [
      "Industrial Facility Owners",
      "Commercial Property Developers",
      "Manufacturing Companies",
      "Construction Project Owners"
    ]
  },

  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Civil & Structural Construction Scope",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Site Preparation, Earthworks & Excavation"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Shallow & Deep Foundation Systems"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Reinforced Concrete Structures"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Structural Framing, Slabs & Retaining Walls"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Structural Repair, Strengthening & Retrofit"
        }
      }
    ]
  },

  availableChannel: {
    "@type": "ServiceChannel",
    serviceLocation: {
      "@type": "Place",
      name: "Indonesia"
    }
  },

  keywords: [
    "civil construction contractor indonesia",
    "structural construction contractor jakarta",
    "reinforced concrete works indonesia",
    "foundation contractor surabaya",
    "industrial civil engineering indonesia",
    "structural retrofit bandung"
  ],

  priceRange: "$$$$",
  }
