import { useMemo } from 'react';
import { usePurchaseOrders } from '../../services/purchaseOrders';
import { useApprovals } from '../../services/approvals';
import { useUsers } from '../../services/userService';
import { useRole } from '../../app/RoleContext';
import { getActionableApproval, sortBySteps } from './approvalChain';
import type { Approval } from '../../types/approval';
import type { PurchaseOrder } from '../../types/purchaseOrder';

export interface PendingApprovalRow {
  po: PurchaseOrder;
  approval: Approval;
  totalSteps: number;
}

/** POs whose next actionable approval step belongs to the currently active role. */
export function useMyPendingApprovals() {
  const { role } = useRole();
  const { data: purchaseOrders, isLoading: isLoadingPos, isError: isErrorPos } = usePurchaseOrders({
    status: 'pendingApproval',
  });
  const { data: approvals, isLoading: isLoadingApprovals, isError: isErrorApprovals } = useApprovals();
  const { data: users } = useUsers();

  const rows = useMemo<PendingApprovalRow[]>(() => {
    if (!purchaseOrders || !approvals) return [];
    return purchaseOrders
      .map((po) => {
        const poApprovals = sortBySteps(approvals.filter((a) => a.poId === po.id));
        const actionable = getActionableApproval(poApprovals);
        if (!actionable) return null;
        const approver = users?.find((u) => u.id === actionable.approverId);
        if (approver?.role !== role) return null;
        return { po, approval: actionable, totalSteps: poApprovals.length };
      })
      .filter((row): row is PendingApprovalRow => row !== null);
  }, [purchaseOrders, approvals, users, role]);

  return {
    rows,
    isLoading: isLoadingPos || isLoadingApprovals,
    isError: isErrorPos || isErrorApprovals,
  };
}
