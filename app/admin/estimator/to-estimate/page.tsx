import ToEstimateClient from "./ToEstimateClient"

export default async function ToEstimatePage() {
  const data = await fetchPending()

  return (
    <div className="p-6">
      <ToEstimateClient data={data} />
    </div>
  )
}
