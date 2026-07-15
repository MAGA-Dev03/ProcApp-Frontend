import type { Supplier } from '../../types/supplier';
import mockSuppliers from '../../mocks/suppliers.json';
import { createMockRepository } from '../shared/createMockRepository';
import { generateSequentialId } from '../shared/generateSequentialId';

export const supplierRepository = createMockRepository<Supplier>({
  seed: mockSuppliers as Supplier[],
  generateId: (existingIds) => generateSequentialId(existingIds, 'SUP-', 3),
});
