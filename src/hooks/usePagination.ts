import { useState, useMemo, useCallback } from 'react';

/**
 * 페이지네이션 상태를 관리하는 훅의 반환 타입
 */
export interface PaginationState {
  /** 현재 페이지 번호 (1부터 시작) */
  currentPage: number;
  /** 페이지당 항목 수 */
  pageSize: number;
  /** 전체 항목 수 */
  totalItems: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 다음 페이지로 이동 */
  nextPage: () => void;
  /** 이전 페이지로 이동 */
  previousPage: () => void;
  /** 특정 페이지로 이동 */
  goToPage: (page: number) => void;
  /** 첫 페이지로 이동 */
  goToFirstPage: () => void;
  /** 마지막 페이지로 이동 */
  goToLastPage: () => void;
  /** 페이지 크기 변경 */
  setPageSize: (size: number) => void;
  /** 다음 페이지 존재 여부 */
  hasNextPage: boolean;
  /** 이전 페이지 존재 여부 */
  hasPreviousPage: boolean;
  /** 현재 페이지의 시작 인덱스 (0부터 시작) */
  startIndex: number;
  /** 현재 페이지의 끝 인덱스 (0부터 시작) */
  endIndex: number;
}

/** 페이지네이션 훅. totalItems / pageSize → currentPage·startIndex·endIndex·next·prev·jumpTo */
export function usePagination(
  totalItems: number,
  initialPageSize: number = 10,
  initialPage: number = 1
): PaginationState {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // 전체 페이지 수 계산
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  // 현재 페이지의 시작/끝 인덱스 계산
  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize - 1, totalItems - 1);
  }, [startIndex, pageSize, totalItems]);

  // 페이지 이동 가능 여부
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // 다음 페이지로 이동
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  // 이전 페이지로 이동
  const previousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  // 특정 페이지로 이동
  const goToPage = useCallback(
    (page: number) => {
      const pageNumber = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );

  // 첫 페이지로 이동
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // 마지막 페이지로 이동
  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // 페이지 크기 변경 시 첫 페이지로 리셋
  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    goToFirstPage,
    goToLastPage,
    setPageSize: handleSetPageSize,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
  };
}
