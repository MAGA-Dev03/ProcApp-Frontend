import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { InvoiceWithRelations } from '@/types'
import { formatCurrency } from '@/lib/format'

interface DocWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number }
}

const SIGNATURE_LABELS = ['Prepared By', 'Checked By', 'Certified By', 'Approved By']

export function downloadFinanceReportPdf(listNo: string, invoices: InvoiceWithRelations[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const total = invoices.reduce((sum, invoice) => sum + invoice.value, 0)
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(14)
  doc.text('Payment Submission — Procurement Department', 40, 40)
  doc.setFontSize(10)
  doc.text(`List No: ${listNo}`, 40, 60)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 40, 75)

  autoTable(doc, {
    startY: 95,
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
