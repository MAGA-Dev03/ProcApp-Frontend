import type {
  Invoice,
  InvoiceSource,
  InvoiceType,
  InvoiceWithRelations,
  Page,
  PageParams,
} from '@/types'
import { ApiError } from '../apiError'
import { db, nextInvoiceId } from './db'
import { delay, maybeFail, paginate, toIsoDate } from './utils'

export interface ListInvoicesParams extends PageParams {
  projectId?: number
  supplierId?: number
  invoiceType?: InvoiceType
  invoiceSource?: InvoiceSource
  active?: boolean
  hasListNo?: boolean
  /** True = already submitted to finance (financeSubmitDate set); false = still pending. */
  financeSubmitted?: boolean
  search?: string
  dateFrom?: string
  dateTo?: string
  /** Filters on receivedDate instead of invoiceDate - e.g. a month picker. */
  receivedDateFrom?: string
  receivedDateTo?: string
}

export type CreateInvoicePayload = Pick<
  Invoice,
  | 'invoiceType'
  | 'invoiceSource'
  | 'projectId'
  | 'supplierId'
  | 'invoiceNumber'
  | 'invoiceDate'
  | 'receivedDate'
  | 'purchaseOrderNumber'
  | 'value'
  | 'pioNumber'
> &
  Partial<Pick<Invoice, 'remarks' | 'attachmentUrl' | 'grnNumber' | 'grnReceivedDate'>> & {
    authorUserId: number
  }

export type UpdateInvoicePayload = Partial<Omit<Invoice, 'id' | 'createdAt' | 'authorUserId'>> & {
  updatedByUserId: number
}

export interface RecordGrnPayload {
  grnNumber: string
  grnReceivedDate: string
  pioNumber?: string
  updatedByUserId: number
}

export interface BatchAddToFinancePayload {
  financeSubmitDate: string
  updatedByUserId: number
}

function toInvoiceWithRelations(invoice: Invoice): InvoiceWithRelations {
  const project = db.projects.find((p) => p.id === invoice.projectId)
  const supplier = db.suppliers.find((s) => s.id === invoice.supplierId)
  const author = db.users.find((u) => u.id === invoice.authorUserId)
  const updatedBy = invoice.updatedByUserId
    ? db.users.find((u) => u.id === invoice.updatedByUserId)
    : null

  if (!project || !supplier || !author) {
    throw new ApiError(`Invoice ${invoice.id} references missing project/supplier/author`, 500)
  }

  return {
    ...invoice,
    project: { id: project.id, code: project.code, name: project.name, status: project.status },
    supplier: {
      id: supplier.id,
      name: supplier.name,
      businessPartnerCode: supplier.businessPartnerCode,
    },
    author: { id: author.id, name: author.name },
    updatedBy: updatedBy ? { id: updatedBy.id, name: updatedBy.name } : null,
  }
}

function findInvoiceOrThrow(id: number): Invoice {
  const invoice = db.invoices.find((inv) => inv.id === id)
  if (!invoice) {
    throw new ApiError(`Invoice ${id} not found`, 404)
  }
  return invoice
}

