import type { Metadata } from "next"
import Hero from "@/components/Hero"
import Services from "@/components/Services"
import Projects from "@/components/Projects"
import CTA from "@/components/CTA"

export const metadata: Metadata = {
  title: "Engineering & Structured Construction | PT Manggala Putra Persada",
  description:
    "Solusi engineering dan konstruksi terstruktur untuk proyek industri, pabrik, dan perumahan dengan pendekatan profesional, disiplin teknik, dan pengendalian mutu.",
}

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Projects />
      <CTA />
    </>
  )
}
