/**
 * 블로그 카테고리 정의
 *
 * DESIGN_RESPONSE.md §3.1 — A안 (별도 컬럼) 채택, 6개 고정.
 * 추가/순서 변경은 이 파일 + DB seed 함께 갱신.
 */

export const BLOG_CATEGORIES = [
  { slug: 'frontend',   label: 'Frontend',   order: 1 },
  { slug: 'react',      label: 'React',      order: 2 },
  { slug: 'typescript', label: 'TypeScript', order: 3 },
  { slug: 'design',     label: 'Design',     order: 4 },
  { slug: 'tools',      label: 'Tools',      order: 5 },
  { slug: 'daily',      label: 'Daily',      order: 6 },
] as const;

export type BlogCategorySlug = typeof BLOG_CATEGORIES[number]['slug'];

export const DEFAULT_CATEGORY: BlogCategorySlug = 'daily';

export function getCategoryBySlug(slug: string | undefined | null): { slug: BlogCategorySlug; label: string; order: number } {
  if (slug) {
    const found = BLOG_CATEGORIES.find((c) => c.slug === slug);
    if (found) return found;
  }
  // 폴백: 기본 카테고리
  return BLOG_CATEGORIES[BLOG_CATEGORIES.length - 1];
}

export function isValidCategorySlug(slug: string | undefined | null): slug is BlogCategorySlug {
  return !!slug && BLOG_CATEGORIES.some((c) => c.slug === slug);
}
