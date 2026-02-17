"use client"

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { useEffect, useRef } from "react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

type SmartKPIProps = {
  title: string
  value: number
  previousValue?: number
  prefix?: string
  suffix?: string
  sparkline?: number[]
}

export default function SmartKPI({
  title,
  value,
  previousValue,
  prefix,
  suffix,
  sparkline = [],
}: SmartKPIProps) {
  const motionValue = useMotionValue(previousValue ?? 0)
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20 })
  const rounded = useTransform(spring, (latest) =>
    Math.round(latest)
  )

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  const trend =
    previousValue && value > previousValue
      ? "up"
      : previousValue && value < previousValue
      ? "down"
      : "neutral"

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
      : "shadow-gray-300/20"

  // Sparkline
  const max = sparkline.length ? Math.max(...sparkline) : 1
  const path =
    sparkline.length > 1
      ? sparkline
          .map(
            (v, i) =>
              `${(i / (sparkline.length - 1)) * 100},${
                100 - (v / max) * 100
              }`
          )
          .join(" ")
      : ""

  return (
    <motion.div
      whileHover={{ rotateX: 3, rotateY: -3 }}
      className={`relative bg-white rounded-3xl p-6 border border-gray-100 shadow-lg ${glow} transition-all`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">
        {title}
      </p>

      <div className="flex justify-between items-center mt-2">
        <motion.h2 className="text-4xl font-black text-gray-900">
          {prefix}
          <motion.span>{rounded}</motion.span>
          {suffix}
        </motion.h2>

        {trend === "up" && <ArrowUpRight className={color} />}
        {trend === "down" && <ArrowDownRight className={color} />}
      </div>

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
            className="text-blue-500"
          />
        </svg>
      )}
    </motion.div>
  )
}
