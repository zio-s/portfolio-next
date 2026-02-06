/**
 * Authentication Service - HttpOnly Cookie Based
 *
 * Next.js API Routes를 통한 서버 사이드 인증
 * - Access Token & Refresh Token을 HttpOnly 쿠키에 저장
 * - XSS 공격 방어 (JavaScript에서 토큰 접근 불가)
 * - 새로고침해도 세션 유지
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authService = {
  /**
   * 로그인
   * POST /api/auth/login
   */
  async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // 쿠키 포함
      });

      const data = await response.json();

      if (!response.ok) {
        return { user: null, error: data.error || '로그인에 실패했습니다.' };
      }

      return { user: data.user, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
      return { user: null, error: errorMessage };
    }
  },

  /**
   * 로그아웃
   * POST /api/auth/logout
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: data.error || '로그아웃에 실패했습니다.' };
      }

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.';
      return { error: errorMessage };
    }
  },

  /**
   * 현재 세션 가져오기
   * GET /api/auth/session
   */
  async getSession(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.user) {
        return { user: null, error: data.error || null };
      }

      return { user: data.user, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '세션 확인 중 오류가 발생했습니다.';
      return { user: null, error: errorMessage };
    }
  },

  /**
   * 토큰 갱신
   * POST /api/auth/refresh
   */
  async refreshToken(): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || '토큰 갱신에 실패했습니다.' };
      }

      return { success: true, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '토큰 갱신 중 오류가 발생했습니다.';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * JWT 토큰 가져오기
   * HttpOnly 쿠키 사용으로 클라이언트에서 직접 접근 불가
   * API 호출은 자동으로 쿠키가 포함됨
   */
  async getToken(): Promise<string | null> {
    // HttpOnly 쿠키는 JavaScript에서 접근 불가
    // 서버 사이드에서만 접근 가능
    console.warn('getToken은 HttpOnly 쿠키 기반에서 사용할 수 없습니다. API 호출 시 자동으로 쿠키가 포함됩니다.');
    return null;
  },

  /**
   * 프로필 업데이트
   * TODO: /api/auth/profile API 추가 필요
   */
  async updateProfile(updates: { name?: string; avatar?: string }): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return { user: null, error: data.error || '프로필 업데이트에 실패했습니다.' };
      }

      return { user: data.user, error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '프로필 업데이트 중 오류가 발생했습니다.';
      return { user: null, error: errorMessage };
    }
  },
};
