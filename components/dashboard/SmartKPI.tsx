"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useMemo, useRef } from "react"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

// ==================== CONSTANTS ====================
const MILLION = 1_000_000
const BILLION = 1_000_000_000
const THOUSAND = 1_000

const TREND_COLORS = {
  up: {
    text: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-800",
    shadow: "shadow-emerald-500/20 dark:shadow-emerald-400/10",
    stroke: "stroke-emerald-500 dark:stroke-emerald-400"
  },
  down: {
    text: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-800",
    shadow: "shadow-red-500/20 dark:shadow-red-400/10",
    stroke: "stroke-red-500 dark:stroke-red-400"
  },
  neutral: {
    text: "text-gray-400 dark:text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    shadow: "shadow-gray-200/30 dark:shadow-gray-800/30",
    stroke: "stroke-blue-500 dark:stroke-blue-400"
  }
} as const

// ==================== TYPES ====================
type Trend = 'up' | 'down' | 'neutral'

interface SmartKPIProps {
  title: string
  value: number
  previousValue?: number
  sparkline?: number[]
  currency?: "IDR" | "USD" | "NONE"
  locale?: string
  precision?: number
  ariaLabel?: string
}

// ==================== UTILITIES ====================
function safeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) ? num : defaultValue
}

function formatCompactCurrency(
  value: number, 
  currency: "IDR" | "USD" | "NONE" = "IDR",
  locale: string = "id-ID"
): string {
  const safeValue = safeNumber(value)
  
  const symbols = {
    IDR: 'Rp ',
    USD: '$',
    NONE: ''
  }

  const symbol = symbols[currency]

  if (safeValue >= BILLION) {
    return `${symbol}${(safeValue / BILLION).toFixed(2)}B`
  }
  if (safeValue >= MILLION) {
    return `${symbol}${(safeValue / MILLION).toFixed(1)}M`
  }
  if (safeValue >= THOUSAND) {
    return `${symbol}${(safeValue / THOUSAND).toFixed(1)}K`
  }
  
  return currency === 'NONE' 
    ? safeValue.toLocaleString(locale)
    : `${symbol}${Math.round(safeValue).toLocaleString(locale)}`
}

// ==================== SPARKLINE COMPONENT ====================
function Sparkline({ 
  data, 
  trend,
  className = "h-12 w-full" 
}: { 
  data: number[]
  trend: Trend
  className?: string 
}) {
  const safeData = data.filter(v => !isNaN(v) && isFinite(v))
  
  if (safeData.length < 2) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <span className="text-xs text-gray-400 dark:text-gray-600">
          Insufficient data
        </span>
      </div>
    )
  }

  const max = Math.max(...safeData)
  const min = Math.min(...safeData)
  const range = max - min || 1

  const points = safeData
    .map((v, i) => {
      const x = (i / (safeData.length - 1)) * 100
      const y = 100 - ((v - min) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  const strokeColor = TREND_COLORS[trend].stroke

  return (
    <div 
      className={className}
      role="img"
      aria-label={`Sparkline chart showing ${trend} trend with values ${safeData.join(', ')}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <motion.polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className={strokeColor}
        />
        {/* Area gradient fill (optional) */}
        <defs>
          <linearGradient id={`grad-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.2} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <motion.polygon
          fill={`url(#grad-${trend})`}
          points={`0,100 ${points} 100,100`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className={strokeColor.replace('stroke', 'text')}
        />
      </svg>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
export default function SmartKPI({
  title,
  value,
  previousValue,
  sparkline = [],
  currency = "IDR",
  locale = "id-ID",
  precision = 2,
  ariaLabel,
}: SmartKPIProps) {
  // Refs untuk performance tracking
  const mountTime = useRef(Date.now())
  
  // Safe values dengan fallback
  const safeValue = safeNumber(value)
  const safePrevious = safeNumber(previousValue)
  
  // Animation setup
  const motionValue = useMotionValue(safePrevious)
  const spring = useSpring(motionValue, { 
    stiffness: 70, 
    damping: 20,
    mass: 1
  })
  
  const rounded = useTransform(spring, (latest) => 
    Math.round(latest * Math.pow(10, precision)) / Math.pow(10, precision)
  )

  const display = useTransform(rounded, (v) => 
    formatCompactCurrency(v, currency, locale)
  )

  // Trigger animation when value changes
  useEffect(() => {
    motionValue.set(safeValue)
  }, [safeValue, motionValue])

  // Calculate trend
  const hasPrev = typeof previousValue === 'number' && !isNaN(previousValue)
  
  const trend: Trend = !hasPrev 
    ? 'neutral'
    : safeValue > safePrevious 
      ? 'up'
      : safeValue < safePrevious 
        ? 'down'
        : 'neutral'

  // Calculate percentage change
  const percentChange = useMemo(() => {
    if (!hasPrev || safePrevious === 0) return null
    const change = ((safeValue - safePrevious) / Math.abs(safePrevious)) * 100
    return Number(change.toFixed(1))
  }, [hasPrev, safeValue, safePrevious])

  // Get theme colors
  const colors = TREND_COLORS[trend]

  // Generate ARIA label
  const defaultAriaLabel = `${title}: ${formatCompactCurrency(safeValue, currency, locale)}`
  const changeText = percentChange 
    ? `${percentChange > 0 ? 'increase' : 'decrease'} of ${Math.abs(percentChange)}%`
    : ''

  // Performance monitoring (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderTime = Date.now() - mountTime.current
      if (renderTime > 100) {
        console.warn(`SmartKPI "${title}" slow render: ${renderTime}ms`)
      }
    }
  }, [title])

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 
        rounded-3xl p-6 border ${colors.border} shadow-xl ${colors.shadow} 
        overflow-hidden group focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400`}
      role="region"
      aria-label={ariaLabel || defaultAriaLabel}
      tabIndex={0}
    >
      {/* Background glow effect */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 blur-3xl rounded-full 
        ${colors.bg} opacity-30 group-hover:opacity-40 transition-opacity`} 
      />

      {/* Header */}
      <header className="flex items-center justify-between">
        <h3 className="text-xs uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest">
          {title}
        </h3>
        
        {/* Trend indicator */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          ${colors.bg} ${colors.text} border ${colors.border}`}
          aria-label={`Trend: ${trend}`}
        >
          {trend === 'up' && <ArrowUpRight size={14} aria-hidden="true" />}
          {trend === 'down' && <ArrowDownRight size={14} aria-hidden="true" />}
          {trend === 'neutral' && <Minus size={14} aria-hidden="true" />}
          {percentChange && (
            <span>
              {percentChange > 0 ? '+' : ''}{percentChange}%
            </span>
          )}
        </div>
      </header>

      {/* Value */}
      <div className="mt-4 flex items-baseline gap-2">
        <motion.p 
          className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight"
          aria-live="polite"
          aria-atomic="true"
        >
          <motion.span>{display}</motion.span>
        </motion.p>
        
        {hasPrev && (
          <span className="text-xs text-gray-400 dark:text-gray-600" aria-hidden="true">
            vs {formatCompactCurrency(safePrevious, currency, locale)}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {sparkline.length > 0 && (
        <div className="mt-6" aria-hidden="true">
          <Sparkline data={sparkline} trend={trend} />
        </div>
      )}

      {/* Hidden descriptive text for screen readers */}
      <span className="sr-only">
        {defaultAriaLabel}. {changeText}
      </span>
    </motion.article>
  )
}
