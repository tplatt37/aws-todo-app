import { fetchFeatureFlags } from '@/lib/featureFlags';
import { createErrorResponse, createSuccessResponse } from '@/utils/errorHandler';

// GET /api/feature-flags - Get all feature flags
export async function GET() {
  try {
    const featureFlags = await fetchFeatureFlags();
    return createSuccessResponse(featureFlags);
  } catch (error) {
    console.error('GET /api/feature-flags error:', error);
    return createErrorResponse(error);
  }
}
