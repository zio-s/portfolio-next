'use client';

/**
 * 모바일 카테고리 칩 가로 스크롤
 *
 * mobile.jsx MobileHFList의 filter chips 영역.
 * lg 미만에서만 노출 (PostsPage에서 lg:hidden으로 제어).
 * URL ?cat= 동기화. drawer 없이도 빠른 카테고리 전환 제공.
 */

import { useSearchParams } from 'react-router-dom';
import type { Post } from '@/store/types';
import { aggregateCategories } from '@/lib/blog';

interface CategoryChipsProps {
  posts: Post[];
}

export function CategoryChips({ posts }: CategoryChipsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') ?? 'all';
  const categories = aggregateCategories(posts);

  const setCat = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === 'all') next.delete('cat');
    else next.set('cat', slug);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div
      className="blog-scrollbar-hide flex gap-1.5 overflow-x-auto pb-1"
      role="tablist"
      aria-label="카테고리 필터"
    >
      {categories.map((c) => {
        const active = c.slug === activeCat;
        return (
          <button
            key={c.slug}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setCat(c.slug)}
            className="shrink-0 rounded-[14px] px-3 py-1.5 text-[12px] whitespace-nowrap transition-colors"
            style={{
              background: active ? 'var(--blog-accent-soft)' : 'var(--blog-card)',
              color: active ? 'var(--blog-accent)' : 'var(--blog-fg-muted)',
              border: `1px solid ${active ? 'var(--blog-accent)' : 'var(--blog-border)'}`,
              fontWeight: active ? 600 : 400,
            }}
          >
            {c.label}
            <span className="blog-mono ml-1 text-[10px] opacity-70">{c.count}</span>
          </button>
        );
      })}
    </div>
  );
}
