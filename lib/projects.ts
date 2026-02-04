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
    images: [
      "/projects/civil.jpg",
      "/projects/civil-1.jpg",
      "/projects/civil-2.jpg",
      "/projects/civil-3.jpg",
      "/projects/civil-4.jpg",
      "/projects/civil-5.jpg",
    ],
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
      "/projects/steel-4.jpg",
      "/projects/steel-5.jpg",
    ],
    category: "Steel Structure",
    title: "Steel Structure Engineering",
    description:
      "Fabrication and erection of steel structures for factories and warehouses with high precision engineering and controlled quality standards.",
    scope: "Steel fabrication, erection, welding, and bolting works",
  },
  {
    slug: "mep-integration",
    images: [
      "/projects/mep.jpg",
      "/projects/mep-1.jpg",
      "/projects/mep-2.jpg",
      "/projects/mep-3.jpg",
      "/projects/mep-4.jpg",
      "/projects/mep-5.jpg",
    ],
    category: "MEP Systems",
    title: "Commercial Building MEP Integration",
    description:
      "Integrated mechanical, electrical, and plumbing systems supporting efficient, reliable, and long-term building operations.",
    scope: "Mechanical, electrical, plumbing, and fire protection systems",
  },
  {
    slug: "interior-fitout",
    images: [
      "/projects/interior.jpg",
      "/projects/interior-1.jpg",
      "/projects/interior-2.jpg",
      "/projects/interior-3.jpg",
      "/projects/interior-4.jpg",
      "/projects/interior-5.jpg",
    ],
    category: "Interior Works",
    title: "Interior & Architectural Finishing",
    description:
      "Interior and architectural finishing works with attention to spatial function, material quality, and clean execution.",
    scope: "Interior fit-out, architectural finishes, custom joinery",
  },
  {
    slug: "design-build",
    images: [
      "/projects/renovation.jpg",
      "/projects/renovation-1.jpg",
      "/projects/renovation-2.jpg",
      "/projects/renovation-3.jpg",
      "/projects/renovation-4.jpg",
      "/projects/renovation-5.jpg",
            ],
    category: "Design & Build",
    title: "Design & Build Solutions",
    description:
      "Integrated planning and construction delivery to ensure coordination efficiency, time control, and project certainty.",
    scope: "Design coordination, civil, structural, and MEP execution",
  },
]
