'use client';

/**
 * Command Palette (⌘K)
 *
 * 데스크톱: 중앙 모달 (640px, top:80px)
 * 모바일(<768px): 풀스크린 검색 페이지 (mobile.jsx MobileHFCmdK 참조)
 *   - iOS 키보드(~291px) 가림 방지를 위해 바텀시트 X
 *   - 56px 상단 input + 필터 chip + 결과 (flex 1, overflow auto)
 *   - autoFocus + history.pushState 로 back 버튼 닫기 연동
 *
 * 공통: scope chip (전체/제목/본문/태그), 매칭 mark 하이라이트, ↑↓/↵/⌘↵/esc
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Hash, CornerDownLeft, FolderOpen, ChevronRight, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { Post } from '@/store/types';
import { routeHelpers } from '@/router/routes';
import { aggregateTags, deriveCategory, formatBlogDate, calcReadMinutes } from '@/lib/blog';
import { BLOG_CATEGORIES } from '@/config/categories';

type Scope = 'all' | 'title' | 'body' | 'tag';

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'all',   label: '전체' },
  { key: 'title', label: '제목' },
  { key: 'body',  label: '본문' },
  { key: 'tag',   label: '태그' },
];

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

function matchPost(post: Post, q: string, scope: Scope): boolean {
  const query = q.toLowerCase();
  const title = post.title?.toLowerCase() ?? '';
  const excerpt = post.excerpt?.toLowerCase() ?? '';
  const content = post.content?.toLowerCase() ?? '';
  const tags = (post.tags ?? []).map((t) => t.toLowerCase());
  switch (scope) {
    case 'title': return title.includes(query);
    case 'body':  return content.includes(query) || excerpt.includes(query);
    case 'tag':   return tags.some((t) => t.includes(query));
    case 'all':
    default:      return title.includes(query) || excerpt.includes(query) || tags.some((t) => t.includes(query));
  }
}

export function CommandPalette({ open, onClose, posts }: CommandPaletteProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [q, setQ] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 초기화 + 포커스
  useEffect(() => {
    if (open) {
      setQ('');
      setScope('all');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // 모바일: history.pushState로 back 버튼 닫기 연동 (DESIGN_RESPONSE_R3.md §4 가드 강화)
  useEffect(() => {
    if (!open || !isMobile || typeof window === 'undefined') return;
    window.history.pushState({ commandPalette: true }, '');
    const onPop = (e: PopStateEvent) => {
      // 우리가 push한 entry로 돌아간 경우는 무시 (다른 navigation이 끼어들었을 때)
      if (e.state?.commandPalette) return;
      onClose();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // 정상 close (취소 버튼 / 결과 클릭 / ESC) 시 우리 history entry 정리
      if (window.history.state?.commandPalette) {
        window.history.back();
      }
    };
  }, [open, isMobile, onClose]);

  const tags = useMemo(() => aggregateTags(posts), [posts]);

  // scope별 카운트 (filter chip badge용) — 빈 검색어면 0
  const scopeCounts = useMemo(() => {
    const query = q.trim();
    if (!query) return { all: 0, title: 0, body: 0, tag: 0 };
    return {
      all:   posts.filter((p) => matchPost(p, query, 'all')).length,
      title: posts.filter((p) => matchPost(p, query, 'title')).length,
      body:  posts.filter((p) => matchPost(p, query, 'body')).length,
      tag:   posts.filter((p) => matchPost(p, query, 'tag')).length,
    };
  }, [posts, q]);

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
      .filter((p) => matchPost(p, query, scope))
      .slice(0, isMobile ? 20 : 8)
      .map((p) => ({
        kind: 'post' as const,
        post: p,
        href: routeHelpers.blogDetail(p.post_number),
        label: p.title,
        sub: `${formatBlogDate(p.publishedAt || p.published_at || p.createdAt || p.created_at)} · ${calcReadMinutes(p.content)}분 읽기`,
      }));
    // scope === 'all'에서만 categories/tags 그룹 표시
    if (scope !== 'all') return postHits;

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
    return [...postHits, ...categoryHits, ...tagHits];
  }, [posts, tags, q, scope, isMobile]);

  const postHits = hits.filter((h) => h.kind === 'post');
  const categoryHits = hits.filter((h) => h.kind === 'category');
  const tagHits = hits.filter((h) => h.kind === 'tag');

  useEffect(() => {
    if (active >= hits.length) setActive(0);
  }, [hits.length, active]);

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
    // 모바일: 결과 클릭 시 키보드 dismiss 위해 input blur
    inputRef.current?.blur();
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

  // === 결과 리스트 (공통) ===
  const renderResults = () => (
    <div ref={listRef} className={isMobile ? 'flex-1 overflow-auto' : 'max-h-[480px] overflow-auto py-2'}>
      {hits.length === 0 && (
        <div className={isMobile ? 'px-5 py-12 text-center' : 'px-5 py-12 text-center'}>
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
          {!isMobile && (
            <div className="px-4 pt-2 pb-1">
              <div className="blog-uppercase-label text-[10px]">{q.trim() ? `Posts · ${postHits.length}` : 'Recent Posts'}</div>
            </div>
          )}
          {isMobile && (
            <div className="px-4 pt-3 pb-1">
              <div className="blog-uppercase-label text-[10px]">{q.trim() ? `Posts · ${postHits.length}` : 'Recent Posts'}</div>
            </div>
          )}
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
                style={isMobile ? { borderBottom: '1px solid var(--blog-border-soft)' } : undefined}
              >
                <div
                  className="w-7 h-7 rounded-md grid place-items-center shrink-0"
                  style={{ background: 'var(--blog-bg)', border: '1px solid var(--blog-border)', color: 'var(--blog-accent)' }}
                >
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium truncate" style={{ color: 'var(--blog-fg)' }}>
                    {!isMobile && (
                      <span className="blog-mono mr-2 text-[10px] uppercase" style={{ color: 'var(--blog-accent)' }}>{cat.label}</span>
                    )}
                    {highlight(h.label, q)}
                  </div>
                  <div className="blog-mono text-[11px] mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--blog-fg-subtle)' }}>
                    {isMobile && (
                      <>
                        <span className="uppercase font-semibold" style={{ color: 'var(--blog-accent)' }}>{cat.label}</span>
                        <span style={{ color: 'var(--blog-border)' }}>·</span>
                      </>
                    )}
                    <span>{h.sub}</span>
                  </div>
                </div>
                {isMobile ? (
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--blog-fg-subtle)' }} />
                ) : isActive && <span className="blog-kbd"><CornerDownLeft className="w-3 h-3" /></span>}
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
  );

  // === Scope chips (공통) ===
  const renderScopeChips = (compact = false) => (
    <div
      className="blog-scrollbar-hide flex gap-1.5 overflow-x-auto"
      style={compact ? { padding: '8px 16px', borderBottom: '1px solid var(--blog-border)' } : { padding: '8px 16px 0' }}
      role="tablist"
      aria-label="검색 범위"
    >
      {SCOPES.map((s) => {
        const active = s.key === scope;
        const count = scopeCounts[s.key];
        return (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setScope(s.key)}
            className="shrink-0 rounded-[12px] px-2.5 py-1 text-[12px] whitespace-nowrap transition-colors"
            style={{
              background: active ? 'var(--blog-accent-soft)' : 'transparent',
              color: active ? 'var(--blog-accent)' : 'var(--blog-fg-muted)',
              border: `1px solid ${active ? 'var(--blog-accent)' : 'var(--blog-border)'}`,
              fontWeight: active ? 600 : 400,
            }}
          >
            {s.label}
            {q.trim() && (
              <span className="blog-mono ml-1 text-[10px] opacity-70">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );

  // === Mobile fullscreen ===
  if (isMobile) {
    return (
      <div
        onKeyDown={onKeyDown}
        className="fixed inset-0 z-[1050] flex flex-col"
        style={{ background: 'var(--blog-bg)' }}
        role="dialog"
        aria-modal
        aria-label="검색"
      >
        {/* Top input bar */}
        <header
          className="flex items-center gap-2.5 h-14 px-3 pl-4 shrink-0"
          style={{ borderBottom: '1px solid var(--blog-border)' }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--blog-fg-muted)' }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="글, 태그, 카테고리…"
            className="flex-1 bg-transparent border-0 outline-none text-[16px]"
            style={{
              color: 'var(--blog-fg)',
              fontFamily: 'var(--blog-font-sans)',
              caretColor: 'var(--blog-accent)',
            }}
            autoFocus
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(''); inputRef.current?.focus(); }}
              className="w-[22px] h-[22px] rounded-full grid place-items-center text-[12px] shrink-0"
              style={{ background: 'var(--blog-card)', color: 'var(--blog-fg-muted)' }}
              aria-label="검색어 지우기"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <div className="w-px h-5 mx-1" style={{ background: 'var(--blog-border)' }} />
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-medium px-1"
            style={{ color: 'var(--blog-accent)' }}
          >
            취소
          </button>
        </header>

        {/* Scope chips */}
        {renderScopeChips(true)}

        {/* Results */}
        {renderResults()}
      </div>
    );
  }

  // === Desktop modal ===
  return (
    <div onKeyDown={onKeyDown}>
      <div className="blog-cmd-backdrop" onClick={onClose} aria-hidden />
      <div className="blog-cmd-modal" role="dialog" aria-modal aria-label="검색">
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

        {/* Scope chips */}
        {renderScopeChips(false)}

        {/* Results */}
        {renderResults()}

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
