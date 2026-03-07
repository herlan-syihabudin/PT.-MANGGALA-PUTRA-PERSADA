import type { Metadata } from "next"
import AboutSection from "@/components/AboutSection"
import { WhyChooseUs } from "@/components/WhyChooseUs"

export const metadata: Metadata = {
  title: "Tentang Kami | Kontraktor Pabrik & Industri di Indonesia | PT Manggala Putra Persada",
  description:
  "PT Manggala Putra Persada merupakan perusahaan kontraktor yang menangani pekerjaan konstruksi sipil, struktur baja, instalasi MEP, serta proyek design & build untuk sektor industri dan komersial di Indonesia.",
  
  keywords: [
"engineering contractor indonesia",
"kontraktor industri indonesia",
"kontraktor sipil jakarta",
"kontraktor struktur baja",
"jasa konstruksi baja indonesia",
"instalasi mep",
"kontraktor listrik bekasi",
"design build contractor",
"industrial plant contractor indonesia",
"steel structure fabrication",
"PT Manggala Putra Persada",
"MPP Engineering"
],
  
  authors: [{ name: "PT Manggala Putra Persada" }],
  
  openGraph: {
    title: "About PT Manggala Putra Persada - Kontraktor Industri",
    "description": "PT Manggala Putra Persada merupakan perusahaan kontraktor yang menangani pekerjaan konstruksi sipil, struktur baja, instalasi MEP, serta proyek design & build untuk sektor industri dan komersial di Indonesia.",
    url: "https://mppindo.com/tentang",
    siteName: "PT Manggala Putra Persada",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "https://mppindo.com/images/og-about.png",
        width: 1200,
        height: 630,
        alt: "PT Manggala Putra Persada - Kontraktor Industri",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "About PT Manggala Putra Persada",
    "description":  "Perusahaan kontraktor untuk pekerjaan konstruksi sipil, struktur baja, instalasi MEP, dan design & build.",
    images: ["https://mppindo.com/images/twitter-about.png"],
  },

  alternates: {
    canonical: "https://mppindo.com/tentang",
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
            "description": "PT Manggala Putra Persada merupakan perusahaan kontraktor yang menangani pekerjaan konstruksi sipil, struktur baja, instalasi MEP, serta proyek design & build untuk sektor industri dan komersial di Indonesia.",
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
  
              "sameAs": [
  "https://www.linkedin.com/company/mpp-engineering",
  "https://www.instagram.com/mppengineering"
],
  "knowsAbout": [
    "Steel Structure",
    "Civil Works",
    "MEP Engineering",
    "Design & Build"
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
