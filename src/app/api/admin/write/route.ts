/**
 * Admin Write API Route
 *
 * posts / projects 쓰기(INSERT·UPDATE·DELETE)를 관리자 토큰으로 대신 수행한다.
 * 브라우저의 Supabase 클라이언트는 anon 키만 갖고 있어 관리자를 구분할 수 없으므로,
 * HttpOnly 쿠키의 access_token을 실어 보내 DB의 RLS(is_admin)가 관리자를 확인하게 한다.
 *
 * access_token(1시간)이 만료돼도 편집 중이던 글이 저장되도록 refresh_token으로 한 번 갱신한다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1시간
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7일

// 이 라우트로 쓸 수 있는 테이블만 허용
const WRITABLE_TABLES = ['posts', 'projects'] as const;
type WritableTable = (typeof WRITABLE_TABLES)[number];
type WriteMethod = 'INSERT' | 'UPDATE' | 'DELETE';

interface WriteBody {
  table: WritableTable;
  method: WriteMethod;
  id?: string;
  data?: Record<string, unknown>;
}

function errorResponse(status: number, message: string, extra?: { hint?: string; details?: string }) {
  return NextResponse.json({ error: { status, data: { message, ...extra } } }, { status });
}

function isWriteBody(body: unknown): body is WriteBody {
  if (!body || typeof body !== 'object') return false;
  const { table, method, id, data } = body as Record<string, unknown>;
  if (!WRITABLE_TABLES.includes(table as WritableTable)) return false;
  if (method !== 'INSERT' && method !== 'UPDATE' && method !== 'DELETE') return false;
  if (method !== 'INSERT' && (typeof id !== 'string' || id.length === 0)) return false;
  if (method !== 'DELETE' && (!data || typeof data !== 'object' || Array.isArray(data))) return false;
  return true;
}

function createAuthedClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

/**
 * 유효한 관리자 세션 확보 — access_token이 없거나 만료됐으면 refresh_token으로 갱신
 */
async function resolveAdminSession(): Promise<
  | { supabase: SupabaseClient; refreshed: { accessToken: string; refreshToken: string } | null }
  | { error: NextResponse }
> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let token = accessToken;
  let refreshed: { accessToken: string; refreshToken: string } | null = null;
  let email: string | undefined;

  if (token) {
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) token = undefined;
    else email = data.user.email;
  }

  if (!token && refreshToken) {
    const { data, error } = await authClient.auth.refreshSession({ refresh_token: refreshToken });
    if (!error && data.session) {
      token = data.session.access_token;
      email = data.session.user.email;
      refreshed = { accessToken: data.session.access_token, refreshToken: data.session.refresh_token };
    }
  }

  if (!token || !email) {
    return { error: errorResponse(401, '로그인이 필요합니다. 다시 로그인해주세요.') };
  }

  const supabase = createAuthedClient(token);

  // 로그인 라우트와 같은 기준(admin_users 이메일)으로 관리자 확인 — DB RLS와 이중 확인
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!adminUser) {
    return { error: errorResponse(403, '관리자 권한이 없습니다.') };
  }

  return { supabase, refreshed };
}

function withRefreshedCookies(response: NextResponse, refreshed: { accessToken: string; refreshToken: string } | null) {
  if (!refreshed) return response;
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
  response.cookies.set('access_token', refreshed.accessToken, { ...base, maxAge: ACCESS_TOKEN_MAX_AGE });
  response.cookies.set('refresh_token', refreshed.refreshToken, { ...base, maxAge: REFRESH_TOKEN_MAX_AGE });
  return response;
}

/**
 * POST - { table, method, id?, data? }
 * 응답 형태는 supabaseBaseQuery와 동일: 성공 { data }, 실패 { error: { status, data: { message } } }
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!isWriteBody(body)) {
      return errorResponse(400, '잘못된 요청입니다.');
    }

    const session = await resolveAdminSession();
    if ('error' in session) return session.error;
    const { supabase, refreshed } = session;
    const { table, method, id, data } = body;

    if (method === 'INSERT') {
      const { data: result, error } = await supabase.from(table).insert(data!).select().single();
      if (error) return withRefreshedCookies(errorResponse(400, error.message, { hint: error.hint, details: error.details }), refreshed);
      return withRefreshedCookies(NextResponse.json({ data: result }), refreshed);
    }

    if (method === 'UPDATE') {
      const { data: result, error } = await supabase.from(table).update(data!).eq('id', id!).select().single();
      if (error) return withRefreshedCookies(errorResponse(400, error.message, { hint: error.hint, details: error.details }), refreshed);
      return withRefreshedCookies(NextResponse.json({ data: result }), refreshed);
    }

    const { error } = await supabase.from(table).delete().eq('id', id!);
    if (error) return withRefreshedCookies(errorResponse(400, error.message, { hint: error.hint, details: error.details }), refreshed);
    return withRefreshedCookies(NextResponse.json({ data: null }), refreshed);
  } catch (error) {
    console.error('Admin write error:', error);
    return errorResponse(500, '서버 오류가 발생했습니다.');
  }
}
