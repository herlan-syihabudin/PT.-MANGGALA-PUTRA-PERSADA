import "./globals.css"
import type { Metadata, Viewport } from "next"
import { GoogleAnalytics } from '@next/third-parties/google'  // ← TAMBAHKAN INI

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#b91c1c" },
    { media: "(prefers-color-scheme: dark)", color: "#7f1d1d" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL("https://mppindo.com"),
  title: {
    default: "MPP Engineering - Kontraktor Konstruksi Engineering-Led di Indonesia",
    template: "%s | MPP Engineering",
  },
  description:
    "Engineering-led construction contractor in Indonesia specializing in steel structure, civil works, MEP installation, and design-build services for industrial and commercial projects.",
  keywords: [
    "kontraktor indonesia",
    "konstruksi baja",
    "civil engineering",
    "MEP installation",
    "design build",
    "jasa konstruksi",
    "kontraktor pabrik",
    "MPP Engineering",
  ],
  authors: [{ name: "PT Manggala Putra Persada", url: "https://mppindo.com" }],
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
  alternates: {
    canonical: "https://mppindo.com",
  },
  verification: {
    google: "hcsf7ZlUsVW-euLt7vA568lrb6I-zpqc9BO4r-upnuU",
  },
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
      <body className="antialiased bg-white text-gray-900 font-sans min-h-screen">
        {children}
        
        {/* Google Analytics - Taruh sebelum </body> */}
        <GoogleAnalytics gaId="G-CEN997FLX2" />  // ← TAMBAHKAN INI
      </body>
    </html>
  )
}
