export type Insight = {
  // Core fields
  slug: string
  category: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  author?: string

  // ===== ENHANCED SEO ENGINE =====
  metaDescription?: string           // Custom meta description (default: excerpt)
  metaTitle?: string                 // Custom title tag (default: title + brand)
  canonical?: string                 // Custom canonical URL
  
  keywords?: string[]                // Primary keywords
  secondaryKeywords?: string[]       // Long-tail variations
  focusKeyword?: string              // Main keyword to rank
  
  // ===== CONTENT ENRICHMENT =====
  featuredImage?: string             // URL gambar utama
  images?: Array<{                    // Multiple images
    url: string
    alt: string
    caption?: string
  }>
  
  readingTime?: number                // Menit baca (auto-calculate nanti)
  wordCount?: number                  // Jumlah kata
  
  // ===== INTERNAL LINKING =====
  relatedServices?: string[]          // Layanan terkait
  relatedInsights?: string[]          // Artikel terkait
  relatedProjects?: string[]          // Project terkait
  
  // ===== CONTENT STRUCTURE =====
  tableOfContents?: Array<{           // Auto-generate dari heading
    id: string
    title: string
    level: number
  }>
  
  faqs?: Array<{                      // FAQ untuk rich snippets
    question: string
    answer: string
  }>
  
  // ===== CALL TO ACTION =====
  cta?: {
    text: string
    url: string
    buttonText: string
  }
  
  // ===== TECHNICAL SEO =====
  noIndex?: boolean                    // Jangan di-index
  noFollow?: boolean                   // Jangan di-follow
  ogImage?: string                     // Open Graph image
  twitterCard?: 'summary' | 'summary_large_image'
  
  // ===== ANALYTICS & TRACKING =====
  views?: number                        // Hitungan views
  conversions?: number                  // Lead conversions dari artikel ini
  lastUpdated?: string                  // Tanggal update terakhir
}

