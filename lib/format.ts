// lib/format.ts

type CurrencyFormat = 'full' | 'compact' | 'short'
type CurrencyUnit = 'IDR' | 'USD' | 'JPY'

interface FormatOptions {
  format?: CurrencyFormat
  unit?: CurrencyUnit
  showZero?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Format angka ke format mata uang Rupiah
 * 
 * @param value - Angka yang akan diformat
 * @param options - Opsi formatting
 * @returns String terformat
 * 
 * @example
 * formatIDR(1000000) // "Rp 1.000.000"
 * formatIDR(1500000, { format: 'compact' }) // "Rp 1,5 Jt"
 * formatIDR(-50000) // "-Rp 50.000"
 */
export function formatIDR(
  value: number | null | undefined,
  options: FormatOptions = {}
): string {
  const {
    format = 'full',
    unit = 'IDR',
    showZero = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options

  // Handle null/undefined/NaN
  if (value === null || value === undefined || isNaN(value)) {
    return showZero ? 'Rp 0' : '-'
  }

  // Handle negatif
  const isNegative = value < 0
  const absValue = Math.abs(value)

  // Compact format (jutaan, miliaran)
  if (format === 'compact') {
    if (absValue >= 1_000_000_000) {
      return `${isNegative ? '-' : ''}Rp ${(absValue / 1_000_000_000).toFixed(1)} M`
    }
    if (absValue >= 1_000_000) {
      return `${isNegative ? '-' : ''}Rp ${(absValue / 1_000_000).toFixed(1)} Jt`
    }
    if (absValue >= 1_000) {
      return `${isNegative ? '-' : ''}Rp ${(absValue / 1_000).toFixed(1)} Rb`
    }
  }

  // Short format (tanpa spasi)
  if (format === 'short') {
    const formatted = absValue.toLocaleString('id-ID', {
      minimumFractionDigits,
      maximumFractionDigits,
    })
    return `${isNegative ? '-' : ''}Rp${formatted}`
  }

  // Full format (default)
  const formatted = absValue.toLocaleString('id-ID', {
    minimumFractionDigits,
    maximumFractionDigits,
  })

  return `${isNegative ? '-' : ''}Rp ${formatted}`
}

/**
 * Format angka ke format compact (jutaan, miliaran)
 * 
 * @param value - Angka yang akan diformat
 * @returns String terformat compact
 * 
 * @example
 * formatCompactIDR(1500000) // "Rp 1,5 Jt"
 * formatCompactIDR(2000000000) // "Rp 2 M"
 */
export function formatCompactIDR(value: number | null | undefined): string {
  return formatIDR(value, { format: 'compact' })
}

/**
 * Format angka tanpa satuan (hanya angka terformat)
 * 
 * @param value - Angka yang akan diformat
 * @returns String angka terformat
 * 
 * @example
 * formatNumber(1000000) // "1.000.000"
 */
export function formatNumber(
  value: number | null | undefined,
  options: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) return '0'

  return value.toLocaleString('id-ID', {
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  })
}

/**
 * Format tanggal ke format Indonesia
 * 
 * @param date - Date string atau Date object
 * @param format - Format tanggal (short/long)
 * @returns String tanggal terformat
 * 
 * @example
 * formatDate('2024-01-15') // "15/01/2024"
 * formatDate('2024-01-15', 'long') // "15 Januari 2024"
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: 'short' | 'long' | 'iso' = 'short'
): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  if (format === 'iso') {
    return d.toISOString().split('T')[0]
  }

  if (format === 'long') {
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format persentase
 * 
 * @param value - Nilai persentase (0.15 = 15%)
 * @param options - Opsi formatting
 * @returns String persentase
 * 
 * @example
 * formatPercent(0.15) // "15%"
 * formatPercent(0.1555, { decimals: 1 }) // "15,6%"
 */
export function formatPercent(
  value: number | null | undefined,
  options: {
    decimals?: number
    showPlus?: boolean
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) return '0%'

  const { decimals = 0, showPlus = false } = options
  const percent = value * 100
  const sign = showPlus && value > 0 ? '+' : ''

  return `${sign}${percent.toFixed(decimals)}%`.replace('.', ',')
}

/**
 * Format durasi waktu
 * 
 * @param minutes - Durasi dalam menit
 * @returns String durasi
 * 
 * @example
 * formatDuration(90) // "1 jam 30 menit"
 * formatDuration(45) // "45 menit"
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '0 menit'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins} menit`
  if (mins === 0) return `${hours} jam`
  return `${hours} jam ${mins} menit`
}

/**
 * Format file size
 * 
 * @param bytes - Ukuran file dalam bytes
 * @returns String file size
 * 
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
}

/**
 * Parse string Rupiah ke number
 * 
 * @param value - String Rupiah (contoh: "Rp 1.000.000")
 * @returns Number
 * 
 * @example
 * parseIDR("Rp 1.000.000") // 1000000
 * parseIDR("Rp 1.500,50") // 1500.5
 */
export function parseIDR(value: string): number {
  if (!value) return 0

  // Hapus "Rp", titik, dan spasi, ganti koma dengan titik
  const cleaned = value
    .replace(/[Rp\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')

  return parseFloat(cleaned) || 0
}
