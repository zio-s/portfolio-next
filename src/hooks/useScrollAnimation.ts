import { useEffect, useRef, useCallback } from 'react';

/**
 * 스크롤 애니메이션을 위한 IntersectionObserver 훅
 * 요소가 뷰포트에 진입할 때 자동으로 애니메이션을 트리거합니다.
 *
 * @param options - IntersectionObserver 옵션
 * @returns 애니메이션을 적용할 요소에 연결할 ref 등록 함수
 *
 * @example
 * ```tsx
 * function AnimatedList() {
 *   const registerRef = useScrollAnimation();
 *
 *   return (
 *     <div>
 *       {items.map((item, index) => (
 *         <div
 *           key={item.id}
 *           ref={registerRef}
 *           data-animate="true"
 *           style={{ transitionDelay: `${index * 0.05}s` }}
 *         >
 *           {item.content}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollAnimation(options?: IntersectionObserverInit) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  // IntersectionObserver 초기화
  useEffect(() => {
    // 브라우저 환경이 아니면 early return
    if (typeof window === 'undefined') {
      return;
    }

    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 요소가 뷰포트에 진입하면 data-visible 속성 추가
          entry.target.setAttribute('data-visible', 'true');

          // 한 번 애니메이션이 실행되면 더 이상 관찰하지 않음 (성능 최적화)
          if (observerRef.current) {
            observerRef.current.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);

    // 기존에 등록된 요소들을 관찰 시작
    elementsRef.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    // 클린업
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  // 요소를 등록하는 ref 콜백 함수
  const registerRef = useCallback((element: Element | null) => {
    if (!element) return;

    // Set에 요소 추가
    elementsRef.current.add(element);

    // Observer가 준비되어 있으면 즉시 관찰 시작
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  return registerRef;
}
