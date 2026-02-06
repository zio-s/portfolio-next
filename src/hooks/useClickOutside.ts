import { RefObject, useEffect } from 'react';

/**
 * 지정된 요소 외부의 클릭을 감지하고 콜백을 실행합니다.
 * 드롭다운, 모달, 팝업을 외부 클릭으로 닫을 때 유용합니다.
 *
 * @param ref - 대상 요소를 가리키는 React ref 객체
 * @param handler - 외부 클릭 시 실행할 콜백 함수
 * @param enabled - 훅 활성화 여부 (기본값: true)
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const dropdownRef = useRef<HTMLDivElement>(null);
 *
 * useClickOutside(dropdownRef, () => {
 *   setIsOpen(false);
 * });
 *
 * return (
 *   <div ref={dropdownRef}>
 *     <button onClick={() => setIsOpen(true)}>열기</button>
 *     {isOpen && <DropdownMenu />}
 *   </div>
 * );
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // ref의 요소나 자식 요소를 클릭한 경우 아무것도 하지 않음
      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      handler(event);
    };

    // 마우스와 터치 이벤트 모두에 대한 이벤트 리스너 추가
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
