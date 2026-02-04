import Link from "next/link"
import Image from "next/image"
import type { Project } from "@/lib/projects"

export default function ProjectCard({
  slug,
  images,
  category,
  title,
  description,
}: Project) {
  return (
    <Link href={`/proyek/${slug}`} className="group">
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition h-full">

        {/* IMAGE */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        {/* CONTENT */}
        <div className="p-6">
          <span className="text-xs font-semibold text-red-600">
            {category}
          </span>

          <h3 className="mt-2 text-xl font-bold text-gray-900">
            {title}
          </h3>

          <p className="mt-3 text-gray-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>

      </div>
    </Link>
  )
}
