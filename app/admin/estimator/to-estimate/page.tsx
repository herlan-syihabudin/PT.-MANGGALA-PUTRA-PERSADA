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
}

async function fetchPending(): Promise<Inquiry[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000"

    const res = await fetch(
      `${baseUrl}/api/estimator/inquiry/pending`,
      {
        cache: "no-store",
      }
    )

    if (!res.ok) {
      console.error(
        `Failed to fetch pending inquiries: ${res.status}`
      )

      if (res.status === 404) {
        notFound()
      }

      throw new Error(`Failed to fetch: ${res.status}`)
    }

    return res.json()

  } catch (error) {
    console.error(
      "Error fetching pending inquiries:",
      error
    )
    throw error
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
