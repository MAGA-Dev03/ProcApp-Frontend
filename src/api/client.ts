/**
 * Domain-level API facade consumed by features. Every function here currently delegates to the
 * in-memory mock backend in `src/api/mock/`. This file is the single swap point for the real
 * Spring Boot API: once that's ready, replace each re-export below with a function that calls
 * `http` (see `src/api/http.ts`) against the matching REST endpoint. Signatures and return shapes
 * (e.g. `Page<T>`) are already modeled on the real API, so feature code won't need to change.
 */
export {
  listInvoices,
  listInvoicesForSiteKeeper,
  markAttachmentViewed,
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
  getDistinctListNumbers,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectDeleteImpact,
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateOwnProfile,
  listRoles,
  createRole,
  login,
  getAgingBuckets,
  getAgingBucketBreakdown,
  getTopSuppliersByPayable,
  getReceivedVsSubmittedTrend,
  getDashboardSummary,
  getAverageCycleTimeDays,
  getMonthlyInvoiceVolume,
  getRecentFinanceBatches,
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
export type {
  ListProjectsParams,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectDeleteImpact,
} from './mock/projects'
export type {
  ListSuppliersParams,
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from './mock/suppliers'
export type {
  ListUsersParams,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateOwnProfilePayload,
} from './mock/users'
export type { CreateRolePayload } from './mock/roles'
export type { LoginPayload, LoginResult } from './mock/auth'
export type {
  AgingBucketKey,
  AgingBucket,
  AgingBreakdownRow,
  AgingBucketBreakdown,
  TopSupplier,
  TrendPoint,
  DashboardSummary,
  CycleTimeStats,
  MonthlyInvoiceVolume,
  FinanceBatchSummary,
} from './mock/dashboard'

export { ApiError } from './apiError'
