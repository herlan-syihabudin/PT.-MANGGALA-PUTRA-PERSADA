import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PDFColumn {
  header: string
  dataKey: string
}

interface ExportPDFOptions {
  title: string
  columns: PDFColumn[]
  data: any[]
  fileName?: string
  orientation?: 'portrait' | 'landscape'
}

export function exportToPDF({
  title,
  columns,
  data,
  fileName = 'export.pdf',
  orientation = 'landscape',
}: ExportPDFOptions) {
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  })

  // ===== Header =====
  doc.setFontSize(16)
  doc.text('PT MANGGALA PUTRA PERSADA', 14, 15)

  doc.setFontSize(11)
  doc.text(title, 14, 22)

  doc.setFontSize(9)
  doc.text(
    `Generated: ${new Date().toLocaleString('id-ID')}`,
    14,
    28
  )

  // ===== Table =====
  autoTable(doc, {
    startY: 32,
    head: [columns.map(col => col.header)],
    body: data.map(row =>
      columns.map(col => row[col.dataKey] ?? '')
    ),
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  doc.save(fileName)
}
