import type { PurchaseOrder } from '../../types/purchaseOrder';
import mockPurchaseOrders from '../../mocks/purchaseOrders.json';
import { createMockRepository } from '../shared/createMockRepository';
import { generateSequentialId } from '../shared/generateSequentialId';

export const purchaseOrderRepository = createMockRepository<PurchaseOrder>({
  seed: mockPurchaseOrders as PurchaseOrder[],
  generateId: (existingIds) => generateSequentialId(existingIds, 'PO-', 4),
});
