export type Project = {
  slug: string
  images: string[]
  category: string
  title: string
  description: string
  scope: string
}

export const projects: Project[] = [
  {
    slug: "manufacturing-plant",
    images: ["/projects/civil.jpg"],
    category: "Industrial Facility",
    title: "Manufacturing Plant Construction",
    description:
      "Civil and structural construction works for industrial production facilities, executed with engineering calculations, quality control, and strict safety compliance.",
    scope: "Civil works, structural concrete, foundation systems",
  },
  {
    slug: "steel-structure",
    images: [
      "/projects/steel.jpg",
      "/projects/steel-1.jpg",
      "/projects/steel-2.jpg",
      "/projects/steel-3.jpg",
    ],
    category: "Steel Structure",
    title: "Steel Structure Engineering",
    description:
      "Fabrication and erection of steel structures for factories and warehouses with high precision engineering and controlled quality standards.",
    scope: "Steel fabrication, erection, welding, and bolting works",
  },
  {
    slug: "mep-integration",
    images: ["/projects/mep.jpg"],
    category: "MEP Systems",
    title: "Commercial Building MEP Integration",
    description:
      "Integrated mechanical, electrical, and plumbing systems supporting efficient, reliable, and long-term building operations.",
    scope: "Mechanical, electrical, plumbing, and fire protection systems",
  },
  {
    slug: "interior-fitout",
    images: ["/projects/interior.jpg"],
    category: "Interior Works",
    title: "Interior & Architectural Finishing",
    description:
      "Interior and architectural finishing works with attention to spatial function, material quality, and clean execution.",
    scope: "Interior fit-out, architectural finishes, custom joinery",
  },
  {
    slug: "design-build",
    images: ["/projects/renovation.jpg"],
    category: "Design & Build",
    title: "Design & Build Solutions",
    description:
      "Integrated planning and construction delivery to ensure coordination efficiency, time control, and project certainty.",
    scope: "Design coordination, civil, structural, and MEP execution",
  },
]
