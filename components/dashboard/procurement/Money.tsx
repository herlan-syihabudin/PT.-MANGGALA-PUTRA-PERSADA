'use client'

import { useMemo } from 'react'

interface MoneyProps {
  value?: number | null
  currency?: 'IDR' | 'USD' | 'JPY' | 'SGD'
  compact?: boolean
  showSign?: boolean
  highlightNegative?: boolean
  highlightPositive?: boolean
  positiveColor?: string
  negativeColor?: string
  zeroColor?: string
  showZero?: boolean
  className?: string
}

export default function Money({
  value = 0,
  currency = 'IDR',
  compact = false,
  showSign = false,
  highlightNegative = true,
  highlightPositive = false,
  positiveColor = 'text-green-600',
  negativeColor = 'text-red-600',
  zeroColor = 'text-gray-400',
  showZero = true,
  className = '',
}: MoneyProps) {
  // Safe value handling
  const safeValue = useMemo(() => {
    if (value === null || value === undefined) return 0
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }, [value])

  // Don't show zero if showZero is false
  if (!showZero && safeValue === 0) {
    return <span className={className}>-</span>
  }

  // Memoized formatter
  const formatter = useMemo(() => {
    const isIDR = currency === 'IDR'
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: isIDR ? 0 : 2,
      maximumFractionDigits: isIDR ? 0 : 2,
      notation: compact ? 'compact' : 'standard',
      // Compact display: "1,5 jt" instead of "1,5M"
      compactDisplay: 'short',
    })
  }, [currency, compact])

  // Format the value
  const formatted = useMemo(() => {
    try {
      return formatter.format(safeValue)
    } catch (error) {
      console.error('Error formatting currency:', error)
      return `${currency} ${safeValue.toLocaleString('id-ID')}`
    }
  }, [formatter, safeValue, currency])

  // Determine color based on value
  const getColorClass = () => {
    if (safeValue > 0 && highlightPositive) return positiveColor
    if (safeValue < 0 && highlightNegative) return negativeColor
    if (safeValue === 0) return zeroColor
    return ''
  }

  // Show plus sign only for positive values
  const showPlusSign = showSign && safeValue > 0

  // Full value for tooltip (when compact)
  const fullValue = useMemo(() => {
    if (!compact) return undefined
    
    const fullFormatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'IDR' ? 0 : 2,
    })
    
    try {
      return fullFormatter.format(safeValue)
    } catch {
      return undefined
    }
  }, [compact, safeValue, currency])

  return (
    <span
      className={`
        font-medium tabular-nums
        ${getColorClass()}
        ${className}
      `}
      title={fullValue}
    >
      {showPlusSign && '+'}
      {formatted}
    </span>
  )
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Format number to IDR without component (for non-React usage)
 */
export function formatIDR(value: number, compact = false): string {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  })
  return formatter.format(value)
}

/**
 * Parse formatted currency back to number
 */
export function parseCurrency(formatted: string): number {
  const cleaned = formatted
    .replace(/[Rp\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  
  return parseFloat(cleaned) || 0
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string = 'IDR'): string {
  const symbols: Record<string, string> = {
    IDR: 'Rp',
    USD: '$',
    SGD: 'S$',
    JPY: '¥',
    EUR: '€',
  }
  return symbols[currency] || currency
}
