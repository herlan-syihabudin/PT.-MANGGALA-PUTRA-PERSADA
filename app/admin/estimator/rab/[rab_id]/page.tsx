// app/admin/estimator/rab/[rab_id]/page.tsx
import { notFound } from "next/navigation"
import RABDetailClient from "./RABDetailClient"
import { RabResponse } from "./RABDetailClient"

export const dynamic = "force-dynamic"

async function fetchRAB(rab_id: string): Promise<RabResponse> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000"

    const res = await fetch(
      `${baseUrl}/api/estimator/rab/${rab_id}`,
      { cache: "no-store" }
    )

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

    const normalized: RabResponse = {
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

    return normalized

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

  // Mode tergantung status
  const status = data.header.status?.toUpperCase()
  const mode = status === "DRAFT" ? "edit" : "view"

  return (
    <RABDetailClient
      rab_id={params.rab_id}
      project_id={data.project_id}
      initialData={data}
      mode={mode}
    />
  )
}
