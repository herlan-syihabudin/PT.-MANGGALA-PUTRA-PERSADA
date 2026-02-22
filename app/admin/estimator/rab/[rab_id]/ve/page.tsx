// app/admin/estimator/rab/[rab_id]/ve/page.tsx

import VEClient from "./VEClient"

export const dynamic = "force-dynamic"

export default function Page({
  params,
}: {
  params: { rab_id: string }
}) {
  return <VEClient rab_id={params.rab_id} />
}
