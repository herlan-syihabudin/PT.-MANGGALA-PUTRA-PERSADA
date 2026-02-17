"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useMemo } from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

type SmartKPIProps = {
  title: string
  value: number
  previousValue?: number
  sparkline?: number[]
  currency?: "IDR" | "NONE"
}

function formatCompactIDR(value: number) {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(1)}K`
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`
}

export default function SmartKPI({
  title,
  value,
  previousValue,
  sparkline = [],
  currency = "IDR",
}: SmartKPIProps) {
  // start animation from previousValue (kalau ada), kalau tidak mulai dari 0
  const start = previousValue ?? 0

  const motionValue = useMotionValue(start)
  const spring = useSpring(motionValue, { stiffness: 70, damping: 20 })
  const rounded = useTransform(spring, (latest) => Math.round(latest))

  // ✅ FIX: buat "display" sebagai MotionValue<string> (bukan rounded.to)
  const display = useTransform(rounded, (v) =>
    currency === "IDR" ? formatCompactIDR(v) : v.toLocaleString("id-ID")
  )

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  // ✅ FIX: previousValue=0 jangan dianggap false
  const hasPrev = typeof previousValue === "number"

  const trend: "up" | "down" | "neutral" = !hasPrev
    ? "neutral"
    : value > (previousValue as number)
    ? "up"
    : value < (previousValue as number)
    ? "down"
    : "neutral"

  const percentChange = useMemo(() => {
    if (!hasPrev) return null
    if ((previousValue as number) === 0) return null
    const pct = ((value - (previousValue as number)) / (previousValue as number)) * 100
    return pct
  }, [hasPrev, previousValue, value])

  const color =
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
      : "shadow-gray-200/30"

  // Sparkline normalize
  const max = sparkline.length ? Math.max(...sparkline) : 1
  const min = sparkline.length ? Math.min(...sparkline) : 0

  const points =
    sparkline.length > 1
      ? sparkline
          .map((v, i) => {
            const x = (i / (sparkline.length - 1)) * 100
            const y = 100 - ((v - min) / (max - min || 1)) * 100
            return `${x},${y}`
          })
          .join(" ")
      : ""

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 border border-gray-100 shadow-xl ${glow} overflow-hidden`}
    >
      {/* Soft highlight */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/60 blur-3xl rounded-full pointer-events-none" />

      <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">
        {title}
      </p>

      <div className="flex justify-between items-center mt-2">
        <motion.h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          {/* ✅ render MotionValue<string> */}
          <motion.span>{display}</motion.span>
        </motion.h2>

        {trend === "up" && <ArrowUpRight className={`${color} w-5 h-5`} />}
        {trend === "down" && <ArrowDownRight className={`${color} w-5 h-5`} />}
      </div>

      {typeof percentChange === "number" && (
        <div className={`text-xs mt-1 font-semibold ${color}`}>
          {percentChange > 0 ? "+" : ""}
          {percentChange.toFixed(1)}% vs last period
        </div>
      )}

      {sparkline.length > 1 && (
        <svg viewBox="0 0 100 100" className="mt-4 h-12 w-full">
          <motion.polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            points={points}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
            className={trend === "down" ? "text-red-500" : "text-blue-500"}
          />
        </svg>
      )}
    </motion.div>
  )
}
