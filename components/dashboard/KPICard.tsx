import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { ReactNode } from "react"

type TrendType = "up" | "down" | "neutral"

type KPICardProps = {
  title: string
  value: string | number
  note?: string
  trend?: TrendType
  trendLabel?: string
  highlight?: boolean
  danger?: boolean
}

export default function KPICard({
  title,
  value,
  note,
  trend = "neutral",
  trendLabel,
  highlight = false,
  danger = false,
}: KPICardProps) {
  
  const trendConfig: Record<
    TrendType,
    { icon: ReactNode; color: string }
  > = {
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

  const { icon, color: trendColor } = trendConfig[trend]

  // VALUE COLOR (pisahin dari trend)
  let valueColor = "text-gray-900"
  if (highlight) valueColor = "text-yellow-600"
  if (danger) valueColor = "text-red-600"

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300">

      {/* GOLD ACCENT */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-t-2xl" />

      {/* TITLE */}
      <p className="text-sm font-medium text-gray-500 mb-2">
        {title}
      </p>

      {/* VALUE + TREND */}
      <div className="flex items-center justify-between">
        <p className={`text-3xl font-extrabold ${valueColor}`}>
          {value}
        </p>

        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
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
