/**
 * Router Compatibility Hooks
 *
 * Next.js App Router와 React Router DOM 간 호환성을 위한 훅
 */

import { useRouter as useNextRouter, useParams as useNextParams, useSearchParams as useNextSearchParams, usePathname } from 'next/navigation';

/**
 * useNavigate 호환 훅
 * react-router-dom의 useNavigate와 동일한 인터페이스 제공
 */
export function useNavigate() {
  const router = useNextRouter();

  const navigate = (path: string | number, options?: { replace?: boolean }) => {
    if (typeof path === 'number') {
      // 숫자인 경우 history.go() 동작
      if (path === -1) {
        router.back();
      } else if (path === 1) {
        router.forward();
      }
    } else {
      if (options?.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    }
  };

  return navigate;
}

/**
 * useParams 호환 훅
 * react-router-dom의 useParams와 동일한 인터페이스 제공
 */
export function useParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  const params = useNextParams();
  return params as T;
}

/**
 * useSearchParams 호환 훅 (get 메서드 포함)
 */
export function useSearchParams(): URLSearchParams {
  const searchParams = useNextSearchParams();
  return searchParams || new URLSearchParams();
}

/**
 * useLocation 호환 훅
 */
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
  };
}

/**
 * Link 컴포넌트 (react-router-dom Link 대체)
 * 이 파일에서는 훅만 제공하고, Link는 next/link 직접 사용 권장
 */
export { default as Link } from 'next/link';
