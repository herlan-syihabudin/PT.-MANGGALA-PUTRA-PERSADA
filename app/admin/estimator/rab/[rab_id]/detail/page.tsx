import RABDetailClient from "../RABDetailClient"

async function getRAB(rab_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/estimator/rab/${rab_id}`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    throw new Error("Gagal ambil data RAB")
  }

  return res.json()
}

export default async function RabDetailPage({
  params,
}: {
  params: { rab_id: string }
}) {
  const data = await getRAB(params.rab_id)

  const normalized = {
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
      total_items: data.total_items ?? 0,
      total_value: data.total_value ?? 0,
    },
    items: data.items ?? [],
  }

  return (
    <RABDetailClient
      rab_id={params.rab_id}
      project_id={normalized.project_id}
      initialData={normalized}
      mode="view"
    />
  )
}
