export function createSuccessResponse<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    meta: meta ?? null,
  };
}
