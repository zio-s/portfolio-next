import { useState, useEffect } from 'react';

/**
 * CSS 미디어 쿼리의 매칭 여부를 추적합니다.
 * 반응형 디자인에서 브레이크포인트를 감지하는 데 유용합니다.
 *
 * @param query - CSS 미디어 쿼리 문자열
 * @returns 미디어 쿼리 매칭 여부
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 *   const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
 *   const isDesktop = useMediaQuery('(min-width: 1025px)');
 *   const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileLayout />}
 *       {isTablet && <TabletLayout />}
 *       {isDesktop && <DesktopLayout />}
 *       {isDarkMode && <p>다크 모드가 활성화되어 있습니다</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // SSR 대응: 서버 사이드에서는 false 반환
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // 브라우저 환경이 아니면 early return
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // 초기 상태 설정
    setMatches(mediaQuery.matches);

    // 미디어 쿼리 변경 감지 핸들러
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 이벤트 리스너 등록 (최신 브라우저)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 구형 브라우저 지원 (deprecated)
      mediaQuery.addListener(handleChange);
    }

    // 클린업
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * 일반적인 브레이크포인트를 위한 헬퍼 훅들
 */

/**
 * 모바일 화면 (최대 768px) 여부를 반환합니다.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * 태블릿 화면 (769px ~ 1024px) 여부를 반환합니다.
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

/**
 * 데스크톱 화면 (최소 1025px) 여부를 반환합니다.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

/**
 * 다크 모드 선호 여부를 반환합니다.
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * 모션 감소 선호 여부를 반환합니다 (접근성).
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
