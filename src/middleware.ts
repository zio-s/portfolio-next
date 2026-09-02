import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { hostname } = request.nextUrl;

  // www → non-www 301 리다이렉트
  if (hostname === 'www.semincode.com') {
    const url = request.nextUrl.clone();
    url.hostname = 'semincode.com';
    return NextResponse.redirect(url, 301);
  }

  // 블로그 글 ID 형식 검증 — 존재하지 않는 글 번호(id)는 아래에서 notFound()로
  // 처리하지만, generateMetadata가 비동기라 Next.js가 응답을 200으로 먼저
  // 커밋해버려 notFound()가 실행돼도 상태 코드가 200으로 남는 soft 404가
  // 발생한다 (렌더링 파이프라인에 들어가기 전이라 미들웨어에서만 진짜 404를
  // 보낼 수 있다). /blog/:id, /blog/OtherComponent 같은 숫자가 아닌
  // 경로(예전 React Router 코드나 봇이 남긴 흔적)를 여기서 걸러낸다.
  const blogPostMatch = request.nextUrl.pathname.match(/^\/blog\/([^/]+)$/);
  if (blogPostMatch && blogPostMatch[1] !== 'create' && !/^\d+$/.test(blogPostMatch[1])) {
    return NextResponse.rewrite(new URL('/404', request.url), { status: 404 });
  }

  // Admin 인증 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { data: { user }, error } = await supabase.auth.getUser(accessToken);

      if (error || !user) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        return response;
      }
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)',
  ],
};
