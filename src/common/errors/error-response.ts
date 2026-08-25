export function createErrorResponse(params: {
  message: string;
  code: string;
  details?: unknown;
  requestId?: string;
}) {
  return {
    success: false,
    error: {
      message: params.message,
      code: params.code,
      details: params.details,
      requestId: params.requestId,
    },
  };
}
