import { useMemo, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Reusable client-side pagination hook.
 * Clamps current page safely without synchronous effects.
 */
export function usePagination(items = [], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    startIndex,
    endIndex,
    paginatedItems,
    setPage,
    nextPage: () => setPage((p) => Math.min(totalPages, p + 1)),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
  };
}
