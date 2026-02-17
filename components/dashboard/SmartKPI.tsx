"use client"

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { useEffect } from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

type SmartKPIProps = {
  title: string
  value: number
  previousValue?: number
  sparkline?: number[]
  currency?: "IDR" | "NONE"
}

function formatCompactIDR(value: number) {
  if (value >= 1_000_000_000)
    return `Rp ${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000)
    return `Rp ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)
    return `Rp ${(value / 1_000).toFixed(1)}K`
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function SmartKPI({
  title,
  value,
  previousValue,
  sparkline = [],
  currency = "IDR",
}: SmartKPIProps) {
  const motionValue = useMotionValue(previousValue ?? 0)
  const spring = useSpring(motionValue, { stiffness: 70, damping: 20 })
  const rounded = useTransform(spring, (latest) => Math.round(latest))

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  const trend =
    previousValue && value > previousValue
      ? "up"
      : previousValue && value < previousValue
      ? "down"
      : "neutral"

  const percentChange =
    previousValue && previousValue !== 0
      ? (((value - previousValue) / previousValue) * 100).toFixed(1)
      : null

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

  const path =
    sparkline.length > 1
      ? sparkline
          .map(
            (v, i) =>
              `${(i / (sparkline.length - 1)) * 100},${
                100 - ((v - min) / (max - min || 1)) * 100
              }`
          )
          .join(" ")
      : ""

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      style={{ transformStyle: "preserve-3d" }}
      className={`relative bg-gradient-to-br from-white to-gray-50 
      rounded-3xl p-6 border border-gray-100 
      shadow-xl ${glow} transition-all overflow-hidden`}
    >
      {/* Soft highlight glass effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/60 blur-3xl rounded-full pointer-events-none" />

      {/* Title */}
      <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">
        {title}
      </p>

      {/* Value */}
      <div className="flex justify-between items-center mt-2">
        <motion.h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          {currency === "IDR" ? (
            <motion.span>
              {rounded.to((v) => formatCompactIDR(v))}
            </motion.span>
          ) : (
            <motion.span>{rounded}</motion.span>
          )}
        </motion.h2>

        {trend === "up" && (
          <ArrowUpRight className={`${color} w-5 h-5`} />
        )}
        {trend === "down" && (
          <ArrowDownRight className={`${color} w-5 h-5`} />
        )}
      </div>

      {/* Percent change */}
      {percentChange && (
        <div className={`text-xs mt-1 font-semibold ${color}`}>
          {trend === "up" ? "+" : ""}
          {percentChange}% vs last period
        </div>
      )}

      {/* Sparkline */}
      {sparkline.length > 1 && (
        <svg viewBox="0 0 100 100" className="mt-4 h-12 w-full">
          <motion.polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            points={path}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
            className={
              trend === "down"
                ? "text-red-500"
                : "text-blue-500"
            }
          />
        </svg>
      )}
    </motion.div>
  )
}
