import type { Metadata } from "next"
import AboutSection from "@/components/AboutSection"
import { WhyChooseUs } from "@/components/WhyChooseUs"

export const metadata: Metadata = {
  title: "About Us | Engineering Contractor Indonesia | PT Manggala Putra Persada",
  
  description: "PT Manggala Putra Persada is an engineering-led construction contractor in Indonesia with 14+ years experience, 100+ completed projects, and ISO-certified processes. Specializing in steel structure, civil works, MEP, and design-build for industrial and commercial projects.",
  
  keywords: [
    "engineering contractor indonesia",
    "construction company bekasi",
    "jasa konstruksi baja indonesia",
    "kontraktor sipil jakarta",
    "design build contractor",
    "iso certified construction company",
    "industrial plant contractor indonesia",
    "mep installation services",
    "steel structure fabrication",
    "engineering procurement construction",
    "PT Manggala Putra Persada",
    "MPP Engineering",
    "kontraktor industri indonesia"
  ],
  
  authors: [{ name: "PT Manggala Putra Persada" }],
  
  openGraph: {
    title: "About PT Manggala Putra Persada - Engineering-Led Construction Contractor",
    description: "Engineering-led construction contractor with 14+ years experience and 100+ completed industrial projects across Indonesia. ISO certified with structured execution approach.",
    url: "https://mppindo.com/tentang",
    siteName: "PT Manggala Putra Persada",
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    images: [
      {
        url: "https://mppindo.com/images/og-about.png",
        width: 1200,
        height: 630,
        alt: "PT Manggala Putra Persada - Engineering Contractor Indonesia",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "About PT Manggala Putra Persada",
    description: "Engineering-led construction contractor with 14+ years experience and 100+ completed industrial projects.",
    images: ["https://mppindo.com/images/twitter-about.png"],
  },

  alternates: {
    canonical: "https://mppindo.com/tentang",
    languages: {
      'id-ID': 'https://mppindo.com/id/tentang',
      'en-US': 'https://mppindo.com/en/about',
    },
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function TentangPage() {
  return (
    <main>
      <AboutSection />
      <WhyChooseUs />
      
      {/* Schema untuk About Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About PT Manggala Putra Persada",
            "description": "Engineering-led construction contractor in Indonesia with 14+ years experience",
            "url": "https://mppindo.com/tentang",
            "mainEntity": {
  "@type": "Organization",
"@id": "https://mppindo.com/#organization",
  "name": "PT Manggala Putra Persada",
  "url": "https://mppindo.com",
  "logo": "https://mppindo.com/logo-mp.png",
  "foundingDate": "2010",
  "numberOfEmployees": "50+",
  "areaServed": "Indonesia",
  "award": [
    "ISO 9001:2015",
    "ISO 14001:2015",
    "ISO 45001:2018"
  ],
              "sameAs": [
  "https://www.linkedin.com/company/mpp-engineering",
  "https://www.instagram.com/mppengineering"
],
  "knowsAbout": [
    "Steel Structure",
    "Civil Works",
    "MEP Engineering",
    "Design Build Construction"
  ]
}
          })
        }}
      />
      <script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html: JSON.stringify({
"@context": "https://schema.org",
"@type": "BreadcrumbList",
"itemListElement": [
{
"@type": "ListItem",
"position": 1,
"name": "Home",
"item": "https://mppindo.com"
},
{
"@type": "ListItem",
"position": 2,
"name": "About",
"item": "https://mppindo.com/tentang"
}
]
})
}}
/>
    </main>
  )
}
