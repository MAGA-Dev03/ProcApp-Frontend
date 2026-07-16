import type { Page, PageParams, Supplier } from '@/types'
import { ApiError } from '../apiError'
import { db } from './db'
import { delay, paginate } from './utils'

export interface ListSuppliersParams extends PageParams {
  search?: string
}

export async function listSuppliers(params: ListSuppliersParams = {}): Promise<Page<Supplier>> {
  await delay()

  let results = db.suppliers
  if (params.search) {
    const search = params.search.toLowerCase()
    results = results.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(search) ||
        supplier.businessPartnerCode.toLowerCase().includes(search),
    )
  }

  return paginate(results, params)
}

export async function getSupplier(id: number): Promise<Supplier> {
  await delay()

  const supplier = db.suppliers.find((s) => s.id === id)
  if (!supplier) {
    throw new ApiError(`Supplier ${id} not found`, 404)
  }
  return supplier
}
