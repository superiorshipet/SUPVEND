import { useState, useCallback } from 'react';

export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const goToPage = useCallback((p) => setPage(p), []);
  const nextPage = useCallback(() => setPage((p) => Math.min(p + 1, totalPages)), [totalPages]);
  const prevPage = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);

  const updateMeta = useCallback((meta) => {
    if (meta?.totalPages) setTotalPages(meta.totalPages);
    if (meta?.total) setTotalItems(meta.total);
  }, []);

  return {
    page,
    limit,
    totalPages,
    totalItems,
    setPage: goToPage,
    setLimit,
    nextPage,
    prevPage,
    updateMeta,
  };
}
