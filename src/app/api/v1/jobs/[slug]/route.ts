import { getJob } from '@/lib/server/queries';
import { apiError, jsonResponse, mockLatency } from '@/lib/server/response';

interface RouteContext {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  await mockLatency();
  const { slug } = await context.params;
  const job = await getJob(slug);
  if (!job) return apiError(404, 'job_not_found', `No job posting matches "${slug}".`);
  return jsonResponse(job, { cacheSeconds: 300 });
}
