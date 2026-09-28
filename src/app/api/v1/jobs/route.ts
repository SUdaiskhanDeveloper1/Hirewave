import { parseJobsQuery } from '@/lib/api/query-params';
import { getJobsPage } from '@/lib/server/queries';
import { jsonResponse, mockLatency } from '@/lib/server/response';

export async function GET(request: Request): Promise<Response> {
  await mockLatency();
  const { searchParams } = new URL(request.url);
  return jsonResponse(await getJobsPage(parseJobsQuery(searchParams)));
}
