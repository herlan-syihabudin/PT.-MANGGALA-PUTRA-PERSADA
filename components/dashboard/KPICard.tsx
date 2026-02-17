"use client"

import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "framer-motion"
import { ReactNode, useEffect, useMemo } from "react"

type TrendType = "up" | "down" | "neutral"

type KPICardProps = {
  title: string
  value: number
  note?: string
  trend?: TrendType
  trendLabel?: string
  loading?: boolean
  currency?: "IDR" | "USD" | "NONE"
  sparkline?: number[]
  dark?: boolean
}

export default function KPICard({
  title,
  value,
  note,
  trend = "neutral",
  trendLabel,
  loading = false,
  currency = "NONE",
  sparkline,
  dark = false,
}: KPICardProps) {
  /* ================= TREND CONFIG ================= */

  const trendConfig: Record<
    TrendType,
    { icon: ReactNode; pill: string; glow: string }
  > = {
    up: {
      icon: <ArrowUpRight className="w-4 h-4" />,
      pill: "bg-green-100 text-green-600",
      glow: "shadow-green-400/30",
    },
    down: {
      icon: <ArrowDownRight className="w-4 h-4" />,
      pill: "bg-red-100 text-red-600",
      glow: "shadow-red-400/30",
    },
    neutral: {
      icon: <Minus className="w-4 h-4" />,
      pill: "bg-gray-100 text-gray-500",
      glow: "",
    },
  }

  const { icon, pill, glow } = trendConfig[trend]

  /* ================= COUNTER (SPRING BASED) ================= */

  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    stiffness: 120,
    damping: 20,
  })

  useEffect(() => {
    if (!loading) {
      animate(motionValue, value, { duration: 0.8 })
    }
  }, [value, loading])

  const display = useTransform(spring, (latest) =>
    formatValue(Math.round(latest), currency)
  )

  /* ================= SPARKLINE SAFE ================= */

  const sparkPath = useMemo(() => {
    if (!sparkline || sparkline.length < 2) return ""

    const safe = sparkline.filter((n) => typeof n === "number")
    if (safe.length < 2) return ""

    const max = Math.max(...safe)
    const min = Math.min(...safe)
    const range = max - min || 1

    return safe
      .map((val, i) => {
        const x = (i / (safe.length - 1)) * 100
        const y = 30 - ((val - min) / range) * 30
        return `${i === 0 ? "M" : "L"} ${x},${y}`
      })
      .join(" ")
  }, [sparkline])

  /* ================= COMPONENT ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        rotateX: 3,
        rotateY: -3,
        scale: 1.02,
      }}
      transition={{ type: "spring", stiffness: 120 }}
      className={`relative rounded-2xl p-6 overflow-hidden
      ${
        dark
          ? "bg-gray-900 border border-gray-800 text-white"
          : "bg-white border border-gray-200"
      }
      shadow-sm hover:shadow-xl ${glow}`}
    >
      {/* Gradient Accent */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      {/* TITLE */}
      <p
        className={`text-sm font-medium mb-2 ${
          dark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {title}
      </p>

      {/* VALUE */}
      <div className="flex items-center justify-between">
        {loading ? (
          <div className="h-8 w-28 bg-gray-200 animate-pulse rounded-md" />
        ) : (
          <motion.p
            aria-live="polite"
            className="text-3xl font-extrabold"
          >
            {display}
          </motion.p>
        )}

        {!loading && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${pill}`}
          >
            {icon}
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparkPath && (
        <svg
          viewBox="0 0 100 30"
          className="mt-4 w-full h-8"
          preserveAspectRatio="none"
        >
          <motion.path
            d={sparkPath}
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
            className={
              trend === "up"
                ? "text-green-500"
                : trend === "down"
                ? "text-red-500"
                : "text-gray-400"
            }
          />
        </svg>
      )}

      {/* NOTE */}
      {note && (
        <p
          className={`text-xs mt-2 ${
            dark ? "text-gray-400" : "text-gray-400"
          }`}
        >
          {note}
        </p>
      )}
    </motion.div>
  )
}

/* ================= FORMATTER ================= */

function formatValue(
  value: number,
  currency: "IDR" | "USD" | "NONE"
) {
  if (currency === "NONE") return value.toLocaleString()

  if (currency === "IDR")
    return "Rp " + value.toLocaleString("id-ID")

  if (currency === "USD")
    return "$ " + value.toLocaleString("en-US")

  return value.toString()
}
