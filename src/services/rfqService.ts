import { useQuery } from '@tanstack/react-query';
import type { Rfq } from '../types/rfq';
import mockRfqs from '../mocks/rfqs.json';

async function fetchRfqs(): Promise<Rfq[]> {
  // TODO: swap to apiClient.get<Rfq[]>('/rfqs') once the real endpoint exists
  return mockRfqs as Rfq[];
}

export function useRfqs() {
  return useQuery({
    queryKey: ['rfqs'],
    queryFn: fetchRfqs,
  });
}
