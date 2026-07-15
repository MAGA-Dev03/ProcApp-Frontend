import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Supplier, SupplierStatus } from '../../types/supplier';
import { supplierRepository } from './supplierRepository';

export interface SupplierFilters {
  status?: SupplierStatus;
  category?: string;
}

export type CreateSupplierInput = Omit<Supplier, 'id'>;
export type UpdateSupplierInput = Partial<CreateSupplierInput>;

const supplierKeys = {
  all: ['suppliers'] as const,
  list: (filters?: SupplierFilters) => ['suppliers', 'list', filters ?? {}] as const,
  detail: (id: string) => ['suppliers', 'detail', id] as const,
};

function matchesFilters(supplier: Supplier, filters?: SupplierFilters): boolean {
  if (!filters) return true;
  if (filters.status && supplier.status !== filters.status) return false;
  if (filters.category && supplier.category !== filters.category) return false;
  return true;
}

export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: supplierKeys.list(filters),
    queryFn: () => supplierRepository.list((supplier) => matchesFilters(supplier, filters)),
  });
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: supplierKeys.detail(id ?? ''),
    queryFn: () => supplierRepository.getById(id as string).then((result) => result ?? null),
    enabled: Boolean(id),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSupplierInput) => supplierRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateSupplierInput }) => supplierRepository.update(id, changes),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      queryClient.setQueryData(supplierKeys.detail(updated.id), updated);
    },
  });
}
