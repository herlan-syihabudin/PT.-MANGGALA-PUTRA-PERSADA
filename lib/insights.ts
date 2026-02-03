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

  {
    slug: "engineering-coordination-design-build",
    category: "Engineering & Design",
    title: "The Importance of Engineering Coordination in Design & Build Projects",
    excerpt:
      "Early engineering coordination is critical to avoid design conflicts, rework, and cost escalation in design & build projects.",
    publishedAt: "2024-12-18",
    content: `
Design & build projects require seamless coordination between design and construction teams.
Without strong engineering coordination, inconsistencies between drawings and site conditions
often result in execution delays and budget overruns.

Engineering coordination ensures constructability review,
early clash detection, and alignment between architectural,
structural, and MEP systems.

By integrating engineering discipline early in the project lifecycle,
project teams can achieve higher efficiency, reduced risks,
and improved project certainty.
    `,
  },

  {
    slug: "cost-schedule-control-construction",
    category: "Project Management",
    title: "Managing Cost and Schedule Control in Construction Projects",
    excerpt:
      "Cost and schedule control are achieved through disciplined planning, monitoring, and corrective action during project execution.",
    publishedAt: "2025-01-05",
    content: `
Cost overruns and schedule delays are among the most common challenges in construction projects.
These issues often arise due to weak planning, scope creep, and lack of monitoring systems.

Effective cost and schedule control require baseline planning,
regular progress tracking, and early identification of deviations.

Through structured reporting, engineering-based planning,
and disciplined execution control, construction projects can maintain
financial and timeline certainty throughout the project lifecycle.
    `,
  },

  {
    slug: "quality-control-construction-sites",
    category: "Construction Execution",
    title: "Why Quality Control Systems Are Essential on Construction Sites",
    excerpt:
      "Quality control systems ensure that construction work complies with specifications, drawings, and long-term performance requirements.",
    publishedAt: "2025-01-20",
    content: `
Quality control is not an inspection at the end of construction,
but a continuous process throughout project execution.

Proper quality control systems include material inspection,
work method approval, and systematic inspection checkpoints
during construction activities.

By implementing structured quality control,
construction teams can reduce rework,
improve safety, and deliver reliable project outcomes
that meet engineering standards.
    `,
  },
]
