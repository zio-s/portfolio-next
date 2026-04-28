import type { Post } from '@/store/types';

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

export function deriveCategory(post: Pick<Post, 'tags'>): { slug: string; label: string } {
  const tag = post.tags?.[0]?.trim();
  if (!tag) return { slug: 'misc', label: 'Misc' };
  return { slug: tag.toLowerCase(), label: capitalize(tag) };
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
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

export function aggregateCategories(posts: Post[]): { slug: string; label: string; count: number }[] {
  const map = new Map<string, { slug: string; label: string; count: number }>();
  for (const p of posts) {
    const { slug, label } = deriveCategory(p);
    const cur = map.get(slug);
    if (cur) cur.count += 1;
    else map.set(slug, { slug, label, count: 1 });
  }
  return [{ slug: 'all', label: '전체', count: posts.length }, ...Array.from(map.values()).sort((a, b) => b.count - a.count)];
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
