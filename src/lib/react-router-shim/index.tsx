'use client';

/**
 * React Router DOM Compatibility Shim for Next.js
 *
 * 이 파일은 react-router-dom 임포트를 Next.js 라우팅으로 리다이렉트합니다.
 * tsconfig.json paths에서 "react-router-dom"을 이 파일로 매핑해야 합니다.
 */

import React from 'react';
import NextLink from 'next/link';
import { useRouter, useParams as useNextParams, useSearchParams, usePathname } from 'next/navigation';

// ==================== Hooks ====================

/**
 * useNavigate - react-router-dom 호환
 */
export function useNavigate() {
  const router = useRouter();

  return (to: string | number, options?: { replace?: boolean; state?: unknown }) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.back();
      } else if (to === 1) {
        router.forward();
      }
    } else {
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  };
}

/**
 * useParams - react-router-dom 호환
 */
export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  const params = useNextParams();
  // Next.js params는 string | string[]일 수 있으므로 첫 번째 값만 반환
  const result: Record<string, string | undefined> = {};

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      result[key] = Array.isArray(value) ? value[0] : value;
    }
  }

  return result as T;
}

type SetSearchParamsInput = URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams);

/**
 * useSearchParams - react-router-dom 호환 (배열 반환)
 */
export function useSearchParamsCompat(): [URLSearchParams, (params: SetSearchParamsInput) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = (newParams: SetSearchParamsInput) => {
    let params: URLSearchParams;

    if (typeof newParams === 'function') {
      params = newParams(searchParams || new URLSearchParams());
    } else if (newParams instanceof URLSearchParams) {
      params = newParams;
    } else {
      // Handle plain object like { page: '1' }
      params = new URLSearchParams(searchParams?.toString() || '');
      for (const [key, value] of Object.entries(newParams)) {
        params.set(key, value);
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return [searchParams || new URLSearchParams(), setSearchParams];
}

// useSearchParams를 react-router-dom 스타일로 export
export { useSearchParamsCompat as useSearchParams };

/**
 * useLocation - react-router-dom 호환
 */
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    pathname: pathname || '/',
    search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: typeof window !== 'undefined' ? window.history.state : null,
    key: 'default',
  };
}

// ==================== Components ====================

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
  replace?: boolean;
  state?: unknown;
}

/**
 * Link - react-router-dom 호환 (to prop 사용)
 */
export function Link({ to, children, replace, state, ...props }: LinkProps) {
  // state는 Next.js에서 직접 지원하지 않으므로 무시
  return (
    <NextLink href={to} replace={replace} {...props}>
      {children}
    </NextLink>
  );
}

interface NavLinkProps extends Omit<LinkProps, 'className' | 'style'> {
  className?: string | ((props: { isActive: boolean; isPending: boolean }) => string);
  style?: React.CSSProperties | ((props: { isActive: boolean; isPending: boolean }) => React.CSSProperties);
  end?: boolean;
}

/**
 * NavLink - react-router-dom 호환 (활성 상태 클래스 지원)
 */
export function NavLink({ to, children, className, style, end, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname?.startsWith(to) || false;
  const isPending = false; // Next.js에서는 pending 상태 없음

  const finalClassName = typeof className === 'function'
    ? className({ isActive, isPending })
    : className;

  const finalStyle = typeof style === 'function'
    ? style({ isActive, isPending })
    : style;

  return (
    <NextLink href={to} className={finalClassName} style={finalStyle} {...props}>
      {children}
    </NextLink>
  );
}

interface NavigateProps {
  to: string;
  replace?: boolean;
  state?: unknown;
}

/**
 * Navigate - react-router-dom 호환 (선언적 리다이렉트)
 */
export function Navigate({ to, replace }: NavigateProps) {
  const router = useRouter();

  React.useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);

  return null;
}

interface OutletProps {
  context?: unknown;
}

/**
 * Outlet - Next.js에서는 children으로 대체
 * 이 컴포넌트는 호환성을 위해 존재하지만, 실제로는 사용하면 안 됨
 */
export function Outlet({ context }: OutletProps) {
  console.warn('Outlet is not supported in Next.js. Use layout.tsx and {children} instead.');
  return null;
}

// BrowserRouter는 Next.js에서 필요 없음 (App Router가 대체)
export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Routes, Route는 Next.js의 파일 기반 라우팅으로 대체
export function Routes({ children }: { children: React.ReactNode }) {
  console.warn('Routes is not supported in Next.js. Use file-based routing instead.');
  return <>{children}</>;
}

export function Route(_props: { path?: string; element?: React.ReactNode; children?: React.ReactNode }) {
  console.warn('Route is not supported in Next.js. Use file-based routing instead.');
  return null;
}

// 기타 유틸리티 함수들
export function generatePath(path: string, params?: Record<string, string | number>): string {
  if (!params) return path;

  let result = path;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, String(value));
    result = result.replace(`[${key}]`, String(value)); // Next.js 스타일도 지원
  }
  return result;
}

export function matchPath(
  pattern: string | { path: string; caseSensitive?: boolean; end?: boolean },
  pathname: string
): { params: Record<string, string>; pathname: string } | null {
  const path = typeof pattern === 'string' ? pattern : pattern.path;
  const caseSensitive = typeof pattern === 'object' && pattern.caseSensitive;
  const end = typeof pattern === 'string' || (typeof pattern === 'object' && pattern.end !== false);

  // 간단한 매칭 로직 (실제 react-router보다 단순화)
  const paramRegex = /:([^/]+)/g;
  const regexString = path.replace(paramRegex, '([^/]+)');
  const finalRegex = new RegExp(
    `^${regexString}${end ? '$' : ''}`,
    caseSensitive ? '' : 'i'
  );

  const match = pathname.match(finalRegex);
  if (!match) return null;

  const params: Record<string, string> = {};
  const paramNames = [...path.matchAll(paramRegex)].map((m) => m[1]);
  paramNames.forEach((name, i) => {
    params[name] = match[i + 1];
  });

  return { params, pathname };
}
