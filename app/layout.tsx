import "./globals.css"
import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#b91c1c",
  colorScheme: "light",
}

export const metadata: Metadata = {
  // ===== BASE =====
  metadataBase: new URL("https://mppindo.com"),
  title: {
    default: "MPP Engineering - Kontraktor Konstruksi Engineering-Led di Indonesia",
    template: "%s | MPP Engineering",
  },
  description: "Engineering-led construction contractor in Indonesia specializing in steel structure, civil works, MEP installation, and design-build services for industrial and commercial projects.",
  
  // ===== SEO =====
  keywords: [
    "kontraktor indonesia",
    "konstruksi baja",
    "civil engineering",
    "MEP installation",
    "design build",
    "jasa konstruksi",
    "kontraktor pabrik",
    "MPP Engineering",
  ].join(", "),
  authors: [{ name: "PT Manggala Putra Persada", url: "https://mppindo.com" }],
  
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
  
  // ===== CANONICAL =====
  alternates: {
    canonical: "https://mppindo.com",
    languages: {
      "id-ID": "https://mppindo.com/id",
      "en-US": "https://mppindo.com/en",
    },
  },
  
  // ===== OPEN GRAPH (SOCIAL MEDIA) =====
  openGraph: {
    type: "website",
    siteName: "MPP Engineering",
    title: "MPP Engineering - Kontraktor Konstruksi Indonesia",
    description: "Engineering-led construction contractor for industrial and commercial projects.",
    url: "https://mppindo.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MPP Engineering - Kontraktor Konstruksi Indonesia",
      },
    ],
    locale: "id_ID",
  },
  
  // ===== TWITTER =====
  twitter: {
    card: "summary_large_image",
    site: "@mppengineering",
    creator: "@mppengineering",
    title: "MPP Engineering - Kontraktor Konstruksi Indonesia",
    description: "Engineering-led construction contractor for industrial and commercial projects.",
    images: ["/og-image.jpg"],
  },
  
  // ===== PWA & MANIFEST =====
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "MPP Engineering",
    statusBarStyle: "black-translucent",
    startupImage: [
      {
        url: "/icons/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  
  // ===== ICONS =====
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/safari-pinned-tab.svg",
        color: "#b91c1c",
      },
    ],
  },
  
  // ===== VERIFICATION (GOOGLE SEARCH CONSOLE) =====
  verification: {
   
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
  },
  
  // ===== FORMAT DETECTION =====
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  
  // ===== CATEGORY =====
  category: "construction",
  
  // ===== OTHER =====
  applicationName: "MPP Engineering",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  creator: "PT Manggala Putra Persada",
  publisher: "PT Manggala Putra Persada",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" dir="ltr" className="scroll-smooth">
      <head>
        {/* Preconnect ke domain penting */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch untuk domain yang sering diakses */}
        <link rel="dns-prefetch" href="https://wa.me" />
        
        {/* RSS Feed (kalau ada blog) */}
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/feed.xml" />
      </head>
      <body className="antialiased bg-white text-gray-900 font-sans">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-gray-900"
        >
          Skip to main content
        </a>
        
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}
