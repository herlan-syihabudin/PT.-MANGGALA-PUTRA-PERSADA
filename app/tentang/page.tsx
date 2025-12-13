import type { Metadata } from "next"
import AboutSection from "@/components/AboutSection"

export const metadata: Metadata = {
  title: "Tentang Kami | PT Manggala Putra Persada",
  description:
    "Profil PT Manggala Putra Persada sebagai perusahaan engineering dan konstruksi dengan pendekatan terstruktur dan profesional.",
}

export default function TentangPage() {
  return <AboutSection />
}
