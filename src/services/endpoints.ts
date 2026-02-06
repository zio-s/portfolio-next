/**
 * API 엔드포인트 상수 정의
 *
 * 모든 API 엔드포인트를 중앙 집중식으로 관리합니다.
 * 환경변수를 통해 Base URL을 설정할 수 있습니다.
 */

// 환경변수에서 API Base URL 가져오기 (기본값: /api - MSW와 호환)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * 인증 관련 엔드포인트
 */
export const AUTH_ENDPOINTS = {
  /** 로그인 */
  LOGIN: '/auth/login',
  /** 회원가입 */
  REGISTER: '/auth/register',
  /** 로그아웃 */
  LOGOUT: '/auth/logout',
  /** 현재 사용자 정보 조회 */
  ME: '/auth/me',
  /** 토큰 갱신 */
  REFRESH: '/auth/refresh',
  /** 비밀번호 재설정 요청 */
  FORGOT_PASSWORD: '/auth/forgot-password',
  /** 비밀번호 재설정 */
  RESET_PASSWORD: '/auth/reset-password',
} as const;

/**
 * 사용자 관련 엔드포인트
 */
export const USER_ENDPOINTS = {
  /** 사용자 목록 조회 */
  LIST: '/users',
  /** 사용자 상세 조회 */
  DETAIL: (id: string | number) => `/users/${id}`,
  /** 사용자 생성 */
  CREATE: '/users',
  /** 사용자 수정 */
  UPDATE: (id: string | number) => `/users/${id}`,
  /** 사용자 삭제 */
  DELETE: (id: string | number) => `/users/${id}`,
  /** 프로필 수정 */
  UPDATE_PROFILE: '/users/profile',
  /** 비밀번호 변경 */
  CHANGE_PASSWORD: '/users/change-password',
} as const;

/**
 * 게시글 관련 엔드포인트
 */
export const POST_ENDPOINTS = {
  /** 게시글 목록 조회 */
  LIST: '/posts',
  /** 게시글 상세 조회 */
  DETAIL: (id: string | number) => `/posts/${id}`,
  /** 게시글 생성 */
  CREATE: '/posts',
  /** 게시글 수정 */
  UPDATE: (id: string | number) => `/posts/${id}`,
  /** 게시글 삭제 */
  DELETE: (id: string | number) => `/posts/${id}`,
  /** 게시글 발행 */
  PUBLISH: (id: string | number) => `/posts/${id}/publish`,
  /** 게시글 비공개 */
  UNPUBLISH: (id: string | number) => `/posts/${id}/unpublish`,
  /** 게시글 검색 */
  SEARCH: '/posts/search',
  /** 카테고리별 게시글 조회 */
  BY_CATEGORY: (category: string) => `/posts/category/${category}`,
  /** 태그별 게시글 조회 */
  BY_TAG: (tag: string) => `/posts/tag/${tag}`,
} as const;

/**
 * 파일 업로드 관련 엔드포인트
 */
export const UPLOAD_ENDPOINTS = {
  /** 이미지 업로드 */
  IMAGE: '/upload/image',
  /** 문서 업로드 */
  DOCUMENT: '/upload/document',
  /** 파일 업로드 (일반) */
  FILE: '/upload/file',
  /** 여러 파일 업로드 */
  MULTIPLE: '/upload/multiple',
} as const;

/**
 * 카테고리 관련 엔드포인트
 */
export const CATEGORY_ENDPOINTS = {
  /** 카테고리 목록 조회 */
  LIST: '/categories',
  /** 카테고리 상세 조회 */
  DETAIL: (id: string | number) => `/categories/${id}`,
  /** 카테고리 생성 */
  CREATE: '/categories',
  /** 카테고리 수정 */
  UPDATE: (id: string | number) => `/categories/${id}`,
  /** 카테고리 삭제 */
  DELETE: (id: string | number) => `/categories/${id}`,
} as const;

/**
 * 태그 관련 엔드포인트
 */
export const TAG_ENDPOINTS = {
  /** 태그 목록 조회 */
  LIST: '/tags',
  /** 태그 상세 조회 */
  DETAIL: (id: string | number) => `/tags/${id}`,
  /** 태그 생성 */
  CREATE: '/tags',
  /** 태그 수정 */
  UPDATE: (id: string | number) => `/tags/${id}`,
  /** 태그 삭제 */
  DELETE: (id: string | number) => `/tags/${id}`,
} as const;

/**
 * 댓글 관련 엔드포인트
 */
export const COMMENT_ENDPOINTS = {
  /** 댓글 목록 조회 (게시글별) */
  LIST: (postId: string | number) => `/posts/${postId}/comments`,
  /** 댓글 상세 조회 */
  DETAIL: (id: string | number) => `/comments/${id}`,
  /** 댓글 생성 */
  CREATE: (postId: string | number) => `/posts/${postId}/comments`,
  /** 댓글 수정 */
  UPDATE: (id: string | number) => `/comments/${id}`,
  /** 댓글 삭제 */
  DELETE: (id: string | number) => `/comments/${id}`,
} as const;
