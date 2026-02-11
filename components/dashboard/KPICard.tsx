import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

type KPICardProps = {
  title: string
  value: string | number
  note?: string
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
}

export default function KPICard({
  title,
  value,
  note,
  trend = "neutral",
  trendLabel,
}: KPICardProps) {

  const trendConfig = {
    up: {
      icon: <ArrowUpRight className="w-4 h-4" />,
      color: "text-green-600",
    },
    down: {
      icon: <ArrowDownRight className="w-4 h-4" />,
      color: "text-red-600",
    },
    neutral: {
      icon: <Minus className="w-4 h-4" />,
      color: "text-gray-400",
    },
  }

  const { icon, color } = trendConfig[trend]

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

      {/* GOLD ACCENT */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-t-2xl" />

      {/* TITLE */}
      <p className="text-sm font-medium text-gray-500 mb-2">
        {title}
      </p>

      {/* VALUE + TREND */}
      <div className="flex items-center justify-between">
        <p className={`text-3xl font-extrabold ${color}`}>
          {value}
        </p>

        <div className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
          {icon}
          {trendLabel && <span>{trendLabel}</span>}
        </div>
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
