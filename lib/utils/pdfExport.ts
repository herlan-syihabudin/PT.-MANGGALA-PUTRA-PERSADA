// lib/utils/pdfExport.ts
import jsPDF from "jspdf"
import autoTable, { type UserOptions } from "jspdf-autotable"

interface PDFColumn {
  header: string
  dataKey: string
  width?: number
}

interface CompanyInfo {
  name: string
  address?: string
  phone?: string
  email?: string
}

interface ExportPDFOptions {
  title: string
  subtitle?: string
  columns: PDFColumn[]
  data: any[]
  fileName?: string
  orientation?: "portrait" | "landscape"
  showCompanyInfo?: boolean
  companyInfo?: CompanyInfo
  watermarkText?: string
}

/**
 * Default company info (bisa diganti via options.companyInfo)
 */
const DEFAULT_COMPANY: CompanyInfo = {
  name: "PT Manggala Putra Persada",
  address: "Jl. Contoh No. 123, Jakarta",
  phone: "(021) 1234-5678",
  email: "info@mpp.co.id",
}

/**
 * Helper: render watermark ringan di background
 */
function drawWatermark(doc: jsPDF, text: string) {
  const pageSize = doc.internal.pageSize
  const width = pageSize.getWidth()
  const height = pageSize.getHeight()

  doc.saveGraphicsState()
  doc.setTextColor(230, 230, 230)
  doc.setFontSize(40)
  doc.setFont("helvetica", "bold")
  doc.text(text, width / 2, height / 2, {
    align: "center",
    angle: 30,
  } as any)
  doc.restoreGraphicsState()
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
  fileName = "export.pdf",
  orientation = "landscape",
  showCompanyInfo = true,
  companyInfo,
  watermarkText,
}: ExportPDFOptions) {
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  })

  const meta = { ...DEFAULT_COMPANY, ...(companyInfo || {}) }

  let yPos = 15

  // ===== OPTIONAL WATERMARK =====
  if (watermarkText) {
    drawWatermark(doc, watermarkText)
  }

  // ===== COMPANY HEADER =====
  if (showCompanyInfo) {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(meta.name, 14, yPos)
    yPos += 7

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    if (meta.address) {
      doc.text(meta.address, 14, yPos)
      yPos += 5
    }

    const contactParts: string[] = []
    if (meta.phone) contactParts.push(`Telp: ${meta.phone}`)
    if (meta.email) contactParts.push(`Email: ${meta.email}`)
    if (contactParts.length) {
      doc.text(contactParts.join(" | "), 14, yPos)
      yPos += 8
    } else {
      yPos += 3
    }
  }

  // ===== TITLE =====
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(title, 14, yPos)
  yPos += 6

  // ===== SUBTITLE & GENERATED DATE =====
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")

  if (subtitle) {
    doc.text(subtitle, 14, yPos)
    yPos += 5
  }

  doc.text(
    `Generated: ${new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    14,
    yPos
  )

  yPos += 8

  // ===== TABLE =====
  autoTable(doc, {
    startY: yPos,
    head: [columns.map((col) => col.header)],
    body: data.map((row) =>
      columns.map((col) => {
        const value = row[col.dataKey]

        // ✅ Fix logic: hanya format currency jika NUMBER dan key mengandung kata tertentu
        if (
          typeof value === "number" &&
          (col.dataKey.toLowerCase().includes("price") ||
            col.dataKey.toLowerCase().includes("amount") ||
            col.dataKey.toLowerCase().includes("total") ||
            col.dataKey.toLowerCase().includes("nilai"))
        ) {
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)
        }

        // Format date jika string match yyyy-mm-dd
        if (
          typeof value === "string" &&
          value.match(/^\d{4}-\d{2}-\d{2}/)
        ) {
          return new Date(value).toLocaleDateString("id-ID")
        }

        return value ?? "-"
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
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249],
    },
    columnStyles: columns.reduce(
      (acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width }
        }
        return acc
      },
      {} as Record<number, { cellWidth: number }>
    ),
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      // ✅ Footer per halaman (lebih efisien)
      const pageNumber =
        (doc as any).internal?.getCurrentPageInfo?.().pageNumber ??
        doc.getNumberOfPages()
      const pageCount = doc.getNumberOfPages()

      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Halaman ${pageNumber} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" as any }
      )
    },
  } as UserOptions)

  // ===== SUMMARY =====
  const finalY =
    (doc as any).lastAutoTable?.finalY ||
    yPos + 10

  if (data.length > 0) {
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Data: ${data.length} baris`, 14, finalY + 10)
  }

  // ===== SAVE =====
  doc.save(fileName)
}

/**
 * Export data ke PDF dengan grouping (per kategori, per proyek, dsb)
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
  fileName = "grouped-export.pdf",
  companyInfo,
  watermarkText,
}: {
  title: string
  groups: Array<{ title: string; data: any[] }>
  columns: PDFColumn[]
  fileName?: string
  companyInfo?: CompanyInfo
  watermarkText?: string
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const meta = { ...DEFAULT_COMPANY, ...(companyInfo || {}) }

  let yPos = 15

  if (watermarkText) {
    drawWatermark(doc, watermarkText)
  }

  // ===== COMPANY HEADER =====
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(meta.name, 14, yPos)
  yPos += 7

  doc.setFontSize(14)
  doc.text(title, 14, yPos)
  yPos += 6

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(
    `Generated: ${new Date().toLocaleString("id-ID")}`,
    14,
    yPos
  )
  yPos += 8

  // ===== LOOP GROUPS =====
  groups.forEach((group, groupIndex) => {
    if (groupIndex > 0) {
      doc.addPage()
      yPos = 20

      if (watermarkText) {
        drawWatermark(doc, watermarkText)
      }
    }

    // Group Title
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(group.title, 14, yPos)
    yPos += 6

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Jumlah: ${group.data.length} item`, 14, yPos)
    yPos += 6

    autoTable(doc, {
      startY: yPos,
      head: [columns.map((col) => col.header)],
      body: group.data.map((row) =>
        columns.map((col) => row[col.dataKey] ?? "-")
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
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249],
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        const pageNumber =
          (doc as any).internal?.getCurrentPageInfo?.()
            .pageNumber ?? doc.getNumberOfPages()
        const pageCount = doc.getNumberOfPages()

        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Halaman ${pageNumber} dari ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" as any }
        )
      },
    } as UserOptions)

    yPos =
      (doc as any).lastAutoTable?.finalY + 10 ||
      yPos + 50
  })

  doc.save(fileName)
}
