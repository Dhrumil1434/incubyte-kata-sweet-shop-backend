import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export class PaginatedApiResponse<T> {
  constructor(
    public statusCode: number,
    public data: PaginatedData<T>,
    public message: string
  ) {}

  send(res: Response): void {
    res.status(this.statusCode).json({
      success: true,
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
    });
  }
}

// Helper function to create paginated responses
export function createPaginatedResponse<T>(
  statusCode: number,
  items: T[],
  meta: PaginationMeta,
  message: string
): PaginatedApiResponse<T> {
  return new PaginatedApiResponse(statusCode, { items, meta }, message);
}

// Helper function to calculate pagination meta
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
}
