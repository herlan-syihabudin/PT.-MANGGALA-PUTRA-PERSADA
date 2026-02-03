import type { Metadata } from "next"
import Hero from "@/components/Hero"
import Services from "@/components/Services"
import Projects from "@/components/Projects"
import FAQ from "@/components/FAQ"
import CTA from "@/components/CTA"
import Partners from "@/components/Partners"
import { WhyChooseUs } from "@/components/WhyChooseUs"
import { ProjectOutcome } from "@/components/ProjectOutcome"


export const metadata: Metadata = {
  title: "Engineering & Structured Construction | PT Manggala Putra Persada",
  description:
    "Solusi engineering dan konstruksi terstruktur untuk proyek industri, pabrik, dan perumahan dengan pendekatan profesional dan pengendalian mutu.",
}

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <WhyChooseUs />
      <ProjectOutcome />
      <Projects />
      <Partners />
      <FAQ />
      <CTA />
    </>
  )
}
