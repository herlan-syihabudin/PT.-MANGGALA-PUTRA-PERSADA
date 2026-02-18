interface MoneyProps {
  value?: number | null
  currency?: 'IDR' | 'USD'
  compact?: boolean
  showSign?: boolean
  highlightNegative?: boolean
  className?: string
}

export default function Money({
  value = 0,
  currency = 'IDR',
  compact = false,
  showSign = false,
  highlightNegative = true,
  className = '',
}: MoneyProps) {
  const safeValue = Number(value) || 0

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'IDR' ? 0 : 2,
    maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    notation: compact ? 'compact' : 'standard',
  })

  const formatted = formatter.format(safeValue)

  const isNegative = safeValue < 0

  return (
    <span
      className={`
        font-medium
        ${highlightNegative && isNegative ? 'text-red-600' : ''}
        ${className}
      `}
    >
      {showSign && safeValue > 0 ? '+' : ''}
      {formatted}
    </span>
  )
}
