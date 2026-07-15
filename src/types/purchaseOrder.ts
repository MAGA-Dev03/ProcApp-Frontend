import type { StatusTone } from '../app/tokens';
import type { LineItem } from './lineItem';

export type PoStatus = Extract<
  StatusTone,
  'draft' | 'pendingApproval' | 'approved' | 'rejected' | 'issued'
>;

export interface PurchaseOrder {
  id: string;
  rfqId: string;
  supplierId: string;
  projectId: string;
  status: PoStatus;
  lineItems: LineItem[];
  totalValue: number;
  createdDate: string;
  issuedDate: string | null;
}
