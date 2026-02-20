import { notFound } from "next/navigation"
import RABDetailClient from "./RABDetailClient"
import { RabResponse } from "./RABDetailClient"

export const dynamic = "force-dynamic"

async function fetchRAB(rab_id: string): Promise<RabResponse> {
  try {
    const res = await fetch(`/api/estimator/rab/${rab_id}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`Failed to fetch RAB ${rab_id}: ${res.status}`)

      if (res.status === 404) {
        notFound()
      }

      throw new Error(`Failed to fetch RAB: ${res.status}`)
    }

    const data = await res.json()

    if (!data?.rab_id) {
      throw new Error("Invalid RAB data")
    }

    // ✅ FIX: Transform API response → format RabResponse
    return {
      rab_id: data.rab_id,
      project_id: data.project_id ?? "",
      header: {
        status: data.status,
        created_by: data.created_by,
        created_at: data.created_at,
        customer_name: data.customer_name,
        project_name: data.project_name,
      },
      summary: {
        total_items: data.total_items ?? data.items?.length ?? 0,
        total_value: data.total_value ?? 0,
      },
      items: data.items ?? [],
    }

  } catch (error) {
    console.error(`Error fetching RAB ${rab_id}:`, error)
    throw error
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
