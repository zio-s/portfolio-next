import React from 'react';
import './Pagination.css';

/**
 * 페이지네이션 컴포넌트의 Props 인터페이스
 */
export interface PaginationProps {
  /** 현재 페이지 (1부터 시작) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 콜백 */
  onPageChange: (page: number) => void;
  /** 한 번에 표시할 페이지 버튼 수 */
  siblingCount?: number;
  /** 이전/다음 버튼 텍스트 표시 여부 */
  showText?: boolean;
  /** 처음/마지막 버튼 표시 여부 */
  showFirstLast?: boolean;
  /** 페이지 정보 표시 여부 */
  showInfo?: boolean;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 페이지 범위 생성 함수
 */
const generatePageRange = (
  current: number,
  total: number,
  siblingCount: number
): (number | string)[] => {
  // 총 표시할 페이지 수 = 현재 페이지 + 양옆 형제 + 처음/마지막 + 생략 부호
  const totalNumbers = siblingCount * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (total <= totalBlocks) {
    // 모든 페이지 표시
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(current - siblingCount, 1);
  const rightSiblingIndex = Math.min(current + siblingCount, total);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < total - 1;

  // 왼쪽 생략 없음
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, '...', total];
  }

  // 오른쪽 생략 없음
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => total - rightItemCount + i + 1
    );
    return [1, '...', ...rightRange];
  }

  // 양쪽 생략
  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, '...', ...middleRange, '...', total];
};

/**
 * 공통 페이지네이션 컴포넌트
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setCurrentPage}
 *   showInfo
 * />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showText = true,
  showFirstLast = true,
  size = 'md',
}) => {
  // 페이지 범위 생성
  const pageRange = generatePageRange(currentPage, totalPages, siblingCount);

  // 이전/다음 페이지 가능 여부
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // 페이지 변경 핸들러
  const handlePageChange = (page: number, force: boolean = false) => {
    if (page < 1 || page > totalPages) return;
    if (page === currentPage && !force) return;
    onPageChange(page);
  };

  if (totalPages <= 1) return null;

  // Size-based classes
  const sizeClasses = {
    sm: 'min-w-[1.75rem] h-7 px-2 text-xs',
    md: 'min-w-[2rem] h-8 px-3 text-sm',
    lg: 'min-w-[2.5rem] h-10 px-4 text-base',
  };

  // Base button classes matching design system
  const baseButtonClasses = `
    inline-flex items-center justify-center gap-1
    ${sizeClasses[size]}
    font-medium rounded-lg
    transition-colors
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
  `.trim();

  // Active button (matches filter button active state)
  const activeButtonClasses = `${baseButtonClasses} bg-accent text-white cursor-default`;

  // Inactive button (matches filter button inactive state)
  const inactiveButtonClasses = `${baseButtonClasses} text-muted-foreground hover:text-foreground hover:bg-card border border-border`;

  // Disabled button
  const disabledButtonClasses = `${baseButtonClasses} text-muted-foreground/40 bg-card/50 border border-border/50 cursor-not-allowed opacity-50`;

  return (
    <nav className="flex flex-col items-center gap-4" role="navigation" aria-label="페이지네이션">
      {/* 페이지 버튼 그룹 */}
      <ul className="flex items-center gap-1 list-none m-0 p-0">
        {/* 처음으로 버튼 */}
        {showFirstLast && (
          <li className="hidden sm:block">
            <button
              className={!canGoPrevious ? disabledButtonClasses : inactiveButtonClasses}
              onClick={() => canGoPrevious ? handlePageChange(1, true) : onPageChange(1)}
              aria-label="처음 페이지"
              title="처음 페이지"
              aria-disabled={!canGoPrevious}
            >
              <span aria-hidden="true">««</span>
            </button>
          </li>
        )}

        {/* 이전 버튼 */}
        <li>
          <button
            className={!canGoPrevious ? disabledButtonClasses : inactiveButtonClasses}
            onClick={() => canGoPrevious ? handlePageChange(currentPage - 1, true) : onPageChange(currentPage)}
            aria-label="이전 페이지"
            title="이전 페이지"
            aria-disabled={!canGoPrevious}
          >
            <span aria-hidden="true">‹</span>
            {showText && <span className="hidden sm:inline">이전</span>}
          </button>
        </li>

        {/* 페이지 번호 버튼들 */}
        {pageRange.map((page, index) => {
          if (page === '...') {
            return (
              <li key={`ellipsis-${index}`}>
                <span
                  className={`inline-flex items-center justify-center ${sizeClasses[size]} text-muted-foreground/60`}
                  aria-hidden="true"
                >
                  ...
                </span>
              </li>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <li key={pageNumber}>
              <button
                className={isActive ? activeButtonClasses : inactiveButtonClasses}
                onClick={() => handlePageChange(pageNumber)}
                disabled={isActive}
                aria-label={`페이지 ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        {/* 다음 버튼 */}
        <li>
          <button
            className={!canGoNext ? disabledButtonClasses : inactiveButtonClasses}
            onClick={() => canGoNext ? handlePageChange(currentPage + 1, true) : onPageChange(currentPage)}
            aria-label="다음 페이지"
            title="다음 페이지"
            aria-disabled={!canGoNext}
          >
            {showText && <span className="hidden sm:inline">다음</span>}
            <span aria-hidden="true">›</span>
          </button>
        </li>

        {/* 마지막으로 버튼 */}
        {showFirstLast && (
          <li className="hidden sm:block">
            <button
              className={!canGoNext ? disabledButtonClasses : inactiveButtonClasses}
              onClick={() => canGoNext ? handlePageChange(totalPages, true) : onPageChange(totalPages)}
              aria-label="마지막 페이지"
              title="마지막 페이지"
              aria-disabled={!canGoNext}
            >
              <span aria-hidden="true">»»</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
