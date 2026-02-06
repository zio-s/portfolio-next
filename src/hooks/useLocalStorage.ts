import { useState, useEffect, useCallback } from 'react';

/**
 * localStorage와 동기화되는 상태를 관리합니다.
 * 타입 안전성을 제공하며 자동으로 JSON 직렬화/역직렬화를 처리합니다.
 *
 * @template T - 저장할 값의 타입
 * @param key - localStorage 키
 * @param initialValue - 초기값 (localStorage에 값이 없을 때 사용)
 * @returns 현재 값과 값을 업데이트하는 함수, 값을 제거하는 함수를 포함하는 튜플
 *
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
 *
 * return (
 *   <div>
 *     <p>현재 테마: {theme}</p>
 *     <button onClick={() => setTheme('dark')}>다크 모드</button>
 *     <button onClick={removeTheme}>초기화</button>
 *   </div>
 * );
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // 초기 상태를 localStorage에서 가져오거나 initialValue 사용
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // localStorage에 값을 저장하는 함수
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // 함수형 업데이트 지원
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // Error handled silently
      }
    },
    [key, storedValue]
  );

  // localStorage에서 값을 제거하는 함수
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Error handled silently
    }
  }, [key, initialValue]);

  // 다른 탭/윈도우에서의 변경사항 동기화
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          // Error handled silently
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}
