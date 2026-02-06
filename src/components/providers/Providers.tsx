'use client';

/**
 * Providers Component
 *
 * Next.js App Router에서 사용하는 클라이언트 컴포넌트
 * Redux Store와 Theme Context를 제공합니다.
 */

import { ReactNode, Suspense, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, type AppDispatch } from '@/store';
import { getCurrentUser } from '@/store/slices/authSlice';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastContainer } from '@/components/toast';
import { ModalContainer } from '@/components/modal';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * 앱 전역 로딩 컴포넌트
 * useSearchParams 등 Suspense가 필요한 훅들의 fallback
 */
function AppLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Auth 초기화 컴포넌트
 * 앱 시작 시 Supabase 세션을 확인하여 Redux에 사용자 상태 설정
 */
function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // 앱 시작 시 현재 세션 확인
    dispatch(getCurrentUser());
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer>
          <Suspense fallback={<AppLoadingFallback />}>
            {children}
          </Suspense>
        </AuthInitializer>
        <ToastContainer />
        <ModalContainer />
      </ThemeProvider>
    </Provider>
  );
}
