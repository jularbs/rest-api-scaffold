export function createErrorResponse(params: { message: string; code: string; details?: unknown }) {
  return {
    success: false,
    error: {
      message: params.message,
      code: params.code,
      details: params.details,
    },
  };
}
