import { Suspense } from "react"
import Link from "next/link"
import { HardHat, ChevronRight } from "lucide-react"
import ProjectCard from "@/components/ProjectCard"
import ProjectFilters from "@/components/ProjectFilters"
import { projects } from "@/lib/projects"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Projects | PT Manggala Putra Persada",
  description: "Engineering & construction portfolio.",
}

const categories = ["All", "Industrial", "Commercial", "Residential", "Infrastructure"]

export default function ProyekPage() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        <h1 className="text-5xl font-black mb-12">
          Representative Projects
        </h1>

        <Suspense fallback={<div className="h-12 bg-gray-100 rounded-lg animate-pulse mb-8" />}>
          <ProjectFilters categories={categories} />
        </Suspense>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>

      </div>
    </section>
  )
}
