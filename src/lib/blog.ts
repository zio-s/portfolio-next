import type { Post } from '@/store/types';
import { BLOG_CATEGORIES, DEFAULT_CATEGORY, getCategoryBySlug, isValidCategorySlug } from '@/config/categories';

const WORDS_PER_MINUTE = 250;

export function calcReadMinutes(content: string | undefined | null): number {
  if (!content) return 1;
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~\-]/g, ' ')
    .trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

const IMG_PATTERNS = [
  /!\[[^\]]*\]\(([^)\s]+)/, // markdown image
  /<img[^>]+src=["']([^"']+)["']/i, // html image
];

export function extractThumbnail(content: string | undefined | null): string | undefined {
  if (!content) return undefined;
  for (const re of IMG_PATTERNS) {
    const m = content.match(re);
    if (m?.[1]) return m[1];
  }
  return undefined;
}

/**
 * post.category(정식 컬럼)를 우선 사용. 없거나 잘못된 값이면 tags[0]을 BLOG_CATEGORIES와 매칭 시도.
 * 마지막 폴백은 DEFAULT_CATEGORY.
 *
 * 마이그레이션 완료 후에는 항상 post.category가 있으므로 폴백 분기는 의미 없음.
 */
export function deriveCategory(post: Pick<Post, 'category' | 'tags'>): { slug: string; label: string } {
  if (isValidCategorySlug(post.category)) {
    const c = getCategoryBySlug(post.category);
    return { slug: c.slug, label: c.label };
  }
  const tagSlug = post.tags?.[0]?.toLowerCase().trim();
  if (isValidCategorySlug(tagSlug)) {
    const c = getCategoryBySlug(tagSlug);
    return { slug: c.slug, label: c.label };
  }
  const fallback = getCategoryBySlug(DEFAULT_CATEGORY);
  return { slug: fallback.slug, label: fallback.label };
}

export function formatBlogDate(dateString: string | undefined | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function formatRelative(dateString: string | undefined | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return formatBlogDate(dateString);
}

export function isNewPost(dateString: string | undefined | null, days = 3): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}

export type SortKey = 'latest' | 'popular' | 'comments';

export function sortPosts(posts: Post[], key: SortKey): Post[] {
  const arr = [...posts];
  switch (key) {
    case 'popular':
      return arr.sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0));
    case 'comments':
      return arr.sort((a, b) => (b.comments_count ?? 0) - (a.comments_count ?? 0));
    case 'latest':
    default:
      return arr.sort(
        (a, b) =>
          new Date(b.publishedAt || b.published_at || b.createdAt || b.created_at || 0).getTime() -
          new Date(a.publishedAt || a.published_at || a.createdAt || a.created_at || 0).getTime()
      );
  }
}

/**
 * BLOG_CATEGORIES 6개 고정 순서로 카운트 집계 + '전체'를 맨 앞에.
 * count가 0인 카테고리도 표시 (사이드바에서 빈 카테고리 노출 의도).
 */
export function aggregateCategories(posts: Post[]): { slug: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts) {
    const { slug } = deriveCategory(p);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  const ordered = BLOG_CATEGORIES.map((c) => ({ slug: c.slug, label: c.label, count: counts.get(c.slug) ?? 0 }));
  return [{ slug: 'all', label: '전체', count: posts.length }, ...ordered];
}

export function aggregateTags(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags ?? []) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
