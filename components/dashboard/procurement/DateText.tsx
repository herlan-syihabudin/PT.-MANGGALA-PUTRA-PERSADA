'use client'

import { useMemo } from 'react'

interface DateTextProps {
  date?: string | Date | null
  format?: 'short' | 'long' | 'iso' | 'datetime' | 'relative' | 'custom'
  highlightOverdue?: boolean
  highlightFuture?: boolean
  relativeThreshold?: 'day' | 'week' | 'month' | 'year'
  includeSeconds?: boolean
  includeTimezone?: boolean
  customFormat?: Intl.DateTimeFormatOptions
  fallback?: string
  showTooltip?: boolean
  className?: string
}

export default function DateText({
  date,
  format = 'short',
  highlightOverdue = false,
  highlightFuture = false,
  relativeThreshold = 'day',
  includeSeconds = false,
  includeTimezone = false,
  customFormat,
  fallback = '-',
  showTooltip = true,
  className = '',
}: DateTextProps) {
  // Memoize date parsing
  const { parsedDate, isValid, isOverdue, isFuture, timeDiff } = useMemo(() => {
    if (!date) return { parsedDate: null, isValid: false, isOverdue: false, isFuture: false, timeDiff: 0 }

    const d = new Date(date)
    const isValid = !isNaN(d.getTime())
    const now = new Date()
    
    return {
      parsedDate: d,
      isValid,
      isOverdue: isValid && d < now,
      isFuture: isValid && d > now,
      timeDiff: isValid ? d.getTime() - now.getTime() : 0,
    }
  }, [date])

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    if (!parsedDate || !isValid) return null

    const now = new Date()
    const absDiff = Math.abs(timeDiff)
    const seconds = Math.floor(absDiff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    // ===== RELATIVE FORMAT =====
    if (format === 'relative') {
      const isPast = parsedDate < now

      // Under 1 minute
      if (seconds < 60) return isPast ? 'Baru saja' : 'Sebentar lagi'
      
      // Under 1 hour
      if (minutes < 60) {
        return isPast 
          ? `${minutes} menit lalu`
          : `${minutes} menit lagi`
      }
      
      // Under 24 hours
      if (hours < 24) {
        return isPast
          ? `${hours} jam lalu`
          : `${hours} jam lagi`
      }

      // Threshold: day
      if (relativeThreshold === 'day') {
        if (days === 0) return 'Hari ini'
        if (days === 1) return isPast ? 'Kemarin' : 'Besok'
        if (days < 7) return isPast ? `${days} hari lalu` : `${days} hari lagi`
      }

      // Threshold: week
      if (relativeThreshold === 'week') {
        if (weeks === 0) return 'Minggu ini'
        if (weeks === 1) return isPast ? 'Minggu lalu' : 'Minggu depan'
        if (weeks < 5) return isPast ? `${weeks} minggu lalu` : `${weeks} minggu lagi`
      }

      // Threshold: month
      if (relativeThreshold === 'month') {
        if (months === 0) return 'Bulan ini'
        if (months === 1) return isPast ? 'Bulan lalu' : 'Bulan depan'
        if (months < 12) return isPast ? `${months} bulan lalu` : `${months} bulan lagi`
      }

      // Default: year
      if (years === 0) return 'Tahun ini'
      if (years === 1) return isPast ? 'Tahun lalu' : 'Tahun depan'
      return isPast ? `${years} tahun lalu` : `${years} tahun lagi`
    }

    // ===== ISO FORMAT =====
    if (format === 'iso') {
      return parsedDate.toISOString().split('T')[0]
    }

    // ===== DATETIME FORMAT =====
    if (format === 'datetime') {
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' }),
        ...(includeTimezone && { timeZoneName: 'short' }),
      }
      return `${parsedDate.toLocaleDateString('id-ID')} ${parsedDate.toLocaleTimeString('id-ID', timeOptions)}`
    }

    // ===== LONG FORMAT =====
    if (format === 'long') {
      return parsedDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    // ===== CUSTOM FORMAT =====
    if (format === 'custom' && customFormat) {
      return parsedDate.toLocaleDateString('id-ID', customFormat)
    }

    // ===== SHORT FORMAT (default) =====
    return parsedDate.toLocaleDateString('id-ID')
  }, [parsedDate, isValid, format, timeDiff, relativeThreshold, includeSeconds, includeTimezone, customFormat])

  // Memoize tooltip
  const tooltipDate = useMemo(() => {
    if (!parsedDate || !isValid || !showTooltip) return undefined
    
    return parsedDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    })
  }, [parsedDate, isValid, showTooltip])

  // Handle invalid/empty dates
  if (!parsedDate || !isValid) {
    return <span className="text-gray-400">{fallback}</span>
  }

  // Determine text color
  const textColor = 
    (highlightOverdue && isOverdue) ? 'text-red-600 font-medium' :
    (highlightFuture && isFuture) ? 'text-green-600 font-medium' :
    ''

  return (
    <span
      className={`${textColor} ${className}`}
      title={tooltipDate}
      data-date={parsedDate.toISOString()}
    >
      {formattedDate}
    </span>
  )
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Format date to Indonesian short format (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string | null): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID')
}

/**
 * Format date to Indonesian long format
 */
export function formatDateLong(date: Date | string | null): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date | string | null): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const absDiff = Math.abs(diff)
  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  const isPast = d < now
  
  if (seconds < 60) return isPast ? 'baru saja' : 'sebentar lagi'
  if (minutes < 60) return isPast ? `${minutes} menit lalu` : `${minutes} menit lagi`
  if (hours < 24) return isPast ? `${hours} jam lalu` : `${hours} jam lagi`
  if (days === 0) return 'hari ini'
  if (days === 1) return isPast ? 'kemarin' : 'besok'
  if (days < 7) return isPast ? `${days} hari lalu` : `${days} hari lagi`
  return isPast ? `${Math.floor(days/7)} minggu lalu` : `${Math.floor(days/7)} minggu lagi`
}

/**
 * Check if date is overdue
 */
export function isOverdue(date: Date | string | null): boolean {
  if (!date) return false
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  return d < new Date()
}

/**
 * Add days to date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
