"use client"

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { ReactNode, useEffect, useState } from "react"
import { motion } from "framer-motion"

type TrendType = "up" | "down" | "neutral"

type KPICardProps = {
  title: string
  value: string | number
  note?: string
  trend?: TrendType
  trendLabel?: string
  highlight?: boolean
  danger?: boolean
  loading?: boolean
}

export default function KPICard({
  title,
  value,
  note,
  trend = "neutral",
  trendLabel,
  highlight = false,
  danger = false,
  loading = false,
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

  // VALUE COLOR
  let valueColor = "text-gray-900"
  if (highlight) valueColor = "text-yellow-600"
  if (danger) valueColor = "text-red-600"

  // === Animated Counter ===
  const numericValue =
    typeof value === "number" ? value : Number(value)

  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (loading) return
    if (isNaN(numericValue)) return

    let start = 0
    const duration = 800
    const increment = numericValue / (duration / 16)

    const counter = setInterval(() => {
      start += increment
      if (start >= numericValue) {
        start = numericValue
        clearInterval(counter)
      }
      setDisplayValue(Math.floor(start))
    }, 16)

    return () => clearInterval(counter)
  }, [numericValue, loading])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
      className={`relative bg-white border border-gray-200 rounded-2xl p-6 
      shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}
    >
      {/* GOLD ACCENT BAR */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-t-2xl" />

      {/* HIGHLIGHT GLOW */}
      {highlight && (
        <div className="absolute inset-0 bg-yellow-400/5 pointer-events-none" />
      )}

      {/* TITLE */}
      <p className="text-sm font-medium text-gray-500 mb-2">
        {title}
      </p>

      {/* VALUE + TREND */}
      <div className="flex items-center justify-between">
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
        ) : (
          <p className={`text-3xl font-extrabold ${valueColor}`}>
            {typeof value === "number" ? displayValue : value}
          </p>
        )}

        {!loading && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}
          >
            {icon}
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </div>

      {/* NOTE */}
      {note && !loading && (
        <p className="text-xs text-gray-400 mt-2">
          {note}
        </p>
      )}
    </motion.div>
  )
}
