interface DateTextProps {
  date?: string | Date | null
  format?: 'short' | 'long' | 'iso' | 'datetime' | 'relative'
  highlightOverdue?: boolean
  className?: string
}

export default function DateText({
  date,
  format = 'short',
  highlightOverdue = false,
  className = '',
}: DateTextProps) {
  if (!date) return <span className="text-gray-400">-</span>

  const d = new Date(date)

  if (isNaN(d.getTime())) {
    return <span className="text-red-500">Invalid Date</span>
  }

  const now = new Date()
  const isOverdue = d < now

  // ==== RELATIVE FORMAT ====
  if (format === 'relative') {
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return <span className={className}>Hari ini</span>
    if (days === 1) return <span className={className}>1 hari lalu</span>
    if (days > 1) return <span className={className}>{days} hari lalu</span>
  }

  // ==== ISO ====
  if (format === 'iso') {
    return (
      <span className={`font-mono text-xs ${className}`}>
        {d.toISOString().split('T')[0]}
      </span>
    )
  }

  // ==== DATETIME ====
  if (format === 'datetime') {
    return (
      <span className={className}>
        {d.toLocaleDateString('id-ID')} {d.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    )
  }

  // ==== LONG ====
  if (format === 'long') {
    return (
      <span className={className}>
        {d.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </span>
    )
  }

  // ==== SHORT (default) ====
  return (
    <span
      className={`
        ${highlightOverdue && isOverdue ? 'text-red-600 font-medium' : ''}
        ${className}
      `}
    >
      {d.toLocaleDateString('id-ID')}
    </span>
  )
}
