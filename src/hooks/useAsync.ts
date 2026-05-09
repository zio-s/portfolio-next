import { useState, useEffect, useCallback } from 'react';

export interface AsyncState<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
}

/** 비동기 함수의 loading/error/data 상태 + execute/reset 헬퍼 */
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
