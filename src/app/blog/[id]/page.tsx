import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { generateSEOMetadata } from '@/components/common/SEO';
import PostDetailPage from '@/views/PostDetailPage';
import { extractThumbnail } from '@/lib/blog';
import type { Post } from '@/store/types';

/**
 * 서버 사이드 게시글 조회 (React.cache로 generateMetadata + 페이지 간 중복 호출 방지)
 */
const getPostByNumber = cache(async (postNumber: number): Promise<Post | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data, error } = await supabase.rpc('get_post_by_number_with_user_data', {
    p_post_number: postNumber,
    p_user_identifier: '',
  });

  if (error || !data) return null;

  const post = data as Record<string, unknown>;
  return {
    ...post,
    createdAt: (post.created_at as string) || (post.createdAt as string),
    updatedAt: (post.updated_at as string) || (post.updatedAt as string),
    publishedAt: (post.published_at as string) || (post.publishedAt as string),
  } as Post;
});

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 서버 사이드 메타데이터 생성 - 구글봇이 <head>에서 title/description/OG 읽음
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const postNumber = Number(id);
  if (isNaN(postNumber)) return {};

  const post = await getPostByNumber(postNumber);
  if (!post) return {};

  // 본문 첫 이미지를 OG 이미지로 사용 (DESIGN_RESPONSE.md §4.1)
  const ogImage = extractThumbnail(post.content);

  return generateSEOMetadata({
    title: `${post.title} | Blog`,
    description: post.excerpt || post.content?.slice(0, 160),
    url: `https://semincode.com/blog/${post.post_number ?? postNumber}`,
    type: 'article',
    image: ogImage,
    publishedTime: post.publishedAt || post.createdAt,
    modifiedTime: post.updatedAt,
    keywords: post.tags?.join(', '),
  });
}

/**
 * 블로그 상세 페이지 (서버 컴포넌트)
 * - 서버에서 데이터 fetch → HTML에 콘텐츠 포함 (크롤링 가능)
 * - JSON-LD 구조화 데이터 서버 렌더링
 * - 클라이언트 인터랙션은 PostDetailPage에서 처리
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const postNumber = Number(id);

  if (isNaN(postNumber)) {
    notFound();
  }

  const post = await getPostByNumber(postNumber);

  if (!post) {
    notFound();
  }

  const postUrl = `https://semincode.com/blog/${post.post_number ?? postNumber}`;
  const description = post.excerpt || post.content?.slice(0, 160) || '';

  // JSON-LD 구조화 데이터 (plain <script> → 서버 HTML에 직접 포함, 크롤러가 바로 읽음)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    url: postUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    image: { '@type': 'ImageObject', url: 'https://semincode.com/android-chrome-512x512.png', width: 512, height: 512 },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: { '@type': 'Person', name: '변세민', url: 'https://semincode.com' },
    publisher: {
      '@type': 'Organization',
      name: 'SeminCode',
      logo: { '@type': 'ImageObject', url: 'https://semincode.com/android-chrome-512x512.png', width: 512, height: 512 },
    },
    inLanguage: 'ko-KR',
    keywords: post.tags?.join(', ') || '',
    articleBody: post.content?.slice(0, 500) || '',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: 'https://semincode.com/' },
      { '@type': 'ListItem', position: 2, name: '블로그', item: 'https://semincode.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PostDetailPage initialPost={post} />
    </>
  );
}
