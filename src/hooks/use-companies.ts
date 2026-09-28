'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { CompaniesQuery, CompaniesResponse } from '@/lib/api/contracts';
import { companiesApi } from '@/lib/api/endpoints';
import { STALE_TIME } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';

export function useCompanies(query: CompaniesQuery, initialData?: CompaniesResponse) {
  return useQuery({
    queryKey: queryKeys.companies.list(query),
    queryFn: ({ signal }) => companiesApi.list(query, { signal }),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME.detail,
    ...(initialData ? { initialData } : {}),
  });
}
