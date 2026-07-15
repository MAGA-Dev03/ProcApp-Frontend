import type { Approval } from '../../types/approval';
import type { PoStatus } from '../../types/purchaseOrder';

/**
 * Fixed approver assignment for newly-created POs. A real system would route by
 * org hierarchy; this mock keeps it deterministic so demo chains are reproducible.
 */
const APPROVER_STEP_1 = 'U-003';
const APPROVER_STEP_2 = 'U-004';
const FINANCE_STEP = 'U-005';

export function buildApprovalChain(totalValue: number): string[] {
  if (totalValue >= 1500000) return [APPROVER_STEP_1, APPROVER_STEP_2, FINANCE_STEP];
  if (totalValue >= 500000) return [APPROVER_STEP_1, FINANCE_STEP];
  return [APPROVER_STEP_1];
}

export function sortBySteps(approvals: Approval[]): Approval[] {
  return [...approvals].sort((a, b) => a.stepNumber - b.stepNumber);
}

/** The lowest-numbered still-pending step, assuming every earlier step is approved. */
export function getActionableApproval(approvals: Approval[]): Approval | undefined {
  const sorted = sortBySteps(approvals);
  return sorted.find((approval, index) => {
    if (approval.status !== 'pending') return false;
    const priorSteps = sorted.slice(0, index);
    return priorSteps.every((prior) => prior.status === 'approved');
  });
}

export function getRejection(approvals: Approval[]): Approval | undefined {
  return approvals.find((approval) => approval.status === 'rejected');
}

export interface CurrentStepSummary {
  label: string;
  tone: 'neutral' | 'active' | 'done' | 'blocked';
}

export function getCurrentStepSummary(poStatus: PoStatus, approvals: Approval[]): CurrentStepSummary {
  if (poStatus === 'draft') {
    return { label: 'Not submitted', tone: 'neutral' };
  }
  if (poStatus === 'approved') {
    return { label: 'Fully approved', tone: 'done' };
  }
  if (poStatus === 'issued') {
    return { label: 'Issued', tone: 'done' };
  }
  if (poStatus === 'rejected') {
    const rejection = getRejection(approvals);
    return {
      label: rejection ? `Rejected at step ${rejection.stepNumber}` : 'Rejected',
      tone: 'blocked',
    };
  }
  const totalSteps = approvals.length;
  const actionable = getActionableApproval(approvals);
  if (!actionable) {
    return { label: `Step — of ${totalSteps}`, tone: 'neutral' };
  }
  return { label: `Step ${actionable.stepNumber} of ${totalSteps}`, tone: 'active' };
}
