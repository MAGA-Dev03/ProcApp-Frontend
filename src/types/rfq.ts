export interface Rfq {
  id: string;
  title: string;
  status: 'draft' | 'submitted' | 'awarded' | 'closed';
  requestedBy: string;
  createdAt: string;
}
