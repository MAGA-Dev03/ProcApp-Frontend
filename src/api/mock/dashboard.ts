import { db } from './db'
import { delay } from './utils'

export const AGING_BUCKET_KEYS = [
  '<30',
  '31-45',
  '46-60',
  '61-75',
  '76-90',
  '91-120',
  '120+',
] as const

export type AgingBucketKey = (typeof AGING_BUCKET_KEYS)[number]

export interface AgingBucket {
  bucket: AgingBucketKey
  totalValue: number
  invoiceCount: number
}

export interface AgingBreakdownRow {
  id: number
  name: string
  totalValue: number
  invoiceCount: number
}

export interface AgingBucketBreakdown {
  bucket: AgingBucketKey
  bySupplier: AgingBreakdownRow[]
  byProject: AgingBreakdownRow[]
}

export interface TopSupplier {
  supplierId: number
  supplierName: string
  outstandingValue: number
}

export interface TrendPoint {
  month: string
  monthLabel: string
  receivedValue: number
  submittedValue: number
}

const BUCKET_UPPER_BOUNDS: Array<{ bucket: AgingBucketKey; maxDays: number }> = [
  { bucket: '<30', maxDays: 29 },
  { bucket: '31-45', maxDays: 45 },
  { bucket: '46-60', maxDays: 60 },
  { bucket: '61-75', maxDays: 75 },
  { bucket: '76-90', maxDays: 90 },
  { bucket: '91-120', maxDays: 120 },
  { bucket: '120+', maxDays: Infinity },
]

function daysSince(dateStr: string, now: Date): number {
  const date = new Date(dateStr)
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function bucketFor(days: number): AgingBucketKey {
  return BUCKET_UPPER_BOUNDS.find((b) => days <= b.maxDays)!.bucket
}

/** Outstanding = active and not yet submitted to finance - the receivable is still open. */
function outstandingInvoices() {
  return db.invoices.filter((inv) => inv.active && !inv.listNo)
}

export async function getAgingBuckets(): Promise<AgingBucket[]> {
  await delay()

  const now = new Date()
  const totals = new Map<AgingBucketKey, { totalValue: number; invoiceCount: number }>()
  for (const key of AGING_BUCKET_KEYS) totals.set(key, { totalValue: 0, invoiceCount: 0 })

  for (const invoice of outstandingInvoices()) {
    const bucket = bucketFor(daysSince(invoice.invoiceDate, now))
    const entry = totals.get(bucket)!
    entry.totalValue += invoice.value
    entry.invoiceCount += 1
  }

  return AGING_BUCKET_KEYS.map((bucket) => ({ bucket, ...totals.get(bucket)! }))
}

export async function getAgingBucketBreakdown(
  bucket: AgingBucketKey,
): Promise<AgingBucketBreakdown> {
  await delay()

  const now = new Date()
  const invoicesInBucket = outstandingInvoices().filter(
    (inv) => bucketFor(daysSince(inv.invoiceDate, now)) === bucket,
  )

  const bySupplierMap = new Map<number, AgingBreakdownRow>()
  const byProjectMap = new Map<number, AgingBreakdownRow>()

  for (const invoice of invoicesInBucket) {
    const supplier = db.suppliers.find((s) => s.id === invoice.supplierId)
    const project = db.projects.find((p) => p.id === invoice.projectId)

    if (supplier) {
      const row = bySupplierMap.get(supplier.id) ?? {
        id: supplier.id,
        name: supplier.name,
        totalValue: 0,
        invoiceCount: 0,
      }
      row.totalValue += invoice.value
      row.invoiceCount += 1
      bySupplierMap.set(supplier.id, row)
    }

    if (project) {
      const row = byProjectMap.get(project.id) ?? {
        id: project.id,
        name: project.name,
        totalValue: 0,
        invoiceCount: 0,
      }
      row.totalValue += invoice.value
      row.invoiceCount += 1
      byProjectMap.set(project.id, row)
    }
  }

  const sortByValueDesc = (a: AgingBreakdownRow, b: AgingBreakdownRow) =>
    b.totalValue - a.totalValue

  return {
    bucket,
    bySupplier: [...bySupplierMap.values()].sort(sortByValueDesc),
    byProject: [...byProjectMap.values()].sort(sortByValueDesc),
  }
}

export async function getTopSuppliersByPayable(limit = 10): Promise<TopSupplier[]> {
  await delay()

  const totals = new Map<number, number>()
  for (const invoice of outstandingInvoices()) {
    totals.set(invoice.supplierId, (totals.get(invoice.supplierId) ?? 0) + invoice.value)
  }

  return [...totals.entries()]
    .map(([supplierId, outstandingValue]) => ({
      supplierId,
      supplierName: db.suppliers.find((s) => s.id === supplierId)?.name ?? 'Unknown supplier',
      outstandingValue,
    }))
    .sort((a, b) => b.outstandingValue - a.outstandingValue)
    .slice(0, limit)
}

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
}

export async function getReceivedVsSubmittedTrend(): Promise<TrendPoint[]> {
  await delay()

  const now = new Date()
  const months: Array<{ key: string; label: string }> = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: MONTH_LABEL_FORMATTER.format(date),
    })
  }

  const receivedByMonth = new Map<string, number>()
  const submittedByMonth = new Map<string, number>()

  for (const invoice of db.invoices) {
    const receivedKey = monthKey(invoice.receivedDate)
    receivedByMonth.set(receivedKey, (receivedByMonth.get(receivedKey) ?? 0) + invoice.value)

    if (invoice.financeSubmitDate) {
      const submittedKey = monthKey(invoice.financeSubmitDate)
      submittedByMonth.set(submittedKey, (submittedByMonth.get(submittedKey) ?? 0) + invoice.value)
    }
  }

  return months.map(({ key, label }) => ({
    month: key,
    monthLabel: label,
    receivedValue: receivedByMonth.get(key) ?? 0,
    submittedValue: submittedByMonth.get(key) ?? 0,
  }))
}
