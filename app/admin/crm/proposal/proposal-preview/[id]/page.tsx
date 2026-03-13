import { coverTemplate } from "@/lib/templates/coverTemplate"

export default async function Preview({ params }: any) {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/crm/proposal/${params.id}`,
    { cache: "no-store" }
  )

  const data = await res.json()

  const html = coverTemplate(data)

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  )
}
