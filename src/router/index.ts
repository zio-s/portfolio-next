/**
 * 라우터 모듈 진입점
 *
 * Next.js App Router가 실제 라우팅을 담당하므로, 여기서는 경로 상수/헬퍼만 export합니다.
 */

// 라우트 경로 상수 및 헬퍼
export { ROUTES, PUBLIC_ROUTES, PROTECTED_ROUTES, routeHelpers } from './routes';

// 타입 정의
export type { PublicRoutePath, ProtectedRoutePath, RoutePath } from './routes';
