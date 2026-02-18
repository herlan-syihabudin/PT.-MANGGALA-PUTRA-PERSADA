import ToEstimateClient from "./ToEstimateClient"

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
  const base = process.env.NEXT_PUBLIC_BASE_URL

  const res = await fetch(
    `${base}/api/estimator/inquiry/pending`,
    { cache: "no-store" }
  )

  if (!res.ok) return []
  return res.json()
}

export default async function ToEstimatePage() {
  const data = await fetchPending()

  return (
    <div className="p-6">
      <ToEstimateClient data={data} />
    </div>
  )
}
