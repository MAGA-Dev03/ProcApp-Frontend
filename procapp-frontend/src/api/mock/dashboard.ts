import type { Invoice } from '@/types'
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

export interface DashboardSummary {
  /** Sum of value where active && !listNo - the open receivable, same scope as the aging chart. */
  outstandingValue: number
  /** Count where the GRN process isn't complete yet (grnNumber or grnReceivedDate still null). */
  grnPendingCount: number
  /** Count where the GRN is complete but the invoice hasn't been batched to finance yet. */
  readyToSubmitCount: number
  /** Sum of value where financeSubmitDate falls in the current calendar month. */
  submittedThisMonthValue: number
}

export interface CycleTimeStats {
  /** Average receivedDate -> financeSubmitDate, over all-time submitted invoices. */
  averageDays: number
  /** Same average, scoped to invoices submitted in the current/previous calendar month - either
   * can be null if that month has no submissions yet, in which case the UI skips the trend line
   * rather than showing a misleading comparison. */
  currentMonthAverageDays: number | null
  previousMonthAverageDays: number | null
}

export interface MonthlyInvoiceVolume {
  month: string
  monthLabel: string
  invoiceCount: number
}

export interface FinanceBatchSummary {
  listNo: string
  financeSubmitDate: string
  invoiceCount: number
  totalValue: number
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

/** Trailing 12 calendar months, oldest first, including months with no data - every chart keyed
 * by month uses this same fixed window so an inactive month still renders as a zero bar/point
 * rather than silently disappearing. */
function trailingMonths(): Array<{ key: string; label: string }> {
  const now = new Date()
  const months: Array<{ key: string; label: string }> = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: MONTH_LABEL_FORMATTER.format(date),
    })
  }
  return months
}

export async function getReceivedVsSubmittedTrend(): Promise<TrendPoint[]> {
  await delay()

  const months = trailingMonths()
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

/** GRN not yet complete - matches the "OPEN" bucket in seed terms, i.e. still needs action before
 * it can even be batched. Scoped to active invoices only: a cancelled invoice missing a GRN isn't
 * something anyone still needs to chase. */
function isGrnPending(invoice: Invoice): boolean {
  return invoice.active && (!invoice.grnNumber || !invoice.grnReceivedDate)
}

/** GRN complete but not yet batched to finance - exactly the invoices a manager would expect to
 * see move in the next Add-to-Finance submission. */
function isReadyToSubmit(invoice: Invoice): boolean {
  return (
    invoice.active &&
    Boolean(invoice.grnNumber) &&
    Boolean(invoice.grnReceivedDate) &&
    !invoice.listNo
  )
}

function isSameCalendarMonth(dateStr: string, reference: Date): boolean {
  const date = new Date(dateStr)
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth()
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay()

  const now = new Date()
  let outstandingValue = 0
  let grnPendingCount = 0
  let readyToSubmitCount = 0
  let submittedThisMonthValue = 0

  for (const invoice of db.invoices) {
    if (invoice.active && !invoice.listNo) outstandingValue += invoice.value
    if (isGrnPending(invoice)) grnPendingCount += 1
    if (isReadyToSubmit(invoice)) readyToSubmitCount += 1
    if (invoice.financeSubmitDate && isSameCalendarMonth(invoice.financeSubmitDate, now)) {
      submittedThisMonthValue += invoice.value
    }
  }

  return { outstandingValue, grnPendingCount, readyToSubmitCount, submittedThisMonthValue }
}

function averageCycleDays(
  invoices: Array<{ receivedDate: string; financeSubmitDate: string | null }>,
): number | null {
  const submitted = invoices.filter(
    (inv): inv is { receivedDate: string; financeSubmitDate: string } =>
      inv.financeSubmitDate !== null,
  )
  if (submitted.length === 0) return null

  const totalDays = submitted.reduce((sum, inv) => {
    const days =
      (new Date(inv.financeSubmitDate).getTime() - new Date(inv.receivedDate).getTime()) /
      (1000 * 60 * 60 * 24)
    return sum + days
  }, 0)
  return totalDays / submitted.length
}

export async function getAverageCycleTimeDays(): Promise<CycleTimeStats> {
  await delay()

  const now = new Date()
  const previousMonthReference = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const overall = averageCycleDays(db.invoices)
  const currentMonth = averageCycleDays(
    db.invoices.filter(
      (inv) => inv.financeSubmitDate && isSameCalendarMonth(inv.financeSubmitDate, now),
    ),
  )
  const previousMonth = averageCycleDays(
    db.invoices.filter(
      (inv) =>
        inv.financeSubmitDate && isSameCalendarMonth(inv.financeSubmitDate, previousMonthReference),
    ),
  )

  return {
    // No submissions at all is a genuine edge case (a brand new deployment) rather than something
    // that should ever surface with this seed data - 0 is a safe, honest fallback either way.
    averageDays: overall ?? 0,
    currentMonthAverageDays: currentMonth,
    previousMonthAverageDays: previousMonth,
  }
}

export async function getMonthlyInvoiceVolume(): Promise<MonthlyInvoiceVolume[]> {
  await delay()

  const months = trailingMonths()
  const countByMonth = new Map<string, number>()

  for (const invoice of db.invoices) {
    const key = monthKey(invoice.receivedDate)
    countByMonth.set(key, (countByMonth.get(key) ?? 0) + 1)
  }

  return months.map(({ key, label }) => ({
    month: key,
    monthLabel: label,
    invoiceCount: countByMonth.get(key) ?? 0,
  }))
}

export async function getRecentFinanceBatches(limit = 10): Promise<FinanceBatchSummary[]> {
  await delay()

  const batches = new Map<
    string,
    { financeSubmitDate: string; invoiceCount: number; totalValue: number }
  >()

  for (const invoice of db.invoices) {
    if (!invoice.listNo || !invoice.financeSubmitDate) continue
    const existing = batches.get(invoice.listNo)
    if (existing) {
      existing.invoiceCount += 1
      existing.totalValue += invoice.value
    } else {
      batches.set(invoice.listNo, {
        financeSubmitDate: invoice.financeSubmitDate,
        invoiceCount: 1,
        totalValue: invoice.value,
      })
    }
  }

  return [...batches.entries()]
    .map(([listNo, summary]) => ({ listNo, ...summary }))
    .sort((a, b) => (a.financeSubmitDate < b.financeSubmitDate ? 1 : -1))
    .slice(0, limit)
}
