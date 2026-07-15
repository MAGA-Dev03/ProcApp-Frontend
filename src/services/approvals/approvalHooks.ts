import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Approval, ApprovalStatus } from '../../types/approval';
import { approvalRepository } from './approvalRepository';

export interface ApprovalFilters {
  poId?: string;
  approverId?: string;
  status?: ApprovalStatus;
}

export type CreateApprovalInput = Omit<Approval, 'id'>;
export type UpdateApprovalInput = Partial<CreateApprovalInput>;

const approvalKeys = {
  all: ['approvals'] as const,
  list: (filters?: ApprovalFilters) => ['approvals', 'list', filters ?? {}] as const,
  detail: (id: string) => ['approvals', 'detail', id] as const,
};

function matchesFilters(approval: Approval, filters?: ApprovalFilters): boolean {
  if (!filters) return true;
  if (filters.poId && approval.poId !== filters.poId) return false;
  if (filters.approverId && approval.approverId !== filters.approverId) return false;
  if (filters.status && approval.status !== filters.status) return false;
  return true;
}

export function useApprovals(filters?: ApprovalFilters) {
  return useQuery({
    queryKey: approvalKeys.list(filters),
    queryFn: () => approvalRepository.list((approval) => matchesFilters(approval, filters)),
  });
}

export function useApproval(id: string | undefined) {
  return useQuery({
    queryKey: approvalKeys.detail(id ?? ''),
    queryFn: () => approvalRepository.getById(id as string).then((result) => result ?? null),
    enabled: Boolean(id),
  });
}

export function useCreateApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApprovalInput) => approvalRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

export function useUpdateApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateApprovalInput }) => approvalRepository.update(id, changes),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
      queryClient.setQueryData(approvalKeys.detail(updated.id), updated);
    },
  });
}
