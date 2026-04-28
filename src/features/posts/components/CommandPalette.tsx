'use client';

/**
 * Command Palette (⌘K)
 *
 * blog-n/SPEC.md §5.4
 * - 어디서든 ⌘K / Ctrl+K로 호출 (글로벌 키 핸들러는 useCommandPalette 훅 참조)
 * - 모달 640px, top:80px
 * - 그룹: Posts / Tags
 * - ↑↓ 이동, ↵ 열기, ⌘↵ 새 탭, esc 닫기
 * - 매칭 텍스트 mark 하이라이트
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Hash, CornerDownLeft, FolderOpen } from 'lucide-react';
import type { Post } from '@/store/types';
import { routeHelpers } from '@/router/routes';
import { aggregateTags, deriveCategory, formatBlogDate, calcReadMinutes } from '@/lib/blog';
import { BLOG_CATEGORIES } from '@/config/categories';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  posts: Post[];
}

type Hit =
  | { kind: 'post'; post: Post; href: string; label: string; sub: string }
  | { kind: 'tag'; tag: string; count: number; href: string; label: string; sub: string }
  | { kind: 'category'; slug: string; count: number; href: string; label: string; sub: string };

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function CommandPalette({ open, onClose, posts }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // open될 때 초기화 + 포커스
  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const tags = useMemo(() => aggregateTags(posts), [posts]);

  const hits: Hit[] = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      // 빈 검색어: 최근 5개 글
      return posts.slice(0, 5).map<Hit>((p) => ({
        kind: 'post',
        post: p,
        href: routeHelpers.blogDetail(p.post_number),
        label: p.title,
        sub: `${formatBlogDate(p.publishedAt || p.published_at || p.createdAt || p.created_at)} · ${calcReadMinutes(p.content)}분 읽기`,
      }));
    }
    const postHits: Hit[] = posts
      .filter((p) =>
        p.title.toLowerCase().includes(query) ||
        (p.excerpt ?? '').toLowerCase().includes(query) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(query))
      )
      .slice(0, 8)
      .map((p) => ({
        kind: 'post' as const,
        post: p,
        href: routeHelpers.blogDetail(p.post_number),
        label: p.title,
        sub: `${formatBlogDate(p.publishedAt || p.published_at || p.createdAt || p.created_at)} · ${calcReadMinutes(p.content)}분 읽기`,
      }));
    const tagHits: Hit[] = tags
      .filter(({ tag }) => tag.toLowerCase().includes(query))
      .slice(0, 5)
      .map(({ tag, count }) => ({
        kind: 'tag' as const,
        tag,
        count,
        href: `/blog?tag=${encodeURIComponent(tag)}`,
        label: `#${tag}`,
        sub: `${count}개 글`,
      }));
    const catCounts = posts.reduce<Record<string, number>>((acc, p) => {
      const c = deriveCategory(p);
      acc[c.slug] = (acc[c.slug] ?? 0) + 1;
      return acc;
    }, {});
    const categoryHits: Hit[] = BLOG_CATEGORIES
      .filter((c) =>
        c.slug.toLowerCase().includes(query) ||
        c.label.toLowerCase().includes(query)
      )
      .slice(0, 4)
      .map((c) => ({
        kind: 'category' as const,
        slug: c.slug,
        count: catCounts[c.slug] ?? 0,
        href: `/blog?cat=${encodeURIComponent(c.slug)}`,
        label: c.label,
        sub: `${catCounts[c.slug] ?? 0}개 글`,
      }));
    return [...postHits, ...categoryHits, ...tagHits];
  }, [posts, tags, q]);

  const postHits = hits.filter((h) => h.kind === 'post');
  const categoryHits = hits.filter((h) => h.kind === 'category');
  const tagHits = hits.filter((h) => h.kind === 'tag');

  // active를 hits 길이에 맞게 유지
  useEffect(() => {
    if (active >= hits.length) setActive(0);
  }, [hits.length, active]);

  // 활성 항목 자동 스크롤
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const openHit = (hit: Hit, newTab = false) => {
    if (newTab && typeof window !== 'undefined') {
      window.open(hit.href, '_blank', 'noopener,noreferrer');
    } else {
      navigate(hit.href);
    }
    onClose();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (hits.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = hits[active];
      if (hit) openHit(hit, e.metaKey || e.ctrlKey);
    }
  };

  if (!open) return null;

  return (
    <div onKeyDown={onKeyDown}>
      <div className="blog-cmd-backdrop" onClick={onClose} aria-hidden />
      <div className="blog-cmd-modal" role="dialog" aria-modal aria-label="검색">
        {/* search input */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--blog-border)' }}>
          <Search className="w-4 h-4 text-[var(--blog-fg-muted)]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목, 발췌, 태그 검색…"
            className="flex-1 bg-transparent outline-none border-0 text-[var(--blog-fg)] text-[15px]"
            style={{ fontFamily: 'var(--blog-font-sans)' }}
          />
          <button onClick={onClose} className="blog-kbd" style={{ height: 22, padding: '0 8px' }}>esc</button>
        </div>

        {/* results */}
        <div ref={listRef} className="max-h-[480px] overflow-auto py-2">
          {hits.length === 0 && (
            <div className="px-5 py-12 text-center">
              <div className="blog-mono text-[12.5px]" style={{ color: 'var(--blog-fg-muted)' }}>
                {q.trim() ? `"${q}"에 대한 결과 없음` : '게시글이 없습니다'}
              </div>
              {q.trim() && (
                <div className="blog-mono text-[11.5px] mt-2" style={{ color: 'var(--blog-fg-subtle)' }}>
                  태그로 검색: <span style={{ color: 'var(--blog-accent)' }}>#react</span>{' '}
                  <span style={{ color: 'var(--blog-accent)' }}>#typescript</span>
                </div>
              )}
            </div>
          )}

          {postHits.length > 0 && (
            <>
              <div className="px-4 pt-2 pb-1">
                <div className="blog-uppercase-label text-[10px]">{q.trim() ? `Posts · ${postHits.length}` : 'Recent Posts'}</div>
              </div>
              {postHits.map((h, i) => {
                const idx = i;
                const isActive = idx === active;
                const cat = deriveCategory(h.post);
                return (
                  <div
                    key={`p-${h.post.id}`}
                    data-idx={idx}
                    data-active={isActive}
                    className="blog-cmd-row"
                    onMouseEnter={() => setActive(idx)}
                    onClick={(e) => openHit(h, e.metaKey || e.ctrlKey)}
                  >
                    <div
                      className="w-7 h-7 rounded-md grid place-items-center shrink-0"
                      style={{ background: 'var(--blog-bg)', border: '1px solid var(--blog-border)', color: 'var(--blog-accent)' }}
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium truncate" style={{ color: 'var(--blog-fg)' }}>
                        <span className="blog-mono mr-2 text-[10px] uppercase" style={{ color: 'var(--blog-accent)' }}>{cat.label}</span>
                        {highlight(h.label, q)}
                      </div>
                      <div className="blog-mono text-[11px] mt-0.5" style={{ color: 'var(--blog-fg-subtle)' }}>{h.sub}</div>
                    </div>
                    {isActive && <span className="blog-kbd"><CornerDownLeft className="w-3 h-3" /></span>}
                  </div>
                );
              })}
            </>
          )}

          {categoryHits.length > 0 && (
            <>
              <div className="h-px mx-4 my-2" style={{ background: 'var(--blog-border-soft)' }} />
              <div className="px-4 pt-1 pb-1">
                <div className="blog-uppercase-label text-[10px]">Categories · {categoryHits.length}</div>
              </div>
              {categoryHits.map((h, i) => {
                const idx = postHits.length + i;
                const isActive = idx === active;
                return (
                  <div
                    key={`c-${h.slug}`}
                    data-idx={idx}
                    data-active={isActive}
                    className="blog-cmd-row"
                    onMouseEnter={() => setActive(idx)}
                    onClick={(e) => openHit(h, e.metaKey || e.ctrlKey)}
                  >
                    <div
                      className="w-7 h-7 rounded-md grid place-items-center shrink-0"
                      style={{ background: 'var(--blog-bg)', border: '1px solid var(--blog-border)', color: 'var(--blog-accent)' }}
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13.5px] font-medium" style={{ color: 'var(--blog-fg)' }}>{highlight(h.label, q)}</div>
                      <div className="blog-mono text-[11px] mt-0.5" style={{ color: 'var(--blog-fg-subtle)' }}>{h.sub}</div>
                    </div>
                    {isActive && <span className="blog-kbd"><CornerDownLeft className="w-3 h-3" /></span>}
                  </div>
                );
              })}
            </>
          )}

          {tagHits.length > 0 && (
            <>
              <div className="h-px mx-4 my-2" style={{ background: 'var(--blog-border-soft)' }} />
              <div className="px-4 pt-1 pb-1">
                <div className="blog-uppercase-label text-[10px]">Tags · {tagHits.length}</div>
              </div>
              {tagHits.map((h, i) => {
                const idx = postHits.length + categoryHits.length + i;
                const isActive = idx === active;
                return (
                  <div
                    key={`t-${h.tag}`}
                    data-idx={idx}
                    data-active={isActive}
                    className="blog-cmd-row"
                    onMouseEnter={() => setActive(idx)}
                    onClick={(e) => openHit(h, e.metaKey || e.ctrlKey)}
                  >
                    <div
                      className="w-7 h-7 rounded-md grid place-items-center shrink-0"
                      style={{ background: 'var(--blog-bg)', border: '1px solid var(--blog-border)', color: 'var(--blog-fg-muted)' }}
                    >
                      <Hash className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13.5px] font-medium" style={{ color: 'var(--blog-fg)' }}>{highlight(h.label, q)}</div>
                      <div className="blog-mono text-[11px] mt-0.5" style={{ color: 'var(--blog-fg-subtle)' }}>{h.sub}</div>
                    </div>
                    {isActive && <span className="blog-kbd"><CornerDownLeft className="w-3 h-3" /></span>}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 blog-mono text-[11px]"
             style={{ borderTop: '1px solid var(--blog-border)', background: 'var(--blog-bg)', color: 'var(--blog-fg-subtle)' }}>
          <span className="inline-flex items-center gap-1"><span className="blog-kbd">↑</span><span className="blog-kbd">↓</span> 이동</span>
          <span className="inline-flex items-center gap-1"><span className="blog-kbd">↵</span> 열기</span>
          <span className="inline-flex items-center gap-1"><span className="blog-kbd">⌘</span><span className="blog-kbd">↵</span> 새 탭</span>
          <div className="flex-1" />
          <span>{hits.length}개 결과</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 글로벌 ⌘K / Ctrl+K 단축키 훅 (어디서든 import해서 사용)
 */
export function useCommandPaletteShortcut(open: boolean, onToggle: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isK = e.key === 'k' || e.key === 'K';
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onToggle();
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onToggle]);
}
