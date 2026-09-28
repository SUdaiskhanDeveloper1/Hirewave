import { parseJobsQuery } from '@/lib/api/query-params';
import { getJobFacets } from '@/lib/server/queries';
import { jsonResponse, mockLatency } from '@/lib/server/response';

export async function GET(request: Request): Promise<Response> {
  await mockLatency();
  const { searchParams } = new URL(request.url);
  // Facets change less often than results; cache them for longer.
  return jsonResponse(await getJobFacets(parseJobsQuery(searchParams)), { cacheSeconds: 300 });
}
