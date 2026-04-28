'use client';

import { Link, useSearchParams } from 'react-router-dom';
import { Search, Heart } from 'lucide-react';
import type { Post } from '@/store/types';
import { aggregateCategories, aggregateTags } from '@/lib/blog';
import { PROFILE } from '@/config/profile';

interface BlogSidebarProps {
  posts: Post[];
  onOpenSearch?: () => void;
}

export function BlogSidebar({ posts, onOpenSearch }: BlogSidebarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') ?? 'all';
  const activeTag = searchParams.get('tag') ?? '';

  const categories = aggregateCategories(posts);
  const tags = aggregateTags(posts).slice(0, 12);

  const totalViews = posts.reduce((s, p) => s + (p.views_count ?? 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.likes_count ?? 0), 0);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <aside className="w-full lg:w-[280px] lg:shrink-0 lg:border-r lg:border-[var(--blog-border)] lg:px-6 lg:py-7 flex flex-col gap-7 text-[var(--blog-fg)]">
      {/* Profile */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full grid place-items-center font-bold text-[17px] text-white"
             style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
          {PROFILE.initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight">{PROFILE.name}</div>
          <div className="text-[11.5px] text-[var(--blog-fg-muted)] mt-0.5">{PROFILE.role}</div>
        </div>
      </div>

      {/* Search trigger */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-[var(--blog-fg-muted)] hover:border-[var(--blog-accent)]/40 transition-colors"
        style={{ background: 'var(--blog-card)', border: '1px solid var(--blog-border)' }}
      >
        <Search className="w-3.5 h-3.5 text-[var(--blog-fg-subtle)]" />
        <span className="flex-1 text-left">전체 검색…</span>
        <span className="blog-kbd">⌘K</span>
      </button>

      {/* Categories */}
      <div>
        <div className="blog-uppercase-label mb-3">Categories</div>
        <div className="flex flex-col gap-px">
          {categories.map((c) => {
            const isActive = c.slug === activeCat;
            return (
              <button
                key={c.slug}
                type="button"
                data-active={isActive}
                onClick={() => setParam('cat', c.slug)}
                className="blog-cat-row text-left"
              >
                <span>{c.label}</span>
                <span className="blog-mono text-[11px]" style={{ color: isActive ? 'var(--blog-accent)' : 'var(--blog-fg-subtle)' }}>{c.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <div className="blog-uppercase-label mb-3">Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(({ tag, count }) => {
              const isActive = tag === activeTag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setParam('tag', isActive ? null : tag)}
                  className="blog-tag"
                  style={isActive ? { background: 'var(--blog-accent-soft)', color: 'var(--blog-accent)', borderColor: 'var(--blog-accent)' } : undefined}
                >
                  #{tag}
                  <span className="ml-1" style={{ color: isActive ? 'var(--blog-accent)' : 'var(--blog-fg-subtle)' }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div>
        <div className="blog-uppercase-label mb-2.5">Stats</div>
        <div className="blog-mono text-[11.5px] text-[var(--blog-fg-muted)] leading-[1.85]">
          <div className="flex justify-between"><span>POSTS</span><span className="text-[var(--blog-fg)]">{posts.length}</span></div>
          <div className="flex justify-between"><span>VIEWS</span><span className="text-[var(--blog-fg)]">{totalViews.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>LIKES</span><span className="text-[var(--blog-fg)] inline-flex items-center gap-1"><Heart className="w-3 h-3" />{totalLikes.toLocaleString()}</span></div>
        </div>
      </div>
    </aside>
  );
}
