import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Rfq, RfqStatus } from '../../types/rfq';
import { rfqRepository } from './rfqRepository';

export interface RfqFilters {
  status?: RfqStatus;
  projectId?: string;
  requesterId?: string;
}

export type CreateRfqInput = Omit<Rfq, 'id'>;
export type UpdateRfqInput = Partial<CreateRfqInput>;

const rfqKeys = {
  all: ['rfqs'] as const,
  list: (filters?: RfqFilters) => ['rfqs', 'list', filters ?? {}] as const,
  detail: (id: string) => ['rfqs', 'detail', id] as const,
};

function matchesFilters(rfq: Rfq, filters?: RfqFilters): boolean {
  if (!filters) return true;
  if (filters.status && rfq.status !== filters.status) return false;
  if (filters.projectId && rfq.projectId !== filters.projectId) return false;
  if (filters.requesterId && rfq.requesterId !== filters.requesterId) return false;
  return true;
}

export function useRfqs(filters?: RfqFilters) {
  return useQuery({
    queryKey: rfqKeys.list(filters),
    queryFn: () => rfqRepository.list((rfq) => matchesFilters(rfq, filters)),
  });
}

export function useRfq(id: string | undefined) {
  return useQuery({
    queryKey: rfqKeys.detail(id ?? ''),
    queryFn: () => rfqRepository.getById(id as string).then((result) => result ?? null),
    enabled: Boolean(id),
  });
}

export function useCreateRfq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRfqInput) => rfqRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.all });
    },
  });
}

export function useUpdateRfq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateRfqInput }) => rfqRepository.update(id, changes),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: rfqKeys.all });
      queryClient.setQueryData(rfqKeys.detail(updated.id), updated);
    },
  });
}
