import React, { useState, useMemo } from 'react';
import './Table.css';

/**
 * 테이블 컬럼 정의
 */
export interface TableColumn<T = Record<string, unknown>> {
  /** 컬럼 키 (데이터 속성명) */
  key: string;
  /** 컬럼 헤더 텍스트 */
  header: string;
  /** 정렬 가능 여부 */
  sortable?: boolean;
  /** 컬럼 너비 */
  width?: string | number;
  /** 셀 정렬 */
  align?: 'left' | 'center' | 'right';
  /** 커스텀 렌더링 함수 */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

/**
 * 테이블 컴포넌트의 Props 인터페이스
 */
export interface TableProps<T = Record<string, unknown>> {
  /** 테이블 데이터 */
  data: T[];
  /** 컬럼 정의 */
  columns: TableColumn<T>[];
  /** 로딩 상태 */
  loading?: boolean;
  /** 빈 상태 메시지 */
  emptyText?: string;
  /** 행 클릭 이벤트 */
  onRowClick?: (row: T, index: number) => void;
  /** 행 키 추출 함수 */
  rowKey?: (row: T, index: number) => string | number;
  /** 스트라이프 스타일 */
  striped?: boolean;
  /** 호버 효과 */
  hoverable?: boolean;
  /** 테두리 표시 */
  bordered?: boolean;
  /** 컴팩트 모드 */
  compact?: boolean;
}

type SortOrder = 'asc' | 'desc' | null;

/**
 * 공통 테이블 컴포넌트
 *
 * @example
 * ```tsx
 * const columns = [
 *   { key: 'name', header: '이름', sortable: true },
 *   { key: 'email', header: '이메일', sortable: true },
 *   { key: 'status', header: '상태', render: (value) => <Badge>{value}</Badge> }
 * ];
 *
 * <Table
 *   data={users}
 *   columns={columns}
 *   hoverable
 *   striped
 * />
 * ```
 */
export function Table<T = Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyText = '데이터가 없습니다',
  onRowClick,
  rowKey = (_, index) => index,
  striped = false,
  hoverable = true,
  bordered = false,
  compact = false,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // 정렬 처리
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortKey === columnKey) {
      // 같은 컬럼 클릭: asc → desc → null 순환
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortKey(null);
        setSortOrder(null);
      }
    } else {
      // 다른 컬럼 클릭: asc로 시작
      setSortKey(columnKey);
      setSortOrder('asc');
    }
  };

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    if (!sortKey || !sortOrder) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortKey];
      const bValue = (b as Record<string, unknown>)[sortKey];

      if (aValue === bValue) return 0;

      // Safe comparison for unknown types
      const comparison = String(aValue) > String(bValue) ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortOrder]);

  // 테이블 클래스
  const tableClasses = [
    'table',
    striped && 'table--striped',
    hoverable && 'table--hoverable',
    bordered && 'table--bordered',
    compact && 'table--compact',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="table-wrapper">
      <div className="table-container">
        <table className={tableClasses} role="table">
          {/* 테이블 헤더 */}
          <thead className="table-head">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`table-cell table-cell--header ${
                    column.align ? `table-cell--${column.align}` : ''
                  } ${column.sortable ? 'table-cell--sortable' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                  role="columnheader"
                  aria-sort={
                    sortKey === column.key
                      ? sortOrder === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <div className="table-cell__content">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="table-sort-icon" aria-hidden="true">
                        {sortKey === column.key ? (
                          sortOrder === 'asc' ? (
                            <span>▲</span>
                          ) : (
                            <span>▼</span>
                          )
                        ) : (
                          <span className="table-sort-icon--inactive">⇅</span>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* 테이블 본문 */}
          <tbody className="table-body">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="table-cell table-cell--loading">
                  <div className="table-loading">로딩 중...</div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-cell table-cell--empty">
                  <div className="table-empty">{emptyText}</div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowKey(row, rowIndex)}
                  className={`table-row ${onRowClick ? 'table-row--clickable' : ''}`}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  role="row"
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`table-cell ${
                        column.align ? `table-cell--${column.align}` : ''
                      }`}
                      role="cell"
                    >
                      {column.render
                        ? column.render((row as Record<string, unknown>)[column.key], row, rowIndex)
                        : String((row as Record<string, unknown>)[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
