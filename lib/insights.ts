export type Insight = {
  slug: string
  category: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
}

export const insights: Insight[] = [
  {
    slug: "structured-execution-industrial-projects",
    category: "Construction Execution",
    title: "Why Structured Execution Matters in Industrial Projects",
    excerpt:
      "Structured execution reduces risk, improves coordination, and ensures predictable outcomes in industrial construction projects.",
    publishedAt: "2024-12-10",
    content: `
Industrial projects involve multiple disciplines, tight schedules, and strict safety requirements.
Without structured execution, coordination gaps often lead to rework, cost overruns, and delays.

At PT Manggala Putra Persada, structured execution starts from early planning,
engineering coordination, and clear scope definition. Each activity is executed
based on approved drawings, method statements, and inspection procedures.

This approach enables better control of quality, safety, and schedule,
while ensuring that construction outcomes align with the original engineering intent.
    `,
  },
]
