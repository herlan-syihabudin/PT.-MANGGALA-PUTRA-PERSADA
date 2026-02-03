import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

type KPICardProps = {
  title: string
  value: string
  note?: string
  trend?: "up" | "down" | "neutral"
}

export default function KPICard({
  title,
  value,
  note,
  trend = "neutral",
}: KPICardProps) {
  const trendIcon =
    trend === "up" ? (
      <ArrowUpRight className="text-green-600 w-4 h-4" />
    ) : trend === "down" ? (
      <ArrowDownRight className="text-red-600 w-4 h-4" />
    ) : (
      <Minus className="text-gray-400 w-4 h-4" />
    )

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

      {/* GOLD ACCENT */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-t-2xl" />

      {/* TITLE */}
      <p className="text-sm font-medium text-gray-500 mb-2">
        {title}
      </p>

      {/* VALUE */}
      <div className="flex items-center justify-between">
        <p className="text-3xl font-extrabold text-gray-900">
          {value}
        </p>
        {trendIcon}
      </div>

      {/* NOTE */}
      {note && (
        <p className="text-xs text-gray-400 mt-2">
          {note}
        </p>
      )}
    </div>
  )
}
