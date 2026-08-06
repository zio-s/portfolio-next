import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/common/SEO';
import { Suspense } from 'react';
import PostsPage from '@/views/PostsPage';

export const metadata: Metadata = generateSEOMetadata({
  title: '블로그 | 변세민 | 프론트엔드 개발자',
  description: '프론트엔드 개발, React, TypeScript 등 웹 개발 관련 글을 공유합니다.',
  url: 'https://semincode.com/blog',
});

// PostsPage가 카테고리 필터링에 useSearchParams()를 사용하므로,
// 정적 프리렌더 시 Suspense fallback(로딩 스피너)만 빌드되어 크롤러에 노출된다.
// force-dynamic으로 매 요청마다 서버에서 실제 콘텐츠를 렌더링한다.
export const dynamic = 'force-dynamic';

function PostsPageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function Blog() {
  return (
    <Suspense fallback={<PostsPageFallback />}>
      <PostsPage />
    </Suspense>
  );
}
