import { useState, useEffect, useCallback } from 'react';

/**
 * 비동기 작업의 상태를 관리합니다.
 * 로딩, 에러, 데이터 상태를 자동으로 추적합니다.
 */
export interface AsyncState<T> {
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 객체 (에러가 없으면 null) */
  error: Error | null;
  /** 비동기 작업의 결과 데이터 */
  data: T | null;
}

/**
 * 비동기 함수를 실행하고 그 상태(로딩, 에러, 데이터)를 관리합니다.
 *
 * @template T - 비동기 함수가 반환하는 데이터의 타입
 * @param asyncFunction - 실행할 비동기 함수
 * @param immediate - 컴포넌트 마운트 시 즉시 실행 여부 (기본값: true)
 * @returns 상태 객체와 실행 함수를 포함하는 객체
 *
 * @example
 * ```tsx
 * const fetchUser = async (id: string) => {
 *   const response = await fetch(`/api/users/${id}`);
 *   return response.json();
 * };
 *
 * function UserProfile({ userId }: { userId: string }) {
 *   const { isLoading, error, data, execute } = useAsync(
 *     () => fetchUser(userId),
 *     true
 *   );
 *
 *   if (isLoading) return <div>로딩 중...</div>;
 *   if (error) return <div>에러: {error.message}</div>;
 *   if (!data) return null;
 *
 *   return (
 *     <div>
 *       <h1>{data.name}</h1>
 *       <button onClick={execute}>새로고침</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): AsyncState<T> & { execute: () => Promise<void>; reset: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    isLoading: immediate,
    error: null,
    data: null,
  });

  // 비동기 함수를 실행하는 함수
  const execute = useCallback(async () => {
    setState({ isLoading: true, error: null, data: null });

    try {
      const response = await asyncFunction();
      setState({ isLoading: false, error: null, data: response });
    } catch (error) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다'),
        data: null,
      });
    }
  }, [asyncFunction]);

  // 상태를 초기화하는 함수
  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null });
  }, []);

  // immediate가 true면 마운트 시 자동 실행
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute, reset };
}
