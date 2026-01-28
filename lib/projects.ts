export type Project = {
  slug: string
  image: string
  category: string
  title: string
  description: string
}

export const projects: Project[] = [
  {
    slug: "manufacturing-plant",
    image: "/projects/civil.jpg",
    category: "Industrial Facility",
    title: "Manufacturing Plant Construction",
    description:
      "Civil and structural construction works for industrial production facilities, executed with engineering calculations, quality control, and strict safety compliance.",
  },
  {
    slug: "steel-structure",
    image: "/projects/steel.jpg",
    category: "Steel Structure",
    title: "Steel Structure Engineering",
    description:
      "Fabrication and erection of steel structures for factories and warehouses with high precision engineering and controlled quality standards.",
  },
  {
    slug: "mep-integration",
    image: "/projects/mep.jpg",
    category: "MEP Systems",
    title: "Commercial Building MEP Integration",
    description:
      "Integrated mechanical, electrical, and plumbing systems supporting efficient, reliable, and long-term building operations.",
  },
  {
    slug: "interior-fitout",
    image: "/projects/interior.jpg",
    category: "Interior Works",
    title: "Interior & Architectural Finishing",
    description:
      "Interior and architectural finishing works with attention to spatial function, material quality, and clean execution.",
  },
  {
    slug: "design-build",
    image: "/projects/renovation.jpg",
    category: "Design & Build",
    title: "Design & Build Solutions",
    description:
      "Integrated planning and construction delivery to ensure coordination efficiency, time control, and project certainty.",
  },
]
