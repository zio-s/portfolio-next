import { useEffect, useRef } from 'react';

/**
 * 컴포넌트가 마운트될 때 콜백을 한 번만 실행합니다.
 * 빈 의존성 배열을 가진 useEffect와 유사하지만 단일 실행을 보장합니다.
 *
 * @param callback - 마운트 시 실행할 함수
 *
 * @example
 * ```tsx
 * useOnMount(() => {
 *   console.log('컴포넌트가 마운트되었습니다');
 *   fetchInitialData();
 * });
 * ```
 */
export function useOnMount(callback: () => void | (() => void)): void {
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (!hasExecuted.current) {
      hasExecuted.current = true;
      return callback();
    }
  }, [callback]);
}