export async function listInvoices(
  params: ListInvoicesParams = {},
): Promise<Page<InvoiceWithRelations>> {
  await delay()

  let results = db.invoices

  if (params.projectId !== undefined) {
    results = results.filter((inv) => inv.projectId === params.projectId)
  }
  if (params.supplierId !== undefined) {
    results = results.filter((inv) => inv.supplierId === params.supplierId)
  }
  if (params.invoiceType) {
    results = results.filter((inv) => inv.invoiceType === params.invoiceType)
  }
  if (params.invoiceSource) {
    results = results.filter((inv) => inv.invoiceSource === params.invoiceSource)
  }
  if (params.active !== undefined) {
    results = results.filter((inv) => inv.active === params.active)
  }
  if (params.hasListNo !== undefined) {
    results = results.filter((inv) => Boolean(inv.listNo) === params.hasListNo)
  }
  if (params.financeSubmitted !== undefined) {
    results = results.filter((inv) => Boolean(inv.financeSubmitDate) === params.financeSubmitted)
  }
  if (params.dateFrom) {
    results = results.filter((inv) => inv.invoiceDate >= params.dateFrom!)
  }
  if (params.dateTo) {
    results = results.filter((inv) => inv.invoiceDate <= params.dateTo!)
  }
  if (params.receivedDateFrom) {
    results = results.filter((inv) => inv.receivedDate >= params.receivedDateFrom!)
  }
  if (params.receivedDateTo) {
    results = results.filter((inv) => inv.receivedDate <= params.receivedDateTo!)
  }
  if (params.search) {
    const search = params.search.toLowerCase()
    results = results.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(search) ||
        inv.purchaseOrderNumber.toLowerCase().includes(search) ||
        (inv.listNo ?? '').toLowerCase().includes(search),
    )
  }

  const sorted = [...results].sort((a, b) => (a.invoiceDate < b.invoiceDate ? 1 : -1))
  const page = paginate(sorted, params)

  return { ...page, content: page.content.map(toInvoiceWithRelations) }
}

export async function getInvoice(id: number): Promise<InvoiceWithRelations> {
  await delay()
  return toInvoiceWithRelations(findInvoiceOrThrow(id))
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
  await delay()

  maybeFail(0.1, 'Validation failed', {
    invoiceNumber: 'An invoice with this number may already exist for the supplier.',
  })

  if (!db.projects.some((p) => p.id === payload.projectId)) {
    throw new ApiError('Validation failed', 422, { projectId: 'Project does not exist.' })
  }
  if (!db.suppliers.some((s) => s.id === payload.supplierId)) {
    throw new ApiError('Validation failed', 422, { supplierId: 'Supplier does not exist.' })
  }
  if (payload.value <= 0) {
    throw new ApiError('Validation failed', 422, { value: 'Value must be greater than zero.' })
  }

  const now = toIsoDate(new Date())
  const invoice: Invoice = {
    id: nextInvoiceId(),
    invoiceType: payload.invoiceType,
    invoiceSource: payload.invoiceSource,
    projectId: payload.projectId,
    supplierId: payload.supplierId,
    invoiceNumber: payload.invoiceNumber,
    invoiceDate: payload.invoiceDate,
    receivedDate: payload.receivedDate,
    purchaseOrderNumber: payload.purchaseOrderNumber,
    value: payload.value,
    pioNumber: payload.pioNumber,
    grnNumber: payload.grnNumber ?? null,
    grnReceivedDate: payload.grnReceivedDate ?? null,
    listNo: null,
    financeSubmitDate: null,
    remarks: payload.remarks ?? null,
    attachmentUrl: payload.attachmentUrl ?? null,
    attachmentViewed: false,
    active: true,
    authorUserId: payload.authorUserId,
    updatedByUserId: null,
    createdAt: now,
    updatedAt: now,
  }

  db.invoices.push(invoice)
  return invoice
}

export async function updateInvoice(id: number, payload: UpdateInvoicePayload): Promise<Invoice> {
  await delay()
  maybeFail(0.08, 'Validation failed', { value: 'Value must be greater than zero.' })

  const invoice = findInvoiceOrThrow(id)
  const updated: Invoice = {
    ...invoice,
    ...payload,
    id: invoice.id,
    createdAt: invoice.createdAt,
    authorUserId: invoice.authorUserId,
    updatedAt: toIsoDate(new Date()),
  }

  const index = db.invoices.findIndex((inv) => inv.id === id)
  db.invoices[index] = updated
  return updated
}

/** Hard delete: for data-entry mistakes only. Use cancelInvoice to retire a real invoice with history. */
export async function deleteInvoice(id: number): Promise<void> {
  await delay()

  findInvoiceOrThrow(id)
  const index = db.invoices.findIndex((inv) => inv.id === id)
  db.invoices.splice(index, 1)
}

