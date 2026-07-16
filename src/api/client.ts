/**
 * Domain-level API facade consumed by features. Every function here currently delegates to the
 * in-memory mock backend in `src/api/mock/`. This file is the single swap point for the real
 * Spring Boot API: once that's ready, replace each re-export below with a function that calls
 * `http` (see `src/api/http.ts`) against the matching REST endpoint. Signatures and return shapes
 * (e.g. `Page<T>`) are already modeled on the real API, so feature code won't need to change.
 */
export {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  cancelInvoice,
  activateInvoice,
  clearFinanceSubmission,
  recordGrn,
  batchAddToFinance,
  checkDuplicateInvoiceNumber,
  listProjects,
  getProject,
  listSuppliers,
  getSupplier,
  listUsers,
  getUser,
  login,
  getAgingBuckets,
  getAgingBucketBreakdown,
  getTopSuppliersByPayable,
  getReceivedVsSubmittedTrend,
  seedSummary,
} from './mock'

export type {
  ListInvoicesParams,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  RecordGrnPayload,
  BatchAddToFinancePayload,
  DuplicateInvoiceCheckResult,
} from './mock/invoices'
export type { ListProjectsParams } from './mock/projects'
export type { ListSuppliersParams } from './mock/suppliers'
export type { ListUsersParams } from './mock/users'
export type { LoginPayload, LoginResult } from './mock/auth'
export type {
  AgingBucketKey,
  AgingBucket,
  AgingBreakdownRow,
  AgingBucketBreakdown,
  TopSupplier,
  TrendPoint,
} from './mock/dashboard'

export { ApiError } from './apiError'
