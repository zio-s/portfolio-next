/**
 * Supabase Client Configuration
 *
 * HttpOnly 쿠키 기반 인증 (Next.js API Routes 사용)
 *
 * 보안:
 * - Access Token & Refresh Token이 HttpOnly 쿠키에 저장됨
 * - JavaScript에서 토큰 접근 불가 (XSS 공격 방어)
 * - 새로고침해도 세션 유지
 *
 * 아키텍처:
 * - 인증 요청: 클라이언트 → API Routes → Supabase Auth
 * - 데이터 요청: 클라이언트 → Supabase (공개 데이터만)
 * - 인증이 필요한 데이터: 클라이언트 → API Routes → Supabase
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수를 설정하세요.');
}

/**
 * Supabase 클라이언트 (공개 데이터용)
 *
 * 인증이 필요한 작업은 API Routes를 통해 수행합니다.
 * 이 클라이언트는 공개 데이터 조회용으로만 사용하세요.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 클라이언트에서 세션 관리 안 함
    autoRefreshToken: false, // API Routes에서 토큰 갱신 처리
    detectSessionInUrl: false, // OAuth 콜백 사용 안 함
  },
});
