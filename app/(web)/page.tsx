import type { Metadata } from "next"

import Hero from "@/components/Hero"
import Services from "@/components/Services"
import Projects from "@/components/Projects"
import FAQ from "@/components/FAQ"
import CTA from "@/components/CTA"
import Partners from "@/components/Partners"
import { WhyChooseUs } from "@/components/WhyChooseUs"
import { ProjectOutcome } from "@/components/ProjectOutcome"
import ProjectFilters from "@/components/ProjectFilters"

export const metadata: Metadata = {
  title:
    "Engineering-Led Construction Contractor Indonesia | PT Manggala Putra Persada",
  description:
    "PT Manggala Putra Persada (MPP Engineering) is an engineering-led construction contractor in Indonesia providing steel structure, civil construction, MEP systems, and design & build services for industrial and commercial projects.",
}

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* HERO (HARUS ADA H1 DI DALAMNYA) */}
      <Hero />

<WhyChooseUs />
<ProjectOutcome />

<Services />

<Projects />
<Partners />
<FAQ />
<CTA />
    </main>
  )
}
