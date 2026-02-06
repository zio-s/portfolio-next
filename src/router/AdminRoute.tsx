/**
 * AdminRoute Component
 *
 * 관리자 전용 라우트 보호 컴포넌트
 *
 * 주요 기능:
 * - 로그인 체크
 * - Admin 권한 체크
 * - 401/403 리다이렉트
 */

import { Navigate } from 'react-router-dom';
import { useAdminCheck } from '../hooks/useAdminCheck';
// import { ROUTES } from './routes';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin, isAuthenticated } = useAdminCheck();

  // 로그인 안 됨 → Admin 로그인 페이지로
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin 아님 → 403 페이지로
  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

  // Admin 확인 → 렌더링
  return <>{children}</>;
};

export default AdminRoute;
