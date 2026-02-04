import { FAQItem } from "@/lib/faq"

type Props = {
  items: FAQItem[]
}

export default function FAQ({ items }: Props) {
  return (
    <section className="space-y-6">
      {items.map((item, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-xl p-6 bg-white"
        >
          <h3 className="font-semibold text-gray-900 mb-2">
            {item.question}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {item.answer}
          </p>
        </div>
      ))}
    </section>
  )
}
