import { Inter } from "next/font/google"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsAppFloat from "@/components/WhatsAppFloat"
import Script from "next/script"
import type { Metadata, Viewport } from "next"

import "./globals.css"

// ===== FONT OPTIMIZATION =====
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// ===== SITE CONFIG =====
const siteConfig = {
  name: "PT Manggala Putra Persada",
  shortName: "MPP Engineering",
  url: "https://pt-manggala-putra-persada.vercel.app",
  logo: "/logo-mp.png",
  phone: "+62-812-9739-6612",
  email: "info@mpp-engineering.com",
  address: {
    locality: "Bekasi",
    region: "West Java",
    country: "ID",
  },
  socials: {
    linkedin: "https://linkedin.com/company/mpp-engineering",
    instagram: "https://instagram.com/mppengineering",
  },
}

// ===== METADATA =====
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  
  title: {
    default: "Engineering-Led Construction Contractor Indonesia | PT Manggala Putra Persada",
    template: "%s | PT Manggala Putra Persada",
  },
  
  description: "PT Manggala Putra Persada (MPP Engineering) is an engineering-led construction contractor in Indonesia specializing in steel structure, civil works, MEP systems, and design & build services for industrial and commercial projects.",
  
  keywords: [
    "engineering contractor indonesia",
    "construction contractor indonesia",
    "steel structure contractor indonesia",
    "mep contractor indonesia",
    "civil contractor indonesia",
    "design and build contractor indonesia",
    "industrial construction indonesia",
    "kontraktor industri indonesia",
    "jasa konstruksi baja",
  ],
  
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  
  creator: siteConfig.name,
  
  publisher: siteConfig.name,
  
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // ===== OPEN GRAPH =====
  openGraph: {
    title: "Engineering-Led Construction Contractor Indonesia | PT Manggala Putra Persada",
    description: "Engineering-led construction services covering steel structure, civil, MEP, and design & build for industrial and commercial projects in Indonesia.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "id_ID",
    alternateLocale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PT Manggala Putra Persada - Engineering & Construction Contractor Indonesia",
      },
      {
        url: "/og-image-square.png",
        width: 800,
        height: 800,
        alt: "PT Manggala Putra Persada Logo",
      },
    ],
  },

  // ===== TWITTER =====
  twitter: {
    card: "summary_large_image",
    title: "Engineering-Led Construction Contractor Indonesia",
    description: "Steel structure, civil, MEP, and design & build services for industrial projects",
    images: ["/twitter-image.png"],
    creator: "@mppengineering",
    site: "@mppengineering",
  },

  // ===== ROBOTS =====
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ===== ICONS =====
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-152.png", sizes: "152x152" },
    ],
  },

  // ===== MANIFEST =====
  manifest: "/manifest.json",

  // ===== VERIFICATION =====
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification",
    yahoo: "your-yahoo-verification",
    other: {
      "msvalidate.01": ["your-bing-verification"],
    },
  },

  // ===== APPLE =====
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black-translucent",
  },

  // ===== OTHER META =====
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
}

// ===== VIEWPORT (separate export) =====
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

// ===== SCHEMA GENERATION =====
function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        url: siteConfig.url,
        logo: `${siteConfig.url}${siteConfig.logo}`,
        description: metadata.description,
        sameAs: Object.values(siteConfig.socials),
        email: siteConfig.email,
        telephone: siteConfig.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.address.locality,
          addressRegion: siteConfig.address.region,
          addressCountry: siteConfig.address.country,
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteConfig.url}/#localbusiness`,
        name: siteConfig.name,
        image: `${siteConfig.url}${siteConfig.logo}`,
        url: siteConfig.url,
        telephone: siteConfig.phone,
        email: siteConfig.email,
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.address.locality,
          addressRegion: siteConfig.address.region,
          addressCountry: siteConfig.address.country,
        },
        areaServed: {
          "@type": "Country",
          name: "Indonesia",
        },
        priceRange: "$$",
        openingHours: "Mo-Fr 08:00-17:00",
        paymentAccepted: "Cash, Credit Card, Bank Transfer",
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: metadata.description,
        publisher: {
          "@id": `${siteConfig.url}/#organization`,
        },
        inLanguage: ["en-US", "id-ID"],
      },
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="id" 
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* ===== PRELOAD FONTS ===== */}
        <link
          rel="preload"
          href="/og-image.png"
          as="image"
        />
        
        {/* ===== DNS PREFETCH ===== */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      
      <body className="bg-white text-gray-900 antialiased font-sans">
        
        {/* ===== SKIP TO CONTENT (ACCESSIBILITY) ===== */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>

        {/* ===== SCHEMA SEO (ORGANIZATION) ===== */}
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
          strategy="beforeInteractive"
        />

        {/* ===== GOOGLE ANALYTICS (if needed) ===== */}
        {/* <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script> */}

        <Navbar />
        
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  )
}
