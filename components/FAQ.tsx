import { faqItems, FAQItem } from "@/lib/faq"

type FAQProps = {
  items?: FAQItem[]
}

export default function FAQ({ items = faqItems }: FAQProps) {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold mb-10 text-gray-900">
          Pertanyaan yang Sering Diajukan
        </h2>

        <div className="space-y-6">
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
        </div>
      </div>
    </section>
  )
}
