import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/common/SEO';
import { fetchProjectsList, fetchPublishedPosts } from '@/lib/server-data';
import HomePage from '@/views/HomePage';

export const metadata: Metadata = generateSEOMetadata();

// 목록 데이터를 서버에서 미리 담아 정적 생성하되, 1시간마다 재생성(ISR)
export const revalidate = 3600;

export default async function Home() {
  // 크롤러가 대표 작업/다른 작업/최근 글의 실제 내용을 읽도록 서버에서 fetch.
  // 실패 시 undefined → 기존처럼 클라이언트 RTK Query가 채운다.
  const [initialProjects, initialPosts] = await Promise.all([
    fetchProjectsList({ featured: true }),
    fetchPublishedPosts(),
  ]);

  return <HomePage initialProjects={initialProjects} initialPosts={initialPosts} />;
}
