import type { StatusTone } from '../app/tokens';
import type { LineItem } from './lineItem';

export type RfqStatus = Extract<StatusTone, 'draft' | 'sent' | 'responsesReceived' | 'closed'>;

export type SupplierResponseStatus = Extract<StatusTone, 'submitted' | 'awarded' | 'rejected'>;

export interface SupplierResponse {
  supplierId: string;
  submittedDate: string;
  totalQuoted: number;
  status: SupplierResponseStatus;
  notes?: string;
}

export interface Rfq {
  id: string;
  title: string;
  projectId: string;
  requesterId: string;
  status: RfqStatus;
  createdDate: string;
  dueDate: string | null;
  lineItems: LineItem[];
  targetSupplierIds: string[];
  supplierResponses: SupplierResponse[];
}
