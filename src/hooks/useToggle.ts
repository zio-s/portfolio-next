import { useCallback, useState } from 'react';

/**
 * 토글, 설정 및 재설정 기능이 있는 Boolean 상태를 관리합니다.
 *
 * @param initialValue - 초기 Boolean 값 (기본값: false)
 * @returns Boolean 값과 제어 함수들을 포함하는 튜플
 *
 * @example
 * ```tsx
 * const [isOpen, { toggle, setTrue, setFalse, setValue }] = useToggle();
 *
 * return (
 *   <div>
 *     <button onClick={toggle}>토글</button>
 *     <button onClick={setTrue}>열기</button>
 *     <button onClick={setFalse}>닫기</button>
 *     {isOpen && <Modal />}
 *   </div>
 * );
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [
  boolean,
  {
    toggle: () => void;
    setTrue: () => void;
    setFalse: () => void;
    setValue: (value: boolean) => void;
  }
] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const setValueCallback = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [
    value,
    {
      toggle,
      setTrue,
      setFalse,
      setValue: setValueCallback,
    },
  ];
}
