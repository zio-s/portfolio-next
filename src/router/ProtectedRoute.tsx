/**
 * 보호된 라우트 컴포넌트
 *
 * 인증이 필요한 페이지를 보호합니다.
 * - 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 * - 인증 확인 중에는 로딩 스피너 표시
 * - 인증된 사용자만 자식 컴포넌트 렌더링
 */

import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCurrentUser, selectIsAuthenticated, selectAuthLoading } from '../store/slices/authSlice';
import { PUBLIC_ROUTES } from './routes';

/**
 * ProtectedRoute 컴포넌트 Props
 */
interface ProtectedRouteProps {
  /** 보호할 자식 컴포넌트 */
  children: ReactNode;
}

/**
 * 로딩 스피너 컴포넌트
 * 인증 확인 중에 표시됩니다.
 */
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '1.2rem',
    color: '#666',
  }}>
    <div>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem',
      }} />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      인증 확인 중...
    </div>
  </div>
);

/**
 * 보호된 라우트 컴포넌트
 *
 * @param props - ProtectedRouteProps
 * @returns 인증 상태에 따라 자식 컴포넌트 또는 리다이렉트
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);

  /**
   * 컴포넌트 마운트 시 사용자 인증 확인
   * Supabase Auth가 세션을 자동으로 관리하므로 별도 체크 불필요
   * App.tsx에서 이미 getCurrentUser()를 호출하여 세션 복구 완료
   */
  useEffect(() => {
    // Supabase Auth: 세션은 자동으로 관리됨
    // App.tsx에서 이미 초기 세션 확인을 했으므로 여기서는 추가 작업 불필요
    if (!isAuthenticated && !loading) {
      // 인증 상태가 명확하지 않으면 다시 확인
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, loading]);

  /**
   * 인증 확인 중에는 로딩 스피너 표시
   */
  if (loading) {
    return <LoadingSpinner />;
  }

  /**
   * 인증되지 않은 경우 로그인 페이지로 리다이렉트
   * state에 현재 경로를 저장하여 로그인 후 원래 페이지로 돌아갈 수 있도록 함
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to={PUBLIC_ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  /**
   * 인증된 경우 자식 컴포넌트 렌더링
   * 각 페이지가 필요한 레이아웃을 직접 선택하도록 함
   */
  return <>{children}</>;
};

export default ProtectedRoute;
