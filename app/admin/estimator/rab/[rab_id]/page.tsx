import { notFound } from "next/navigation"
import RABDetailClient from "./RABDetailClient"

export const dynamic = "force-dynamic"

type RABItem = {
  item_id: string
  item_name: string
  qty: number
  unit: string
  material_price: number
  labour_price: number
  total_price: number
}

type RABData = {
  rab_id: string
  inquiry_id?: string
  project_id: string
  project_name?: string
  customer_name?: string
  total_items: number
  total_value: number
  status: string
  created_by?: string
  created_at?: string
  items: RABItem[]
}

async function fetchRAB(rab_id: string): Promise<RABData> {
  try {
    // Server Component bisa pake relative URL
    const res = await fetch(`/api/estimator/rab/${rab_id}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`Failed to fetch RAB ${rab_id}: ${res.status}`)
      
      if (res.status === 404) {
        notFound() // Trigger 404 page
      }
      
      throw new Error(`Failed to fetch RAB: ${res.status}`)
    }

    const data = await res.json()
    
    // Validasi minimal response
    if (!data.rab_id) {
      throw new Error("Invalid RAB data")
    }

    return data

  } catch (error) {
    console.error(`Error fetching RAB ${rab_id}:`, error)
    throw error // Akan ditangkap oleh error.tsx
  }
}

export default async function Page({ params }: { params: { rab_id: string } }) {
  const data = await fetchRAB(params.rab_id)

  return (
    <RABDetailClient
      rab_id={params.rab_id}
      project_id={data.project_id || ""}
      initialData={data}
    />
  )
}
