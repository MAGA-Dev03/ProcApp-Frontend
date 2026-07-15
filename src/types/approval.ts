import type { StatusTone } from '../app/tokens';

export type ApprovalStatus = Extract<StatusTone, 'pending' | 'approved' | 'rejected'>;

export interface Approval {
  id: string;
  poId: string;
  approverId: string;
  stepNumber: number;
  status: ApprovalStatus;
  decidedDate: string | null;
  comments: string | null;
}
