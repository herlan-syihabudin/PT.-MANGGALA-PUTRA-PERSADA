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
    // Server Component bisa pake relative URL
    const res = await fetch(`/api/estimator/inquiry/pending`, {
      cache: "no-store"
    })

    if (!res.ok) {
      console.error(`Failed to fetch pending inquiries: ${res.status}`)
      
      if (res.status === 404) {
        notFound() // Trigger 404 page
      }
      
      throw new Error(`Failed to fetch: ${res.status}`)
    }

    const data = await res.json()
    return data

  } catch (error) {
    console.error("Error fetching pending inquiries:", error)
    throw error // Akan ditangkap oleh error.tsx
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
