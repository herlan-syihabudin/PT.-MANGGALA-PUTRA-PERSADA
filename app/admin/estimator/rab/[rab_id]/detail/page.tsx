// app/admin/estimator/rab/[rab_id]/detail/page.tsx
import RABDetailClient from "../RABDetailClient"

export default function RabDetailPage({ params }: { params: { rab_id: string } }) {
  return (
    <RABDetailClient rabId={params.rab_id} mode="view" />
  )
}
