/**
 * Session API Route
 *
 * HttpOnly 쿠키에서 세션 확인
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 토큰으로 사용자 정보 가져오기
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      // Access Token 만료 시 Refresh Token으로 갱신 시도
      if (refreshToken) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (!refreshError && refreshData.session) {
          // 새 토큰으로 쿠키 업데이트
          const response = NextResponse.json({
            user: {
              id: refreshData.user?.id,
              email: refreshData.user?.email,
              name: refreshData.user?.user_metadata?.name || refreshData.user?.email?.split('@')[0],
            },
          });

          response.cookies.set('access_token', refreshData.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60, // 1시간
          });

          response.cookies.set('refresh_token', refreshData.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7일
          });

          return response;
        }
      }

      // 갱신 실패 시 쿠키 삭제
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }

    // Admin 정보 가져오기
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('name, role')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: adminUser?.name || user.user_metadata?.name || user.email?.split('@')[0],
        role: adminUser?.role || 'user',
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
