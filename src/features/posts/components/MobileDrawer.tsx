'use client';

/**
 * 모바일 좌측 슬라이드 drawer
 *
 * blog-n/1/Blog Design.html §5 / mobile.jsx MobileHFDrawer
 * - 헤더 햄버거가 트리거
 * - 콘텐츠: 닫기 + 프로필 / 검색 trigger / Nav / Categories / Tags
 * - 좌측 슬라이드 인 240ms ease-out, backdrop blur(2px) + opacity 0.55
 * - ESC + 백드롭 클릭 + 라우트 변경 자동 close + body scroll lock
 *
 * lazy fetch: open된 적 없으면 useGetPostsQuery skip → categories/tags 비표시
 * 한 번 열린 후 RTK 캐시 활용
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, LogOut, PenSquare, Search, X } from 'lucide-react';
import { useAppDispatch, useGetPostsQuery } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { openCommandPalette } from './GlobalCommandPalette';
import { aggregateCategories, aggregateTags } from '@/lib/blog';
import { PROFILE } from '@/config/profile';
import { ROUTES } from '@/router/routes';
import type { MenuItem } from '@/components/layout/Header';

const OPEN_EVENT = 'open-mobile-drawer';

/** 어디서든 호출하면 drawer가 열림 (PublicHeader 햄버거에서 사용) */
export function openMobileDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_EVENT));
  }
}

interface MobileDrawerProps {
  publicMenuItems?: MenuItem[];
  user?: { name: string; email: string; avatar?: string };
}

type CategoriesSectionProps = {
  categories: { slug: string; label: string; count: number }[];
  activeCat: string;
  setParam: (key: string, value: string | null) => void;
  navigate: (to: string) => void;
  onBlogRoute: boolean;
};

