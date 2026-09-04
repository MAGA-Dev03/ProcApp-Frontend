import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { InvoiceWithRelations } from '@/types'
import { formatCurrency } from '@/lib/format'
import { assetUrl } from '@/lib/utils'

interface DocWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number }
}

const SIGNATURE_LABELS = ['Prepared By', 'Checked By', 'Certified By', 'Approved By']

/** jsPDF's addImage needs the image data up front (base64/data URL), not a URL it can load
 * itself - so the logo is fetched and inlined once per report generation. */
async function loadLogoDataUrl(): Promise<string> {
  const response = await fetch(assetUrl('/logo.png'))
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read logo image'))
    reader.readAsDataURL(blob)
  })
}

export async function downloadFinanceReportPdf(listNo: string, invoices: InvoiceWithRelations[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const total = invoices.reduce((sum, invoice) => sum + invoice.value, 0)
  const pageWidth = doc.internal.pageSize.getWidth()

  // Logo's natural size is 120x78 (a ~1.54:1 lockup) - scale it down to a letterhead-sized mark
  // and let the title/meta text sit to its right, like a real procurement document's letterhead.
  const logoWidth = 66
  const logoHeight = logoWidth * (78 / 120)
  const logoDataUrl = await loadLogoDataUrl()
  doc.addImage(logoDataUrl, 'PNG', 40, 30, logoWidth, logoHeight)

  const textX = 40 + logoWidth + 16
  doc.setFontSize(14)
  doc.text('Payment Submission — Procurement Department', textX, 50)
  doc.setFontSize(10)
  doc.text(`List No: ${listNo}`, textX, 68)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, textX, 82)

  autoTable(doc, {
    startY: 30 + logoHeight + 20,
    head: [['Invoice No', 'Project', 'Supplier', 'PO Number', 'Value']],
    body: invoices.map((invoice) => [
      invoice.invoiceNumber,
      `${invoice.project.name} (${invoice.project.code})`,
      invoice.supplier.name,
      invoice.purchaseOrderNumber,
      formatCurrency(invoice.value),
    ]),
    foot: [['', '', '', 'Total', formatCurrency(total)]],
    styles: { fontSize: 9 },
    footStyles: { fontStyle: 'bold' },
  })

  const finalY = (doc as DocWithAutoTable).lastAutoTable.finalY + 50
  const margin = 40
  const colWidth = (pageWidth - margin * 2) / SIGNATURE_LABELS.length

  doc.setFontSize(9)
  SIGNATURE_LABELS.forEach((label, index) => {
    const x = margin + index * colWidth
    doc.line(x, finalY, x + colWidth - 24, finalY)
    doc.text(label, x, finalY + 14)
  })

  doc.save(`finance-report-${listNo.replaceAll('/', '-')}.pdf`)
}
