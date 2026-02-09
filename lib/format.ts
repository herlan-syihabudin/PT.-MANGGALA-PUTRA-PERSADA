// lib/format.ts

export function formatIDR(value: number): string {
  if (!value || isNaN(value)) return "Rp 0"

  return `Rp ${value.toLocaleString("id-ID")}`
}
