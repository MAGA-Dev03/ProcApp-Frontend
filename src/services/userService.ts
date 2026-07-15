import { useQuery } from '@tanstack/react-query';
import type { User } from '../types/user';
import mockUsers from '../mocks/users.json';
import { simulateLatency } from './shared/simulateLatency';

async function fetchUsers(): Promise<User[]> {
  // TODO: swap to apiClient.get<User[]>('/users') once the real endpoint exists
  await simulateLatency();
  return mockUsers as User[];
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
}
