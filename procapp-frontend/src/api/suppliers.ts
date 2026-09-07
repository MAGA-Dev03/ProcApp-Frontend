import type { Page, PageParams, Supplier } from '@/types'
import { http } from './http'

export interface ListSuppliersParams extends PageParams {
    search?: string
}

export type CreateSupplierPayload = Pick <
    Supplier,
    'businessPartnerCode' | 'name' | 'address' | 'email' | 'contact'
>
export type UpdateSupplierPayload = Partial<CreateSupplierPayload>

export async function listSuppliers(params: ListSuppliersParams = {}): Promise<Page<Supplier>> {
    return http<Page<Supplier>>('/api/suppliers', { params: params as Record<string, any> })
}

export async function getSupplier(id: number): Promise<Supplier> {
    return http<Supplier>(`/api/suppliers/${id}`)
}

export async function createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
    return http<Supplier>(`/api/suppliers`, { method: 'POST', body: payload })
}

export async function updateSupplier(
    id: number,
    payload: UpdateSupplierPayload,
): Promise<Supplier> {
    const current = await getSupplier(id)
    const merged = { ...current, ...payload }
    const { id: _id, ...body } = merged as any
    return http<Supplier>(`/api/suppliers/${id}`, { method: 'PUT', body })
}

export async function deleteSupplier(id: number): Promise<void> {
    await http<void>(`/api/suppliers/${id}`, { method: 'DELETE' })
}