import type { PaginatedResult } from "./types";

export interface PaginationArgs {
  page: number;
  pageSize: number;
}

export function toPaginationParams({ page, pageSize }: PaginationArgs) {
  const take = pageSize;
  const skip = (page - 1) * pageSize;
  return { take, skip };
}

export function buildPaginatedResult<T>(data: T[], total: number, pagination: PaginationArgs): PaginatedResult<T> {
  return {
    data,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}
