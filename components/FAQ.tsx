"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, MessageCircle, Search } from "lucide-react"
import { faqItems, FAQItem } from "@/lib/faq"

type FAQProps = {
  items?: FAQItem[]
}

export default function FAQ({ items = faqItems }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0) // Buka item pertama
  const [searchQuery, setSearchQuery] = useState("")

  // Filter FAQ berdasarkan pencarian
  const filteredItems = items.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[360px] h-[360px] bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        
        {/* Header - konsisten dengan komponen lain */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-6 h-[2px] bg-gold/30 rounded-full" />
            <span className="text-xs font-semibold text-gold tracking-wider uppercase">
              Ada Pertanyaan?
            </span>
            <div className="w-6 h-[2px] bg-gold/30 rounded-full" />
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            Pertanyaan yang 
            <span className="block text-gold mt-1 text-lg md:text-xl">
              Sering Diajukan
            </span>
          </h2>

          {/* Divider */}
          <div className="flex justify-center mt-4">
            <div className="h-[2px] w-16 bg-gold rounded-full" />
          </div>

          {/* Search Bar (Bonus) */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pertanyaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const isOpen = openIndex === index
              
              return (
                <div
                  key={index}
                  className={`
                    group bg-white border border-gray-200 rounded-xl 
                    hover:shadow-md transition-all duration-300
                    ${isOpen ? 'shadow-lg border-gold/30' : ''}
                  `}
                >
                  {/* Question Button */}
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <HelpCircle 
                        size={18} 
                        className={`mt-0.5 flex-shrink-0 transition-colors ${
                          isOpen ? 'text-gold' : 'text-gray-400'
                        }`}
                      />
                      <h3 className={`font-medium text-sm transition-colors ${
                        isOpen ? 'text-gold' : 'text-gray-900'
                      }`}>
                        {item.question}
                      </h3>
                    </div>
                    
                    <ChevronDown 
                      size={18} 
                      className={`
                        flex-shrink-0 transition-all duration-300
                        ${isOpen ? 'rotate-180 text-gold' : 'text-gray-400'}
                      `} 
                    />
                  </button>

                  {/* Answer Panel */}
                  <div 
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                      <div className="flex gap-3">
                        <div className="w-0.5 bg-gold/20 rounded-full" />
                        <div 
                          className="prose prose-sm max-w-none text-gray-600"
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            // No results state
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <MessageCircle size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Tidak ada pertanyaan yang cocok</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-gold hover:underline"
              >
                Reset pencarian
              </button>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400">
            Tidak menemukan jawaban?{" "}
            <a href="/kontak" className="text-gold hover:underline">
              Hubungi tim kami
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
