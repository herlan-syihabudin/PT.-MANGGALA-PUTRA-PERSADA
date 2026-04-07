import { MetadataRoute } from "next"
import { projects } from "@/lib/projects"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://mppindo.com"  // ← hardcode biar pasti
  const currentDate = new Date().toISOString().split('T')[0]  // ← 2026-04-07
  
  // ===== CORE PAGES =====
  const corePages = [
    { path: "", priority: 1.0, freq: "weekly" },
    { path: "tentang", priority: 0.8, freq: "monthly" },
    { path: "layanan", priority: 0.9, freq: "monthly" },
    { path: "proyek", priority: 0.9, freq: "weekly" },
    { path: "cara-kerja", priority: 0.7, freq: "monthly" },
    { path: "kontak", priority: 0.7, freq: "yearly" },
  ].map((page) => ({
    url: `${baseUrl}/${page.path}`,
    lastModified: currentDate,  // ← semua pake tanggal hari ini
    changeFrequency: page.freq as "weekly" | "monthly" | "yearly",
    priority: page.priority,
  }))

  // ===== SERVICE PAGES =====
  const services = [
    { slug: "struktur-baja", priority: 0.95 },
    { slug: "mep", priority: 0.95 },
    { slug: "konstruksi-sipil", priority: 0.95 },
    { slug: "fit-out", priority: 0.9 },
    { slug: "design-build", priority: 0.9 },
  ]
  
  const servicePages = services.map((service) => ({
    url: `${baseUrl}/layanan/${service.slug}`,
    lastModified: currentDate,  // ← pake tanggal hari ini
    changeFrequency: "monthly" as const,
    priority: service.priority,
  }))

  // ===== PROJECT PAGES =====
  const projectPages = projects.map((project) => ({
    url: `${baseUrl}/proyek/${project.slug}`,
    lastModified: project.completionDate || currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [...corePages, ...servicePages, ...projectPages]
}
