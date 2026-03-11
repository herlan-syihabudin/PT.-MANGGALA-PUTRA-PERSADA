import ToEstimateClient from "./ToEstimateClient"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Inquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai: number
  tanggal_masuk: string
  prioritas?: string
  layanan?: string
  status?: string
}

type ApiResponse = {
  data: Inquiry[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  summary?: {
    total_estimasi: number
    avg_estimasi: number
    by_layanan: Record<string, number>
  }
}

async function fetchPending(): Promise<Inquiry[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(
      `${baseUrl}/api/estimator/inquiry/pending`,
      {
        cache: "no-store",
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!res.ok) {
      if (res.status === 404) notFound()
      if (res.status === 429) return []
      throw new Error(`Failed to fetch: ${res.status}`)
    }

    const json: ApiResponse = await res.json()
    return Array.isArray(json?.data) ? json.data : []
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[ToEstimatePage] Request timeout")
      return []
    }

    console.error("[ToEstimatePage] Error fetching pending inquiries:", error)
    return []
  }
}

export default async function ToEstimatePage() {
  const data = await fetchPending()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ToEstimateClient data={data} />
      </div>
    </div>
  )
}

export const metadata = {
  title: "To Estimate - Pending Inquiries",
  description: "List of inquiries pending for estimation",
}
