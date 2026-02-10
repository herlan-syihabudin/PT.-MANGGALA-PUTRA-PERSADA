"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

export default function Breadcrumb() {
  const pathname = usePathname()

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1) // buang "admin"

  let href = "/admin"

  return (
    <nav className="flex items-center text-xs text-gray-500">
      <Link href="/admin" className="hover:text-gray-800">
        Dashboard
      </Link>

      {segments.map((seg, idx) => {
        href += `/${seg}`
        const isLast = idx === segments.length - 1

        return (
          <span key={href} className="flex items-center">
            <ChevronRight size={14} className="mx-2" />
            {isLast ? (
              <span className="font-medium text-gray-800 capitalize">
                {decodeURIComponent(seg).replace(/-/g, " ")}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-gray-800 capitalize"
              >
                {decodeURIComponent(seg).replace(/-/g, " ")}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
