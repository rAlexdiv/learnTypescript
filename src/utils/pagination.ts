// src/utils/pagination.ts

export interface PaginationResult {
  page: number;
  limit: number;
  offset: number;
}

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Рассчитывает параметры пагинации.
 * Принимает уже валидированные числа.
 */
export const getPagination = (
  page: number = 1,
  limit: number = DEFAULT_LIMIT
): PaginationResult => {
  // Гарантируем корректные значения (защита на всякий случай)
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
  const offset = (safePage - 1) * safeLimit;

  return { page: safePage, limit: safeLimit, offset };
};