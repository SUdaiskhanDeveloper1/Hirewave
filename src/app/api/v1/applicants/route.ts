import { parseApplicantsQuery } from '@/lib/api/query-params';
import { getApplicantsPage } from '@/lib/server/queries';
import { jsonResponse, mockLatency } from '@/lib/server/response';

export async function GET(request: Request): Promise<Response> {
  await mockLatency();
  const { searchParams } = new URL(request.url);
  // Recruiter data is per-account: never cached in a shared cache.
  return jsonResponse(getApplicantsPage(parseApplicantsQuery(searchParams)), { cacheSeconds: 0 });
}
