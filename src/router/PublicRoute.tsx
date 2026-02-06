/**
 * 공개 라우트 컴포넌트
 *
 * 비로그인 사용자 전용 페이지를 관리합니다.
 * - 로그인한 사용자가 접근 시 대시보드로 리다이렉트
 * - 주로 로그인, 회원가입 페이지에 사용됩니다.
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { PROTECTED_ROUTES } from './routes';

/**
 * PublicRoute 컴포넌트 Props
 */
interface PublicRouteProps {
  /** 렌더링할 자식 컴포넌트 */
  children: ReactNode;
  /**
   * 로그인 후 리다이렉트할 경로
   * @default PROTECTED_ROUTES.DASHBOARD
   */
  redirectTo?: string;
}

/**
 * 공개 라우트 컴포넌트
 *
 * 로그인하지 않은 사용자만 접근할 수 있는 페이지를 보호합니다.
 * 이미 로그인한 사용자가 접근하면 지정된 경로로 리다이렉트합니다.
 *
 * @example
 * ```tsx
 * // 로그인 페이지
 * <Route path="/login" element={
 *   <PublicRoute>
 *     <LoginPage />
 *   </PublicRoute>
 * } />
 *
 * // 회원가입 페이지 (가입 후 프로필로 이동)
 * <Route path="/register" element={
 *   <PublicRoute redirectTo="/profile">
 *     <RegisterPage />
 *   </PublicRoute>
 * } />
 * ```
 *
 * @param props - PublicRouteProps
 * @returns 인증 상태에 따라 자식 컴포넌트 또는 리다이렉트
 */
export const PublicRoute = ({
  children,
  redirectTo = PROTECTED_ROUTES.DASHBOARD,
}: PublicRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  /**
   * 이미 로그인한 사용자인 경우
   * - location.state.from에 저장된 원래 경로가 있으면 그곳으로
   * - 없으면 redirectTo 또는 기본 대시보드로 리다이렉트
   */
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  /**
   * 로그인하지 않은 사용자는 자식 컴포넌트 렌더링
   */
  return <>{children}</>;
};

export default PublicRoute;
