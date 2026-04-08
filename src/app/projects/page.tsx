import type { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/common/SEO';
import ProjectsPage from '@/views/ProjectsPage';

export const metadata: Metadata = generateSEOMetadata({
  title: '프로젝트 | 변세민 | 프론트엔드 개발자',
  description: 'React, TypeScript, Redux를 활용해 개발한 웹 애플리케이션 프로젝트를 소개합니다.',
  url: 'https://semincode.com/projects',
});

export default function Projects() {
  return <ProjectsPage />;
}
