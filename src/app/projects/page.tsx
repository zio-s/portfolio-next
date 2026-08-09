import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/common/SEO';
import { fetchProjectsList } from '@/lib/server-data';
import ProjectsPage from '@/views/ProjectsPage';

export const metadata: Metadata = generateSEOMetadata({
  title: '프로젝트 | 변세민 | 프론트엔드 개발자',
  description: 'React, TypeScript, Redux를 활용해 개발한 웹 애플리케이션 프로젝트를 소개합니다.',
  url: 'https://semincode.com/projects',
});

// 목록 데이터를 서버에서 미리 담아 정적 생성하되, 1시간마다 재생성(ISR)
export const revalidate = 3600;

export default async function Projects() {
  // 프로젝트 카드 내용이 서버 HTML에 담기도록 미리 fetch (기본 필터: 전체/추천순/1페이지)
  const initialProjects = await fetchProjectsList({ limit: 6 });

  return <ProjectsPage initialProjects={initialProjects} />;
}
