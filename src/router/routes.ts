/**
 * 라우트 경로 상수 정의
 *
 * 애플리케이션의 모든 라우트 경로를 중앙에서 관리합니다.
 * 경로 변경 시 이 파일만 수정하면 전체 앱에 반영됩니다.
 */

/**
 * 공개 라우트 경로
 * 인증 없이 접근 가능한 페이지들
 */
export const PUBLIC_ROUTES = {
  /** 홈/랜딩 페이지 */
  HOME: '/',
  /** 프로젝트 목록 페이지 */
  PROJECTS: '/projects',
  /** 블로그 페이지 */
  BLOG: '/blog',
  /** 방명록 페이지 */
  GUESTBOOK: '/guestbook',
  /** 로그인 페이지 */
  LOGIN: '/login',
  /** 회원가입 페이지 */
  REGISTER: '/register',
} as const;

/**
 * 보호된 라우트 경로
 * 인증이 필요한 페이지들
 */
export const PROTECTED_ROUTES = {
  /** 대시보드 메인 */
  DASHBOARD: '/dashboard',

  /** 게시글 관련 라우트 - 생성/수정만 보호 */
  BLOG_CREATE: '/blog/create',
  BLOG_EDIT: '/blog/:id/edit',

  /** 프로필 페이지 */
  PROFILE: '/profile',
} as const;

/**
 * 모든 라우트 경로를 하나의 객체로 통합
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
} as const;

/**
 * 동적 라우트 경로 생성 헬퍼 함수들
 */
export const routeHelpers = {
  /**
   * 블로그 상세 페이지 경로 생성
   * @param id - 게시글 ID
   * @returns 블로그 상세 페이지 경로
   */
  blogDetail: (id: string): string => `/blog/${id}`,

  /**
   * 게시글 수정 페이지 경로 생성
   * @param id - 게시글 ID
   * @returns 게시글 수정 페이지 경로
   */
  blogEdit: (id: string): string => `/blog/${id}/edit`,
} as const;

/**
 * 라우트 경로 타입 정의
 */
export type PublicRoutePath = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type ProtectedRoutePath = typeof PROTECTED_ROUTES[keyof typeof PROTECTED_ROUTES];
export type RoutePath = PublicRoutePath | ProtectedRoutePath;
