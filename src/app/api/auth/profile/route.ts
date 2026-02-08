/**
 * Profile API Route
 *
 * 프로필 업데이트 (HttpOnly 쿠키 기반)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { name, avatar } = await request.json();

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 토큰으로 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: '유효하지 않은 세션입니다.' },
        { status: 401 }
      );
    }

    // admin_users 테이블 업데이트
    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('email', user.email);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return NextResponse.json(
          { error: '프로필 업데이트에 실패했습니다.' },
          { status: 500 }
        );
      }
    }

    // 업데이트된 사용자 정보 가져오기 (email로 매칭)
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('name')
      .eq('email', user.email)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: adminUser?.name || name || user.email?.split('@')[0],
        role: adminUser ? 'admin' : 'user',
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
