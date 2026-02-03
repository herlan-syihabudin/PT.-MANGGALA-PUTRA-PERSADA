import DealHeader from "@/components/dashboard/deal/DealHeader"
import DealInfo from "@/components/dashboard/deal/DealInfo"
import DealTimeline from "@/components/dashboard/deal/DealTimeline"
import DealActions from "@/components/dashboard/deal/DealActions"
import DealNotes from "@/components/dashboard/deal/DealNotes"

export default function DealDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <section className="p-6 md:p-10 space-y-8">

      <DealHeader dealId={params.id} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <DealInfo />
          <DealTimeline />
          <DealNotes />
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <DealActions />
        </div>
      </div>

    </section>
  )
}
