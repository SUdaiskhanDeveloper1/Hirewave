import { getCompaniesPage } from '@/lib/server/queries';
import { jsonResponse, mockLatency } from '@/lib/server/response';

export async function GET(request: Request): Promise<Response> {
  await mockLatency();
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const perPage = Number.parseInt(searchParams.get('perPage') ?? '12', 10);

  return jsonResponse(await getCompaniesPage({
      q: searchParams.get('q') ?? undefined,
      industry: searchParams.get('industry') ?? undefined,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : 12,
    }),
    { cacheSeconds: 300 },
  );
}
