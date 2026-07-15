import type { Project } from '../../types/project';
import mockProjects from '../../mocks/projects.json';
import { createMockRepository } from '../shared/createMockRepository';
import { generateSequentialId } from '../shared/generateSequentialId';

export const projectRepository = createMockRepository<Project>({
  seed: mockProjects as Project[],
  generateId: (existingIds) => generateSequentialId(existingIds, 'PRJ-', 3),
});
