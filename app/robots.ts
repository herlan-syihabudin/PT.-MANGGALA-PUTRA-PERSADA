import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "Yandex",
        allow: "/",
      },
    ],
    sitemap: "https://pt-manggala-putra-persada.vercel.app/sitemap.xml",
    host: "https://pt-manggala-putra-persada.vercel.app",
  }
}
