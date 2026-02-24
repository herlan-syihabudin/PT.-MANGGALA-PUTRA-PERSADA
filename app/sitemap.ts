import { MetadataRoute } from "next"
import { projects } from "@/lib/projects"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mppindo.com"
  const currentDate = new Date()
  
  // Tanggal untuk halaman statis (manual, biar akurat)
  const lastModified = {
    home: "2024-01-01",
    tentang: "2024-01-01", 
    layanan: "2024-01-15",
    proyek: currentDate.toISOString().split('T')[0],
    kontak: "2024-01-01",
    services: "2024-01-15",
  }

  // ===== CORE PAGES (LOOP, TAPI PAKAI TANGGAL MANUAL) =====
  const corePages = [
    { path: "", priority: 1.0, freq: "weekly", lastModKey: "home" },
    { path: "tentang", priority: 0.8, freq: "monthly", lastModKey: "tentang" },
    { path: "layanan", priority: 0.9, freq: "monthly", lastModKey: "layanan" },
    { path: "proyek", priority: 0.9, freq: "weekly", lastModKey: "proyek" },
    { path: "cara-kerja", priority: 0.7, freq: "monthly", lastModKey: "tentang" },
    { path: "kontak", priority: 0.7, freq: "yearly", lastModKey: "kontak" },
  ].map((page) => ({
    url: `${baseUrl}/${page.path}`,
    lastModified: lastModified[page.lastModKey as keyof typeof lastModified],
    changeFrequency: page.freq as "weekly" | "monthly" | "yearly",
    priority: page.priority,
  }))

  // ===== SERVICE PAGES (LOOP, PAKAI TANGGAL SAMA) =====
  const services = [
    { slug: "struktur-baja", priority: 0.95 },
    { slug: "mep", priority: 0.95 },
    { slug: "konstruksi-sipil", priority: 0.95 },
    { slug: "fit-out", priority: 0.9 },
    { slug: "design-build", priority: 0.9 },
  ]
  
  const servicePages = services.map((service) => ({
    url: `${baseUrl}/layanan/${service.slug}`,
    lastModified: lastModified.services,
    changeFrequency: "monthly" as const,
    priority: service.priority,
  }))

  // ===== PROJECT PAGES (DARI DATA) =====
  const projectPages = projects.map((project) => ({
    url: `${baseUrl}/proyek/${project.slug}`,
    lastModified: project.completionDate || lastModified.proyek,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [...corePages, ...servicePages, ...projectPages]
}
