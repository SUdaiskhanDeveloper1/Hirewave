import { getCompany } from '@/lib/server/queries';
import { apiError, jsonResponse, mockLatency } from '@/lib/server/response';

interface RouteContext {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  await mockLatency();
  const { slug } = await context.params;
  const company = await getCompany(slug);
  if (!company) return apiError(404, 'company_not_found', `No company matches "${slug}".`);
  return jsonResponse(company, { cacheSeconds: 600 });
}
