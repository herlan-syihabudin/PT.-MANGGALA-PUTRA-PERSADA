import RABDetailClient from "./RABDetailClient"

async function fetchRAB(rab_id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ""
  const res = await fetch(`${base}/api/estimator/rab/${rab_id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return {
      rab_id,
      project_id: "",
      total_items: 0,
      total_value: 0,
      items: [],
    }
  }

  return res.json()
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
