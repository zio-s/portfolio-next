'use client';

/** Redux Store + Theme Context Provider (App Router 클라이언트 wrapper) */

import { ReactNode, useEffect } from 'react';
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

/*
 * 예전엔 여기서 전체 트리를 <Suspense>로 감쌌다 — useSearchParams()를 쓰는
 * 자손 컴포넌트가 정적 생성 시 Suspense 경계를 요구했기 때문. 지금은 그런
 * 컴포넌트가 /blog 전용 3곳(BlogSidebar/CategoryChips/PostsPage)뿐이고,
 * /blog 자체가 이미 force-dynamic + 자체 <Suspense>를 갖고 있어 여기서
 * 감쌀 필요가 없다.
 *
 * 오히려 전역으로 감싸두면 부작용이 있었다: notFound()가 이 Suspense
 * 경계 안쪽 깊은 곳(예: blog/[id])에서 호출되면, 최초 스트리밍 응답이
 * 이 fallback과 함께 HTTP 200으로 먼저 커밋된 뒤라 이후 notFound()가
 * 실행돼도 상태 코드를 404로 되돌릴 수 없었다 (soft 404 → 구글
 * Search Console에서 "Soft 404"/"NOINDEX 태그로 제외"로 잡힘).
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthInitializer>
          {children}
        </AuthInitializer>
        <ToastContainer />
        <ModalContainer />
      </ThemeProvider>
    </Provider>
  );
}