/** Audit-preserving toggle, restricted to the Procurement Manager role in the UI layer. */
export async function cancelInvoice(id: number, updatedByUserId: number): Promise<Invoice> {
  await delay()

  const invoice = findInvoiceOrThrow(id)
  invoice.active = false
  invoice.updatedByUserId = updatedByUserId
  invoice.updatedAt = toIsoDate(new Date())
  return invoice
}

export async function activateInvoice(id: number, updatedByUserId: number): Promise<Invoice> {
  await delay()

  const invoice = findInvoiceOrThrow(id)
  invoice.active = true
  invoice.updatedByUserId = updatedByUserId
  invoice.updatedAt = toIsoDate(new Date())
  return invoice
}

/**
 * "Un-batch" escape hatch: clears listNo/financeSubmitDate so the invoice drops back to the
 * pending-finance list. Only updatedAt/updatedByUserId record that this happened - there is no
 * separate audit log entry, which the UI must make visible to the user before they confirm.
 */
export async function clearFinanceSubmission(
  id: number,
  updatedByUserId: number,
): Promise<Invoice> {
  await delay()

  const invoice = findInvoiceOrThrow(id)
  invoice.listNo = null
  invoice.financeSubmitDate = null
  invoice.updatedByUserId = updatedByUserId
  invoice.updatedAt = toIsoDate(new Date())
  return invoice
}

export async function recordGrn(id: number, payload: RecordGrnPayload): Promise<Invoice> {
  await delay()
  maybeFail(0.08, 'Validation failed', { grnNumber: 'GRN number is required.' })

  const invoice = findInvoiceOrThrow(id)
  invoice.grnNumber = payload.grnNumber
  invoice.grnReceivedDate = payload.grnReceivedDate
  if (payload.pioNumber) {
    invoice.pioNumber = payload.pioNumber
  }
  invoice.updatedByUserId = payload.updatedByUserId
  invoice.updatedAt = toIsoDate(new Date())
  return invoice
}

export interface DuplicateInvoiceCheckResult {
  isDuplicate: boolean
  existingInvoiceId?: number
}

/** Soft check only - never blocks submission, just informs the user. */
export async function checkDuplicateInvoiceNumber(params: {
  supplierId: number
  invoiceNumber: string
  excludeInvoiceId?: number
}): Promise<DuplicateInvoiceCheckResult> {
  await delay(150, 350)

  const normalized = params.invoiceNumber.trim().toLowerCase()
  if (!normalized) return { isDuplicate: false }

  const match = db.invoices.find(
    (inv) =>
      inv.supplierId === params.supplierId &&
      inv.invoiceNumber.trim().toLowerCase() === normalized &&
      inv.id !== params.excludeInvoiceId,
  )

  return match ? { isDuplicate: true, existingInvoiceId: match.id } : { isDuplicate: false }
}

export async function batchAddToFinance(
  invoiceIds: number[],
  payload: BatchAddToFinancePayload,
): Promise<Invoice[]> {
  await delay(400, 900)
  maybeFail(0.05, 'One or more invoices could not be submitted to finance', {
    invoiceIds: 'At least one selected invoice is missing a GRN.',
  })

  const [year, month, day] = payload.financeSubmitDate.split('-')
  const results: Invoice[] = []

  invoiceIds.forEach((id, index) => {
    const invoice = findInvoiceOrThrow(id)
    if (!invoice.grnNumber) {
      throw new ApiError(`Invoice ${id} cannot be submitted to finance without a GRN`, 422)
    }
    const existingCountToday = db.invoices.filter((inv) =>
      (inv.listNo ?? '').startsWith(`${year}/${month}/${day}/`),
    ).length
    invoice.listNo = `${year}/${month}/${day}/${String(existingCountToday + index + 1).padStart(3, '0')}`
    invoice.financeSubmitDate = payload.financeSubmitDate
    invoice.updatedByUserId = payload.updatedByUserId
    invoice.updatedAt = toIsoDate(new Date())
    results.push(invoice)
  })

  return results
}
