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
} from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"

type KPICardProps = {
  title: string
  value: number
  previousValue?: number
  note?: string
  loading?: boolean
  currency?: "IDR" | "USD" | "NONE"
  sparkline?: number[]
  dark?: boolean
  realtime?: boolean
}

export default function KPICard({
  title,
  value,
  previousValue,
  note,
  loading = false,
  currency = "NONE",
  sparkline,
  dark = false,
  realtime = false,
}: KPICardProps) {
  /* ================= AUTO TREND DETECTION ================= */

  const trend =
    previousValue === undefined
      ? "neutral"
      : value > previousValue
      ? "up"
      : value < previousValue
      ? "down"
      : "neutral"

  const trendStyle =
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
      : ""

  /* ================= SPRING COUNTER ================= */

  const motionValue = useMotionValue(previousValue ?? 0)
  const spring = useSpring(motionValue, {
    stiffness: 90,
    damping: 20,
  })

  useEffect(() => {
    if (!loading) {
      motionValue.set(value)
    }
  }, [value, loading])

  const display = useTransform(spring, (latest) =>
    formatValue(Math.round(latest), currency)
  )

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

  /* ================= DELTA % ================= */

  const delta =
    previousValue && previousValue !== 0
      ? (((value - previousValue) / previousValue) * 100).toFixed(1)
      : null

  /* ================= COMPONENT ================= */

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 120 }}
      className={`relative rounded-2xl p-6 overflow-hidden
      ${
        dark
          ? "bg-white/5 backdrop-blur-xl border border-white/10 text-white"
          : "bg-white border border-gray-200"
      }
      shadow-sm hover:shadow-xl ${glow}`}
    >
      {/* Gradient Accent */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      {/* Realtime Indicator */}
      {realtime && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
      )}

      {/* TITLE */}
      <p
        className={`text-xs uppercase tracking-widest font-bold mb-2 ${
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
            className="text-3xl font-black"
          >
            {display}
          </motion.p>
        )}

        {/* TREND PILL */}
        {!loading && trend !== "neutral" && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trendStyle} bg-current/10`}
          >
            {trend === "up" && <ArrowUpRight size={14} />}
            {trend === "down" && <ArrowDownRight size={14} />}
            {delta && <span>{delta}%</span>}
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
            className={trendStyle}
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
