import { notFound } from "next/navigation"
import RABDetailClient from "./RABDetailClient"

export const dynamic = "force-dynamic"

export type RabItem = {
  item_id: string
  rab_id: string
  project_id: string
  scope: string
  item_name: string
  category: string
  qty: number
  unit: string
  material_price: number
  labour_price: number
  unit_price: number
  total_price: number
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export type RabResponse = {
  rab_id?: string
  project_id: string
  header?: any
  summary: { total_items: number; total_value: number }
  items: RabItem[]
}

async function fetchRAB(rab_id: string): Promise<RabResponse> {
  // ✅ FIX: Base URL dengan fallback lengkap
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
      : 'http://localhost:3000')

  const res = await fetch(`${baseUrl}/api/estimator/rab/${rab_id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    if (res.status === 404) notFound()
    throw new Error(`Failed to fetch RAB: ${res.status}`)
  }

  const raw = await res.json()

  return {
    rab_id: raw.rab_id,
    project_id: raw.project_id ?? "",
    header: {
      status: raw.status || "DRAFT",
      created_by: raw.created_by || "System",
      created_at: raw.created_at || new Date().toISOString(),
      customer_name: raw.customer_name || "-",
      project_name: raw.project_name || "Untitled",
    },
    summary: {
      total_items: raw.total_items ?? raw.items?.length ?? 0,
      total_value: raw.total_value ?? 0,
    },
    items: Array.isArray(raw.items) ? raw.items : [],
  }
}

export default async function Page({
  params,
}: {
  params: { rab_id: string }
}) {
  const data = await fetchRAB(params.rab_id)

  return (
    <RABDetailClient
  rab_id={params.rab_id}
  project_id={data.project_id}
  initialData={data}
/>
  )
}
