"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"

interface Segment {
  value: number
  color: string
  label?: string
}

interface MiniPieProps {
  data: Segment[]
  size?: number
  innerRadius?: number // 0-1, 0 = pie, 0.6 = donut
  animate?: boolean
  showLabels?: boolean
  className?: string
}

export default function MiniPie({
  data,
  size = 80,
  innerRadius = 0.6, // 60% = donut
  animate = true,
  showLabels = false,
  className = "",
}: MiniPieProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [paths, setPaths] = useState<string[]>([])

  // Filter valid data (value > 0)
  const validData = data.filter(d => d.value > 0 && !isNaN(d.value) && isFinite(d.value))
  
  if (validData.length === 0) {
    return (
      <div 
        ref={ref}
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gray-400">No data</span>
      </div>
    )
  }

  // Calculate total
  const total = validData.reduce((sum, d) => sum + d.value, 0)

  // Calculate SVG paths untuk setiap segment
  const calculatePaths = () => {
    const center = size / 2
    const radius = size / 2
    const holeRadius = radius * innerRadius
    
    let startAngle = 0
    const newPaths: string[] = []

    validData.forEach((segment) => {
      const percentage = segment.value / total
      const angle = percentage * Math.PI * 2
      const endAngle = startAngle + angle

      // Koordinat untuk outer arc
      const x1 = center + radius * Math.sin(startAngle)
      const y1 = center - radius * Math.cos(startAngle)
      const x2 = center + radius * Math.sin(endAngle)
      const y2 = center - radius * Math.cos(endAngle)

      // Koordinat untuk inner arc (hole)
      const x3 = center + holeRadius * Math.sin(endAngle)
      const y3 = center - holeRadius * Math.cos(endAngle)
      const x4 = center + holeRadius * Math.sin(startAngle)
      const y4 = center - holeRadius * Math.cos(startAngle)

      // Large arc flag
      const largeArcFlag = angle > Math.PI ? 1 : 0

      // Path untuk donut segment
      const path = [
        `M ${x1} ${y1}`, // Move to start point
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Outer arc
        `L ${x3} ${y3}`, // Line to inner arc end
        `A ${holeRadius} ${holeRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Inner arc (reverse direction)
        `Z` // Close path
      ].join(' ')

      newPaths.push(path)
      startAngle = endAngle
    })

    return newPaths
  }

  useEffect(() => {
    setPaths(calculatePaths())
  }, [data, size, innerRadius])

  // Generate labels untuk tooltip/legend
  const totalLabel = total.toLocaleString()

  return (
    <div 
      ref={ref}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Pie chart with ${validData.length} segments totaling ${totalLabel}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {paths.map((path, index) => (
          <motion.path
            key={index}
            d={path}
            fill={validData[index]?.color || '#ccc'}
            stroke="white"
            strokeWidth={innerRadius > 0 ? 1 : 0}
            initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            animate={animate && inView ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              ease: [0.34, 1.56, 0.64, 1] // Bounce effect
            }}
            whileHover={{ 
              scale: 1.05,
              filter: "brightness(1.1)",
              transition: { duration: 0.2 }
            }}
          />
        ))}

        {/* Inner circle untuk efek donut */}
        {innerRadius > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * innerRadius / 2}
            fill="white"
            className="dark:fill-gray-900"
            stroke="none"
          />
        )}
      </svg>

      {/* Center text untuk donut */}
      {innerRadius > 0.5 && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ fontSize: size * 0.15 }}
        >
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {total.toLocaleString()}
          </span>
        </div>
      )}

      {/* Labels (optional) */}
      {showLabels && (
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2 text-xs">
          {validData.map((segment, index) => (
            <div key={index} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {segment.label || `Segment ${index + 1}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
