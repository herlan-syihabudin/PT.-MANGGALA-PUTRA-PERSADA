"use client"

import { useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
  showArea?: boolean
  animate?: boolean
  className?: string
}

export default function Sparkline({
  data,
  color = "text-blue-500",
  height = 48,
  width = 200,
  showArea = true,
  animate = true,
  className = "",
}: SparklineProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  // Filter valid data
  const validData = data.filter(v => !isNaN(v) && isFinite(v) && v !== null)
  
  if (validData.length < 2) {
    return (
      <div 
        ref={ref}
        className={`flex items-center justify-center ${className}`}
        style={{ height, width }}
      >
        <span className="text-xs text-gray-400 dark:text-gray-600">
          Insufficient data
        </span>
      </div>
    )
  }

  // Normalize data to 0-100 range
  const max = Math.max(...validData)
  const min = Math.min(...validData)
  const range = max - min || 1

  // Generate points for polyline
  const points = validData
    .map((v, i) => {
      const x = (i / (validData.length - 1)) * 100
      const y = 100 - ((v - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  // Generate points for area (polygon)
  const areaPoints = `0,100 ${points} 100,100`

  return (
    <div 
      ref={ref}
      className={className}
      style={{ height, width }}
      role="img"
      aria-label={`Sparkline chart with values: ${validData.join(', ')}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Definitions untuk gradient */}
        <defs>
          <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {showArea && (
          <motion.polygon
            points={areaPoints}
            fill={`url(#sparkline-gradient-${color})`}
            className={color}
            initial={animate ? { opacity: 0 } : { opacity: 1 }}
            animate={animate && inView ? { opacity: 1 } : { opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        )}

        {/* Line */}
        <motion.polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={color}
          initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          animate={animate && inView ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* Data points (optional - muncul di hover) */}
        {validData.map((v, i) => {
          const x = (i / (validData.length - 1)) * 100
          const y = 100 - ((v - min) / range) * 100
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              className={`${color} fill-current`}
              initial={{ scale: 0 }}
              animate={animate && inView ? { scale: 1 } : { scale: 1 }}
              transition={{ delay: 0.8 + i * 0.05 }}
              style={{ opacity: 0.5 }}
              whileHover={{ r: 3, opacity: 1 }}
            />
          )
        })}
      </svg>
    </div>
  )
}
