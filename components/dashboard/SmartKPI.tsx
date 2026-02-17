"use client"

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { useEffect, useMemo } from "react"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

type SmartKPIProps = {
  title: string
  value: number
  previousValue?: number
  currency?: "IDR" | "NONE"
  sparkline?: number[]
}

/* ================= FORMATTERS ================= */

function formatFull(value: number) {
  return value.toLocaleString("id-ID")
}

function formatCompact(value: number) {
  if (value >= 1_000_000_000)
    return (value / 1_000_000_000).toFixed(2) + " M"
  if (value >= 1_000_000)
    return (value / 1_000_000).toFixed(2) + " Jt"
  if (value >= 1_000)
    return (value / 1_000).toFixed(1) + " Rb"
  return value.toLocaleString("id-ID")
}

/* ================= COMPONENT ================= */

export default function SmartKPI({
  title,
  value,
  previousValue,
  currency = "IDR",
  sparkline = [],
}: SmartKPIProps) {

  const motionValue = useMotionValue(previousValue ?? 0)
  const spring = useSpring(motionValue, { stiffness: 90, damping: 20 })

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  const display = useTransform(spring, (latest) =>
    formatCompact(Math.round(latest))
  )

  /* ================= TREND FIX ================= */

  const trend = useMemo(() => {
    if (previousValue === undefined) return "neutral"
    if (value > previousValue) return "up"
    if (value < previousValue) return "down"
    return "neutral"
  }, [value, previousValue])

  const trendColor =
    trend === "up"
      ? "text-emerald-500"
      : trend === "down"
      ? "text-red-500"
      : "text-gray-400"

  const glow =
    trend === "up"
      ? "shadow-emerald-500/20"
      : trend === "down"
      ? "shadow-red-500/20"
      : "shadow-gray-300/20"

  /* ================= SPARKLINE SAFE ================= */

  const sparkPath = useMemo(() => {
    if (!sparkline || sparkline.length < 2) return ""

    const max = Math.max(...sparkline)
    const min = Math.min(...sparkline)
    const range = max - min || 1

    return sparkline
      .map((val, i) => {
        const x = (i / (sparkline.length - 1)) * 100
        const y = 30 - ((val - min) / range) * 30
        return `${i === 0 ? "M" : "L"} ${x},${y}`
      })
      .join(" ")
  }, [sparkline])

  return (
    <motion.div
      whileHover={{ rotateX: 3, rotateY: -3, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 180 }}
      className={`relative bg-white rounded-3xl p-6 border border-gray-100 shadow-lg ${glow} transition-all`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Title */}
      <p className="text-[11px] uppercase font-bold text-gray-400 tracking-widest">
        {title}
      </p>

      {/* Value */}
      <div className="flex justify-between items-center mt-2">
        <div>
          <motion.h2
            title={
              currency === "IDR"
                ? "Rp " + formatFull(value)
                : formatFull(value)
            }
            className="text-3xl font-black text-gray-900 tracking-tight"
          >
            {currency === "IDR" && "Rp "}
            {display}
          </motion.h2>

          {/* Full number small */}
          <p className="text-xs text-gray-400 mt-1 font-mono">
            {formatFull(value)}
          </p>
        </div>

        {trend === "up" && <ArrowUpRight className={trendColor} />}
        {trend === "down" && <ArrowDownRight className={trendColor} />}
        {trend === "neutral" && <Minus className={trendColor} />}
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
            transition={{ duration: 0.9 }}
            className={
              trend === "up"
                ? "text-emerald-500"
                : trend === "down"
                ? "text-red-500"
                : "text-gray-400"
            }
          />
        </svg>
      )}
    </motion.div>
  )
}
