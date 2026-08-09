/**
 * 서버 컴포넌트용 데이터 fetcher
 *
 * 목록 페이지(홈/블로그/프로젝트)의 알맹이가 서버 HTML에 담기도록
 * page.tsx(서버 컴포넌트)에서 호출해 initial props로 내려준다.
 * 클라이언트의 RTK Query(projectsApi/postsApi/guestbookApi)와 동일한
 * 쿼리를 재현하므로, 하이드레이션 후 RTK가 다시 fetch해도 결과가 같다.
 *
 * 실패 시 undefined를 반환해 기존 클라이언트 fetch 동작으로 폴백한다.
 */

import { createClient } from '@supabase/supabase-js';
import { transformProject } from '@/features/portfolio/api/transform';
import { transformGuestbookFromDB } from '@/features/guestbook/types/Guestbook';
import type { ProjectsResponse } from '@/features/portfolio/types/Project';
import type { GuestbookListResponse, GuestbookDB } from '@/features/guestbook/types/Guestbook';
import type { Post } from '@/store/types';

const getClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * 프로젝트 목록 (projectsApi.getProjects의 서버판)
 * 기본 정렬(sort_order asc), hidden 제외
 */
export async function fetchProjectsList(options?: {
  featured?: boolean;
  limit?: number;
}): Promise<ProjectsResponse | undefined> {
  const supabase = getClient();
  if (!supabase) return undefined;

  try {
    const limit = options?.limit ?? 10;
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('hidden', false);

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    query = query.order('sort_order', { ascending: true }).range(0, limit - 1);

    const { data, error, count } = await query;
    if (error) return undefined;

    return {
      items: (data || []).map(transformProject),
      pagination: {
        page: 1,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch {
    return undefined;
  }
}

/**
 * 발행된 블로그 글 목록 (postsApi.getPosts의 서버판)
 * post_stats 뷰 사용. is_liked는 사용자 식별자가 없으므로 false.
 */
export async function fetchPublishedPosts(): Promise<Post[] | undefined> {
  const supabase = getClient();
  if (!supabase) return undefined;

  try {
    const { data, error } = await supabase
      .from('post_stats')
      .select('*')
      .eq('status', 'published');

    if (error) return undefined;

    return (data || []).map((post: Record<string, unknown>) => ({
      ...post,
      is_liked: false,
      createdAt: (post.created_at as string) || (post.createdAt as string),
      updatedAt: (post.updated_at as string) || (post.updatedAt as string),
      publishedAt: (post.published_at as string) || (post.publishedAt as string),
    })) as Post[];
  } catch {
    return undefined;
  }
}

/**
 * 방명록 미리보기 (guestbookApi.getGuestbook의 서버판)
 * 승인된 항목만, 고정글 우선 + 최신순
 */
export async function fetchGuestbookPreview(
  limit = 3
): Promise<GuestbookListResponse | undefined> {
  const supabase = getClient();
  if (!supabase) return undefined;

  try {
    const { count } = await supabase
      .from('guestbook')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true);

    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .eq('is_approved', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (error) return undefined;

    const hasMore = (data || []).length > limit;
    const items = (data || []).slice(0, limit) as GuestbookDB[];

    return {
      items: items.map(transformGuestbookFromDB),
      total: count || 0,
      limit,
      hasMore,
    };
  } catch {
    return undefined;
  }
}