export const insights: Insight[] = [
  {
    slug: "structured-execution-industrial-projects",
    category: "Construction Execution",
    title: "Why Structured Execution Matters in Industrial Projects",
    metaTitle: "Industrial Project Execution Strategy | PT Manggala Putra Persada",
    metaDescription: "Learn how structured execution reduces risk, improves coordination, and ensures predictable outcomes in industrial construction projects in Indonesia.",
    
    excerpt: "Structured execution reduces risk, improves coordination, and ensures predictable outcomes in industrial construction projects.",
    
    publishedAt: "2024-12-10",
    lastUpdated: "2025-02-19",
    author: "PT Manggala Putra Persada",
    
    featuredImage: "/images/insights/structured-execution.jpg",
    images: [
      {
        url: "/images/insights/structured-execution-1.jpg",
        alt: "Industrial construction site with structured execution",
        caption: "Structured execution ensures safety and quality"
      },
      {
        url: "/images/insights/structured-execution-2.jpg",
        alt: "Engineering coordination meeting",
        caption: "Engineering coordination is key to structured execution"
      }
    ],
    
    readingTime: 5,
    wordCount: 850,
    
    focusKeyword: "industrial construction execution",
    keywords: [
      "industrial construction execution",
      "structured construction methodology",
    ],
    secondaryKeywords: [
      "engineering led construction indonesia",
      "industrial project execution strategy",
      "construction risk management industrial",
      "industrial contractor indonesia",
      "construction coordination system",
    ],
    
    relatedServices: [
      "/layanan/design-build",
      "/layanan/struktur-baja",
      "/layanan/mep",
    ],
    
    relatedInsights: [
      "/insight/engineering-coordination-design-build",
      "/insight/quality-control-construction-sites",
    ],
    
    relatedProjects: [
      "/proyek/industrial-plant-1",
      "/proyek/manufacturing-facility-2",
    ],
    
    tableOfContents: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "why-structured-execution", title: "Why Structured Execution?", level: 2 },
      { id: "key-elements", title: "Key Elements of Structured Execution", level: 2 },
      { id: "case-studies", title: "Case Studies", level: 3 },
      { id: "conclusion", title: "Conclusion", level: 2 },
    ],
    
    faqs: [
      {
        question: "What is structured execution in construction?",
        answer: "Structured execution is a systematic approach to construction project management that emphasizes planning, coordination, and control throughout all phases of the project lifecycle."
      },
      {
        question: "How does structured execution reduce project risks?",
        answer: "By establishing clear processes, engineering coordination, and quality control systems, structured execution minimizes coordination gaps and prevents rework."
      }
    ],
    
    cta: {
      text: "Need help with your industrial project? Our team of experts is ready to assist.",
      url: "/kontak",
      buttonText: "Consult with Our Engineers"
    },
    
    ogImage: "/images/og/insight-structured-execution.jpg",
    twitterCard: "summary_large_image",
    
    views: 1250,
    conversions: 18,
  },

  {
    slug: "engineering-coordination-design-build",
    category: "Engineering & Design",
    title: "The Importance of Engineering Coordination in Design & Build Projects",
    metaTitle: "Engineering Coordination for Design-Build Projects | MPP",
    metaDescription: "Early engineering coordination prevents design conflicts, rework, and cost escalation in design-build projects. Learn best practices from Indonesia's leading contractor.",
    
    excerpt: "Early engineering coordination is critical to avoid design conflicts, rework, and cost escalation in design & build projects.",
    
    publishedAt: "2024-12-18",
    lastUpdated: "2025-02-19",
    author: "PT Manggala Putra Persada",
    
    featuredImage: "/images/insights/engineering-coordination.jpg",
    
    readingTime: 4,
    wordCount: 720,
    
    focusKeyword: "design build engineering coordination",
    keywords: [
      "design and build engineering coordination",
      "design build contractor indonesia",
    ],
    secondaryKeywords: [
      "engineering coordination construction",
      "integrated design build execution",
      "construction clash detection engineering",
      "design-build project management",
    ],
    
    relatedServices: [
      "/layanan/design-build",
      "/layanan/mep",
      "/layanan/konstruksi-sipil",
    ],
    
    relatedInsights: [
      "/insight/structured-execution-industrial-projects",
      "/insight/quality-control-construction-sites",
    ],
    
    faqs: [
      {
        question: "What is engineering coordination in design-build?",
        answer: "Engineering coordination ensures that all design disciplines work together seamlessly, preventing conflicts between structural, architectural, and MEP systems."
      }
    ],
    
    cta: {
      text: "Looking for an integrated design-build partner? Let's discuss your project.",
      url: "/kontak",
      buttonText: "Contact Our Team"
    },
    
    views: 980,
    conversions: 12,
  },

  {
    slug: "cost-schedule-control-construction",
    category: "Project Management",
    title: "Managing Cost and Schedule Control in Construction Projects",
    metaTitle: "Construction Cost & Schedule Control Strategies | MPP Indonesia",
    metaDescription: "Learn effective cost and schedule control strategies for construction projects. Engineering-based planning and monitoring systems for predictable outcomes.",
    
    excerpt: "Cost and schedule control are achieved through disciplined planning, monitoring, and corrective action during project execution.",
    
    publishedAt: "2025-01-05",
    lastUpdated: "2025-02-19",
    author: "PT Manggala Putra Persada",
    
    featuredImage: "/images/insights/cost-schedule-control.jpg",
    
    readingTime: 6,
    wordCount: 1100,
    
    focusKeyword: "construction cost control",
    keywords: [
      "construction cost control strategy",
      "construction schedule management",
    ],
    secondaryKeywords: [
      "project control construction indonesia",
      "engineering based project management",
      "industrial construction cost planning",
      "construction budget control",
    ],
    
    relatedServices: [
      "/layanan/design-build",
      "/layanan/konstruksi-sipil",
    ],
    
    relatedInsights: [
      "/insight/structured-execution-industrial-projects",
    ],
    
    faqs: [
      {
        question: "What causes cost overruns in construction?",
        answer: "Common causes include poor planning, scope creep, design changes, lack of monitoring, and coordination gaps between disciplines."
      },
      {
        question: "How can we improve schedule control?",
        answer: "Schedule control requires baseline planning, regular progress tracking, early deviation identification, and engineering-based execution."
      }
    ],
    
    cta: {
      text: "Ensure your next project stays on budget and on schedule.",
      url: "/kontak",
      buttonText: "Talk to Our Project Managers"
    },
    
    views: 750,
    conversions: 8,
  },

  {
    slug: "quality-control-construction-sites",
    category: "Construction Execution",
    title: "Why Quality Control Systems Are Essential on Construction Sites",
    metaTitle: "Construction Quality Control Systems | Best Practices Indonesia",
    metaDescription: "Quality control systems ensure construction meets specifications and engineering standards. Learn how systematic inspection prevents rework and improves safety.",
    
    excerpt: "Quality control systems ensure that construction work complies with specifications, drawings, and long-term performance requirements.",
    
    publishedAt: "2025-01-20",
    lastUpdated: "2025-02-19",
    author: "PT Manggala Putra Persada",
    
    featuredImage: "/images/insights/quality-control.jpg",
    
    readingTime: 5,
    wordCount: 890,
    
    focusKeyword: "construction quality control",
    keywords: [
      "construction quality control system",
      "quality assurance construction site",
    ],
    secondaryKeywords: [
      "engineering quality control indonesia",
      "construction inspection and testing plan",
      "industrial construction quality management",
      "construction quality assurance",
    ],
    
    relatedServices: [
      "/layanan/konstruksi-sipil",
      "/layanan/struktur-baja",
      "/layanan/mep",
    ],
    
    relatedInsights: [
      "/insight/structured-execution-industrial-projects",
      "/insight/engineering-coordination-design-build",
    ],
    
    faqs: [
      {
        question: "What is the difference between quality control and quality assurance?",
        answer: "Quality control involves inspection and testing during construction, while quality assurance focuses on processes and systems to prevent defects."
      },
      {
        question: "How often should quality inspections occur?",
        answer: "Inspections should occur at every key stage: material delivery, before concrete pour, after installation, and at project completion."
      }
    ],
    
    cta: {
      text: "Ready to implement robust quality control on your project?",
      url: "/kontak",
      buttonText: "Contact Our Quality Team"
    },
    
    views: 620,
    conversions: 7,
  },
]
