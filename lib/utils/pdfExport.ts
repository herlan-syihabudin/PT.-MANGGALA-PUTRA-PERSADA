import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PDFColumn {
  header: string
  dataKey: string
  width?: number
}

interface ExportPDFOptions {
  title: string
  subtitle?: string
  columns: PDFColumn[]
  data: any[]
  fileName?: string
  orientation?: 'portrait' | 'landscape'
  showCompanyInfo?: boolean
}

/**
 * Export data ke PDF dengan format profesional
 * 
 * @example
 * exportToPDF({
 *   title: 'Daftar Vendor',
 *   columns: [
 *     { header: 'Kode', dataKey: 'vendor_code' },
 *     { header: 'Nama', dataKey: 'vendor_name' },
 *   ],
 *   data: vendors,
 *   fileName: 'vendors.pdf'
 * })
 */
export function exportToPDF({
  title,
  subtitle,
  columns,
  data,
  fileName = 'export.pdf',
  orientation = 'landscape',
  showCompanyInfo = true,
}: ExportPDFOptions) {
  // Initialize PDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  })

  let yPos = 15

  // ===== Company Header =====
  if (showCompanyInfo) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('PT MANGGALA PUTRA PERSADA', 14, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Jl. Contoh No. 123, Jakarta', 14, yPos)
    yPos += 5
    doc.text('Telp: (021) 1234-5678 | Email: info@mpp.co.id', 14, yPos)
    yPos += 8
  }

  // ===== Title =====
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, yPos)
  yPos += 6

  // ===== Subtitle / Date =====
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  if (subtitle) {
    doc.text(subtitle, 14, yPos)
    yPos += 5
  }
  
  doc.text(`Generated: ${new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 14, yPos)
  
  yPos += 8

  // ===== Table =====
  autoTable(doc, {
    startY: yPos,
    head: [columns.map(col => col.header)],
    body: data.map(row =>
      columns.map(col => {
        const value = row[col.dataKey]
        
        // Format currency jika value adalah number
        if (typeof value === 'number' && col.dataKey.includes('price') || 
            col.dataKey.includes('amount') || 
            col.dataKey.includes('total')) {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value)
        }
        
        // Format date jika value adalah tanggal
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
          return new Date(value).toLocaleDateString('id-ID')
        }
        
        return value ?? '-'
      })
    ),
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249],
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width }
      }
      return acc
    }, {} as Record<number, { cellWidth: number }>),
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer setiap halaman
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Halaman ${i} dari ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }
    },
  })

  // ===== Summary =====
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 10
  
  if (data.length > 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Data: ${data.length} baris`, 14, finalY + 10)
  }

  // ===== Save =====
  doc.save(fileName)
}

/**
 * Export data ke PDF dengan grouping
 * 
 * @example
 * exportGroupedPDF({
 *   title: 'Laporan Per Kategori',
 *   groups: [
 *     { title: 'Kategori A', data: itemsA },
 *     { title: 'Kategori B', data: itemsB },
 *   ],
 *   columns: [...]
 * })
 */
export function exportGroupedPDF({
  title,
  groups,
  columns,
  fileName = 'grouped-export.pdf',
}: {
  title: string
  groups: Array<{ title: string; data: any[] }>
  columns: PDFColumn[]
  fileName?: string
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  let yPos = 15

  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('PT MANGGALA PUTRA PERSADA', 14, yPos)
  yPos += 7

  doc.setFontSize(14)
  doc.text(title, 14, yPos)
  yPos += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 14, yPos)
  yPos += 8

  // Loop groups
  groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) {
      doc.addPage()
      yPos = 20
    }

    // Group Title
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(group.title, 14, yPos)
    yPos += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Jumlah: ${group.data.length} item`, 14, yPos)
    yPos += 6

    // Table untuk group ini
    autoTable(doc, {
      startY: yPos,
      head: [columns.map(col => col.header)],
      body: group.data.map(row =>
        columns.map(col => row[col.dataKey] ?? '-')
      ),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    })

    yPos = (doc as any).lastAutoTable?.finalY + 10 || yPos + 50
  })

  doc.save(fileName)
}
