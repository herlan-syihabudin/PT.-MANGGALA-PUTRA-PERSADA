import RABDetailClient from "./RABDetailClient"

export const dynamic = "force-dynamic"

async function fetchRAB(rab_id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || ""
  const res = await fetch(`${base}/api/estimator/rab?rab_id=${rab_id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return {
      rab_id,
      project_id: "",
      summary: { total_items: 0, total_value: 0 },
      items: [],
      header: null,
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
