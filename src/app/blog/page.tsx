import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/common/SEO';
import { Suspense } from 'react';
import PostsPage from '@/views/PostsPage';

export const metadata: Metadata = generateSEOMetadata({
  title: '블로그 | 변세민 | 프론트엔드 개발자',
  description: '프론트엔드 개발, React, TypeScript 등 웹 개발 관련 글을 공유합니다.',
  url: 'https://semincode.com/blog',
});

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
