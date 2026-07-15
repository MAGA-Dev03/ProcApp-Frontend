import type { Rfq } from '../../types/rfq';
import mockRfqs from '../../mocks/rfqs.json';
import { createMockRepository } from '../shared/createMockRepository';
import { generateSequentialId } from '../shared/generateSequentialId';

export const rfqRepository = createMockRepository<Rfq>({
  seed: mockRfqs as Rfq[],
  generateId: (existingIds) => generateSequentialId(existingIds, 'RFQ-', 4),
});
