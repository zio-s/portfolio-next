import { useEffect, useState } from 'react';

/**
 * 지정된 지연 시간 이후에 값 업데이트를 디바운싱합니다.
 * 검색 입력 등 비용이 많이 드는 작업을 최적화하는 데 유용합니다.
 *
 * @template T - 디바운싱할 값의 타입
 * @param value - 디바운싱할 값
 * @param delay - 지연 시간(밀리초, 기본값: 500ms)
 * @returns 디바운싱된 값
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     // API 호출은 사용자가 300ms 동안 타이핑을 멈춘 후에만 실행됩니다
 *     fetchSearchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 지연 후 디바운싱된 값을 업데이트하는 타이머 설정
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 지연 시간이 만료되기 전에 값이 변경되면 타이머를 정리하는 클린업 함수
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
