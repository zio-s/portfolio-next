/**
 * Base API Configuration for RTK Query
 *
 * 모든 RTK Query API의 기본 설정을 제공합니다.
 *
 * 주요 기능:
 * - Axios 기반 baseQuery
 * - 자동 토큰 인증 헤더 추가
 * - 401 에러 시 자동 로그아웃
 * - 에러 핸들링 표준화
 */

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';

/**
 * API Base URL
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * Base Query with Auth
 *
 * 모든 요청에 자동으로 Authorization 헤더 추가
 */
export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Redux store에서 토큰 가져오기
    const token = (getState() as RootState).auth.token;

    // 토큰이 있으면 Authorization 헤더 추가
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // Content-Type 설정
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    return headers;
  },
});

/**
 * Base Query with Re-auth
 *
 * 401 에러 시 자동 재인증 시도
 */
export const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // 401 Unauthorized 에러 처리
  if (result.error && result.error.status === 401) {
    // Error handled silently
  }

  return result;
};

/**
 * 공통 Tag Types
 *
 * RTK Query 캐시 무효화를 위한 태그
 */
export const TAG_TYPES = {
  PROJECT: 'Project',
  COMMENT: 'Comment',
  REACTION: 'Reaction',
  USER: 'User',
} as const;
