import { coverTemplate } from "@/lib/templates/quotation/cover"

export default async function Preview({ params }: { params: { id: string } }) {

  const res = await fetch(
    `/api/crm/proposal/${params.id}`,
    { cache: "no-store" }
  )

  const data = await res.json()

  const html = coverTemplate(data)

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}
