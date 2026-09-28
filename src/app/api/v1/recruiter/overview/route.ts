import { getOverview } from '@/lib/server/queries';
import { jsonResponse, mockLatency } from '@/lib/server/response';

export async function GET(): Promise<Response> {
  await mockLatency();
  return jsonResponse(getOverview(), { cacheSeconds: 0 });
}
