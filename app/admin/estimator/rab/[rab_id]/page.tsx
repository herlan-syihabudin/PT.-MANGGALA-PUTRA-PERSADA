import { notFound } from "next/navigation"
import RABDetailClient, { RabResponse } from "./RABDetailClient"

export const dynamic = "force-dynamic"

async function fetchRAB(rab_id: string): Promise<RabResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const res = await fetch(`${baseUrl}/api/estimator/rab/${rab_id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    if (res.status === 404) notFound()
    throw new Error(`Failed to fetch RAB: ${res.status}`)
  }

  const data = await res.json()

  return {
    rab_id: data.rab_id,
    project_id: data.project_id ?? "",
    header: {
      status: data.status || "DRAFT",
      created_by: data.created_by || "System",
      created_at: data.created_at || new Date().toISOString(),
      customer_name: data.customer_name || "-",
      project_name: data.project_name || "Untitled",
    },
    summary: {
      total_items: data.total_items ?? data.items?.length ?? 0,
      total_value: data.total_value ?? 0,
    },
    items: Array.isArray(data.items) ? data.items : [],
  }
}

export default async function Page({ params }: { params: { rab_id: string } }) {
  const data = await fetchRAB(params.rab_id)

  return (
    <RABDetailClient
      rab_id={params.rab_id}
      project_id={data.project_id}
      initialData={data}
      mode="edit"
    />
  )
}
