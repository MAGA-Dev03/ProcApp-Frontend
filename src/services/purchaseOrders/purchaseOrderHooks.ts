import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PoStatus, PurchaseOrder } from '../../types/purchaseOrder';
import { purchaseOrderRepository } from './purchaseOrderRepository';

export interface PurchaseOrderFilters {
  status?: PoStatus;
  projectId?: string;
  supplierId?: string;
  rfqId?: string;
}

export type CreatePurchaseOrderInput = Omit<PurchaseOrder, 'id'>;
export type UpdatePurchaseOrderInput = Partial<CreatePurchaseOrderInput>;

const purchaseOrderKeys = {
  all: ['purchaseOrders'] as const,
  list: (filters?: PurchaseOrderFilters) => ['purchaseOrders', 'list', filters ?? {}] as const,
  detail: (id: string) => ['purchaseOrders', 'detail', id] as const,
};

function matchesFilters(po: PurchaseOrder, filters?: PurchaseOrderFilters): boolean {
  if (!filters) return true;
  if (filters.status && po.status !== filters.status) return false;
  if (filters.projectId && po.projectId !== filters.projectId) return false;
  if (filters.supplierId && po.supplierId !== filters.supplierId) return false;
  if (filters.rfqId && po.rfqId !== filters.rfqId) return false;
  return true;
}

export function usePurchaseOrders(filters?: PurchaseOrderFilters) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(filters),
    queryFn: () => purchaseOrderRepository.list((po) => matchesFilters(po, filters)),
  });
}

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id ?? ''),
    queryFn: () => purchaseOrderRepository.getById(id as string).then((result) => result ?? null),
    enabled: Boolean(id),
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePurchaseOrderInput) => purchaseOrderRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdatePurchaseOrderInput }) =>
      purchaseOrderRepository.update(id, changes),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      queryClient.setQueryData(purchaseOrderKeys.detail(updated.id), updated);
    },
  });
}
