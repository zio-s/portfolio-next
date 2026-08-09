/**
 * Supabase Row → Frontend Project 변환
 * snake_case → camelCase
 *
 * projectsApi(클라이언트)와 서버 컴포넌트 fetcher가 공유하므로
 * React/RTK 의존성 없는 순수 모듈로 분리되어 있다.
 */

import type { Database } from '../../../lib/database.types';
import type { Project } from '../types/Project';

export const transformProject = (row: Database['public']['Tables']['projects']['Row']): Project => ({
  id: row.id,
  title: row.title,
  description: row.description,
  content: row.content || row.description, // content 필드 사용, 없으면 description 대체
  thumbnail: row.thumbnail,
  category: row.category as Project['category'],
  tags: row.tags ?? [],
  techStack: row.tech_stack ?? [],
  githubUrl: row.github_url ?? undefined,
  liveUrl: row.demo_url ?? undefined,
  status: 'public' as const,
  featured: row.featured ?? false,
  hidden: (row as Record<string, unknown>).hidden as boolean ?? false,
  duration: row.duration,
  teamSize: row.team_size,
  role: row.role,
  achievements: row.achievements ?? [],
  challenges: row.challenges ?? [],
  solutions: row.solutions ?? [],
  stats: {
    views: row.views ?? 0,
    likes: row.likes ?? 0,
    comments: 0,
  },
  images: row.images ?? [],
  createdAt: row.created_at ?? new Date().toISOString(),
  updatedAt: row.updated_at ?? new Date().toISOString(),
  authorId: 'system',
  sortOrder: row.sort_order ?? 0,
});
