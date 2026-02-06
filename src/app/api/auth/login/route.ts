/**
 * Login API Route
 *
 * Supabase 인증 후 HttpOnly 쿠키에 토큰 저장
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 쿠키 옵션
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// Access Token 만료: 1시간
const ACCESS_TOKEN_MAX_AGE = 60 * 60;
// Refresh Token 만료: 7일
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성 (서버 사이드)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Supabase 로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || '로그인에 실패했습니다.' },
        { status: 401 }
      );
    }

    // Admin 권한 확인 (admin_users 테이블)
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', data.user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      // 로그아웃 처리
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 쿠키 저장소 가져오기
    const cookieStore = await cookies();

    // Access Token을 HttpOnly 쿠키에 저장
    cookieStore.set('access_token', data.session.access_token, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    // Refresh Token을 HttpOnly 쿠키에 저장
    cookieStore.set('refresh_token', data.session.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    // 사용자 정보 반환 (토큰 제외)
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: adminUser.name || data.user.email?.split('@')[0],
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
