export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(params: { message: string; statusCode?: number; code?: string; details?: unknown }) {
    super(params.message);
    this.name = 'AppError';
    this.statusCode = params.statusCode || 500;
    this.code = params.code ?? 'INTERNAL SERVER ERROR';
    this.details = params.details;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}
