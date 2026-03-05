import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, 
  MapPin, 
  HardHat,
  ChevronRight,
  Award,
  Clock,
  Users
} from "lucide-react"
import type { Project } from "@/lib/projects"

// Format tanggal Indonesia
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short'
  }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

export default function ProjectCard({
  slug,
  images,
  category,
  title,
  description,
  location,
  completionDate,
  client,
  value,
  duration,
  scope = [],
  featured = false,
}: Project) {
  return (
    <Link 
      href={`/proyek/${slug}`} 
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-2xl"
    >
      <article className="relative border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
        
        {/* ===== FEATURED BADGE (optional) ===== */}
        {featured && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-gold to-yellow-400 text-gray-900 rounded-full text-xs font-bold shadow-lg">
            <Award size={12} />
            <span>Featured Project</span>
          </div>
        )}

        {/* ===== IMAGE SECTION ===== */}
        <div className="relative h-56 sm:h-64 overflow-hidden bg-gray-100">
          {/* Image dengan overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <Image
            src={images?.[0] || "/images/project-placeholder.jpg"}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition duration-700"
            priority={featured}
          />

          {/* Category Badge overlay di image */}
          <div className="absolute bottom-4 left-4 z-20">
            <span className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-full shadow-lg">
              {category}
            </span>
          </div>

          {/* Image count indicator (if multiple images) */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 z-20 px-2 py-1 bg-black/50 backdrop-blur text-white text-xs rounded-full">
              +{images.length} photos
            </div>
          )}
        </div>

        {/* ===== CONTENT SECTION ===== */}
        <div className="p-6 flex-1 flex flex-col">
          
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Location & Date */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" />
                <span>{location}</span>
              </div>
            )}
            {completionDate && (
              <div className="flex items-center gap-1">
                <Calendar size={12} className="text-gray-400" />
                <span>{formatDate(completionDate)}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-gray-400" />
                <span>{duration}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-3">
            {description}
          </p>

          {/* Project Scope Tags */}
          {scope.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {scope.slice(0, 3).map((item, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {item}
                </span>
              ))}
              {scope.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                  +{scope.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Project Stats (optional) */}
          {(client || value) && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              {client && (
                <div>
                  <p className="text-xs text-gray-400">Client</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{client}</p>
                </div>
              )}
              {value && (
                <div>
                  <p className="text-xs text-gray-400">Project Value</p>
                  <p className="text-sm font-medium text-green-600">{value}</p>
                </div>
              )}
            </div>
          )}

          {/* View Details Link */}
          <div className="mt-4 flex items-center text-sm font-semibold text-red-600 group-hover:text-red-700 transition-colors">
            <span>View Project Details</span>
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* ===== HOVER EFFECT OVERLAY ===== */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-600/20 rounded-2xl pointer-events-none transition-colors" />
      </article>
    </Link>
  )
}
