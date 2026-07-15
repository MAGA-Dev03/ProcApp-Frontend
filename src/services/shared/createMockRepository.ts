import { simulateLatency } from './simulateLatency';

export interface Repository<T, TInput = Omit<T, 'id'>> {
  list(predicate?: (item: T) => boolean): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(input: TInput): Promise<T>;
  update(id: string, changes: Partial<TInput>): Promise<T>;
}

interface CreateMockRepositoryOptions<T extends { id: string }> {
  seed: T[];
  generateId: (existingIds: string[]) => string;
}

/**
 * In-memory stand-in for a REST resource. Exposes the same list/getById/create/update
 * shape a real Spring Boot-backed repository would, so swapping this file's
 * implementation for one backed by `apiClient` requires no changes in the hooks
 * or components that consume it.
 */
export function createMockRepository<T extends { id: string }>({
  seed,
  generateId,
}: CreateMockRepositoryOptions<T>): Repository<T> {
  let store: T[] = seed.map((item) => ({ ...item }));

  async function list(predicate?: (item: T) => boolean): Promise<T[]> {
    await simulateLatency();
    return predicate ? store.filter(predicate) : [...store];
  }

  async function getById(id: string): Promise<T | undefined> {
    await simulateLatency();
    return store.find((item) => item.id === id);
  }

  async function create(input: Omit<T, 'id'>): Promise<T> {
    await simulateLatency();
    const id = generateId(store.map((item) => item.id));
    const entity = { ...input, id } as T;
    store = [...store, entity];
    return entity;
  }

  async function update(id: string, changes: Partial<Omit<T, 'id'>>): Promise<T> {
    await simulateLatency();
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Record ${id} not found`);
    }
    const updated = { ...store[index], ...changes };
    store = [...store.slice(0, index), updated, ...store.slice(index + 1)];
    return updated;
  }

  return { list, getById, create, update };
}