function CategoriesSection({ categories, activeCat, setParam, navigate, onBlogRoute }: CategoriesSectionProps) {
  return (
    <div>
      <div className="blog-uppercase-label mb-2.5">Categories</div>
      <div className="flex flex-col gap-px">
        {categories.map((c) => {
          const isActive = c.slug === activeCat && onBlogRoute;
          return (
            <button
              key={c.slug}
              type="button"
              data-active={isActive}
              onClick={() => {
                setParam('cat', c.slug);
                if (!onBlogRoute) navigate(`/blog${c.slug !== 'all' ? `?cat=${c.slug}` : ''}`);
              }}
              className="blog-cat-row text-left"
            >
              <span>{c.label}</span>
              <span className="blog-mono text-[11px]" style={{ color: isActive ? 'var(--blog-accent)' : 'var(--blog-fg-subtle)' }}>{c.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type TagsSectionProps = {
  tags: { tag: string; count: number }[];
  activeTag: string;
  setParam: (key: string, value: string | null) => void;
  navigate: (to: string) => void;
  onBlogRoute: boolean;
};

function TagsSection({ tags, activeTag, setParam, navigate, onBlogRoute }: TagsSectionProps) {
  return (
    <div>
      <div className="blog-uppercase-label mb-2.5">Tags</div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(({ tag, count }) => {
          const isActive = tag === activeTag && onBlogRoute;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setParam('tag', isActive ? null : tag);
                if (!onBlogRoute) navigate(`/blog?tag=${encodeURIComponent(tag)}`);
              }}
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
  );
}

export function MobileDrawer({ publicMenuItems = [], user }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  // 비-블로그 라우트에서 Categories/Tags details를 한 번이라도 expand했는지
  const [hasExpandedFilters, setHasExpandedFilters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') ?? 'all';
  const activeTag = searchParams.get('tag') ?? '';
  const onBlogRoute = location.pathname.startsWith('/blog');

  const handleOpen = useCallback(() => {
    setOpen(true);
    setHasOpened(true);
  }, []);
  const handleClose = useCallback(() => setOpen(false), []);

  // 커스텀 이벤트
  useEffect(() => {
    const onOpen = () => handleOpen();
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [handleOpen]);

  // 라우트 변경 → 자동 close
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  // body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // lazy fetch (DESIGN_RESPONSE_R3.md §3): blog route이거나 비-블로그에서 Categories/Tags expanded일 때만
  const shouldFetch = hasOpened && (onBlogRoute || hasExpandedFilters);
  const { data } = useGetPostsQuery(
    { status: 'published', page: 1, limit: 200 },
    { skip: !shouldFetch }
  );
  const posts = data?.posts ?? [];
  const categories = aggregateCategories(posts);
  const tags = aggregateTags(posts).slice(0, 10);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const isActiveNav = (href: string) => href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/');
    } catch { /* silent */ }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[1040]"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
        onClick={handleClose}
        aria-hidden
      />
      <aside
        className="fixed top-0 left-0 bottom-0 z-[1050] w-[296px] max-w-[85vw] flex flex-col overflow-auto"
        style={{
          background: 'var(--blog-bg)',
          borderRight: '1px solid var(--blog-border)',
          boxShadow: '8px 0 32px rgba(0,0,0,0.4)',
          padding: '20px 18px',
          gap: 22,
          animation: 'blog-drawer-in 240ms ease-out',
        }}
        role="dialog"
        aria-modal
        aria-label="메뉴"
      >
        {/* close + profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-[38px] h-[38px] rounded-full grid place-items-center font-bold text-[14px] text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
            >
              {PROFILE.initials}
            </div>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: 'var(--blog-fg)' }}>{PROFILE.name}</div>
              <div className="text-[11px] mt-px" style={{ color: 'var(--blog-fg-muted)' }}>{PROFILE.role}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg grid place-items-center hover:bg-white/5 transition-colors"
            style={{ background: 'var(--blog-card)', border: '1px solid var(--blog-border)', color: 'var(--blog-fg-muted)' }}
            aria-label="메뉴 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* search trigger */}
        <button
          type="button"
          onClick={() => { handleClose(); openCommandPalette(); }}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-colors"
          style={{ background: 'var(--blog-card)', border: '1px solid var(--blog-border)', color: 'var(--blog-fg-muted)' }}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">전체 검색…</span>
          <span className="blog-kbd">⌘K</span>
        </button>

        {/* nav */}
        <nav className="flex flex-col gap-0.5">
          {publicMenuItems.map((n) => {
            const active = isActiveNav(n.href);
            return (
              <Link
                key={n.id}
                to={n.href}
                className="px-3 py-2.5 rounded-md text-[14px] transition-colors"
                style={{
                  background: active ? 'var(--blog-accent-soft)' : 'transparent',
                  color: active ? 'var(--blog-accent)' : 'var(--blog-fg)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Categories + Tags — blog route는 expand, non-blog는 collapsed details (lazy fetch trigger) */}
        {onBlogRoute ? (
          <>
            {posts.length > 0 && <CategoriesSection categories={categories} activeCat={activeCat} setParam={setParam} navigate={navigate} onBlogRoute />}
            {tags.length > 0 && <TagsSection tags={tags} activeTag={activeTag} setParam={setParam} navigate={navigate} onBlogRoute />}
          </>
        ) : (
          <details
            onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) setHasExpandedFilters(true); }}
            className="px-1"
          >
            <summary
              className="flex items-center justify-between cursor-pointer select-none h-9 px-2 rounded-md"
              style={{ listStyle: 'none', color: 'var(--blog-fg-muted)' }}
            >
              <span className="blog-uppercase-label text-[10px]">Categories · Tags</span>
              <span className="blog-mono text-[11px]" style={{ color: 'var(--blog-fg-subtle)' }}>▾</span>
            </summary>
            <div className="pt-3 flex flex-col gap-5">
              {posts.length === 0 ? (
                <div className="text-[12px] px-2" style={{ color: 'var(--blog-fg-subtle)' }}>불러오는 중…</div>
              ) : (
                <>
                  <CategoriesSection categories={categories} activeCat={activeCat} setParam={setParam} navigate={navigate} onBlogRoute={false} />
                  <TagsSection tags={tags} activeTag={activeTag} setParam={setParam} navigate={navigate} onBlogRoute={false} />
                </>
              )}
            </div>
          </details>
        )}

        <div className="flex-1" />

        {/* User menu (인라인 expanded — DESIGN_RESPONSE_R3.md §5) */}
        <div className="pt-3" style={{ borderTop: '1px solid var(--blog-border)' }}>
          {user ? (
            <div className="flex flex-col">
              <div className="px-2 pb-2.5 mb-1" style={{ borderBottom: '1px solid var(--blog-border)' }}>
                <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--blog-fg)' }}>{user.name}</div>
                <div className="blog-mono text-[11px] mt-0.5 truncate" style={{ color: 'var(--blog-fg-subtle)' }}>{user.email}</div>
              </div>
              <Link
                to={ROUTES.DASHBOARD}
                className="flex items-center gap-2.5 px-2 py-2 text-[13px] rounded-md hover:bg-[var(--blog-accent-soft)] transition-colors"
                style={{ color: 'var(--blog-fg)' }}
              >
                <LayoutDashboard className="w-3.5 h-3.5" style={{ color: 'var(--blog-fg-muted)' }} />
                <span>관리자 대시보드</span>
              </Link>
              <Link
                to={ROUTES.BLOG_CREATE}
                className="flex items-center gap-2.5 px-2 py-2 text-[13px] rounded-md hover:bg-[var(--blog-accent-soft)] transition-colors"
                style={{ color: 'var(--blog-fg)' }}
              >
                <PenSquare className="w-3.5 h-3.5" style={{ color: 'var(--blog-fg-muted)' }} />
                <span>새 글 작성</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex items-center gap-2.5 px-2 py-2 text-[13px] rounded-md hover:bg-[var(--blog-accent-soft)] transition-colors"
                style={{ color: 'var(--blog-heart)', borderTop: '1px solid var(--blog-border)' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-[13px] inline-flex items-center gap-1.5" style={{ color: 'var(--blog-fg-muted)' }}>
              로그인 →
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
