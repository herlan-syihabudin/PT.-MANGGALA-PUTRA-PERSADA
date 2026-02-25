export interface ProposalData {
  // Nomor & Tanggal
  nomor: string
  tanggal: string

  // Customer
  customer: {
    nama: string
    perusahaan: string
    alamat: string
  }

  // Proyek
  proyek: {
    nama: string
    lokasi: string
  }

  // Total (diisi otomatis dari kalkulasi)
  total: number
  validity: string

  // Untuk Summary
  summarySections: SummarySection[]

  // Untuk Breakdown
  breakdownItems: BreakdownItem[]
}

export interface SummarySection {
  no: string
  section: string
  unit: string
  qty: number
  amount: number
}

export interface BreakdownItem {
  no: number
  description: string
  unit: string
  qty: number
  unitPrice: number
  amount: number
  section: 'struktur' | 'arsitektur' | 'mep' | 'lainnya'
}
