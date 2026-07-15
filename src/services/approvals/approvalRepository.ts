import type { Approval } from '../../types/approval';
import mockApprovals from '../../mocks/approvals.json';
import { createMockRepository } from '../shared/createMockRepository';
import { generateSequentialId } from '../shared/generateSequentialId';

export const approvalRepository = createMockRepository<Approval>({
  seed: mockApprovals as Approval[],
  generateId: (existingIds) => generateSequentialId(existingIds, 'APR-', 4),
});
