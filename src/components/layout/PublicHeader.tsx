'use client';

/**
 * Public 사이트 헤더 (블로그 디자인 시스템)
 *
 * DESIGN_RESPONSE.md §3.10
 * - 60px sticky + backdrop-filter: blur(12px) + bg rgba(10,10,15,0.8)
 * - 좌: 로고 `semincode<accent>.</accent>` + 데스크탑 네비
 * - 우: ⌘K 트리거 + 아바타(로그인 시) / 로그인 버튼
 * - 모바일: 햄버거(좌) + 로고(중앙) + ⌘K 아이콘(우)
 * - 햄버거 → 좌측 drawer (네비)
 */

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { openCommandPalette } from '@/features/posts/components/GlobalCommandPalette';
import { PROFILE } from '@/config/profile';
import type { MenuItem } from './Header';

interface PublicHeaderProps {
  user?: { name: string; email: string; avatar?: string };
  publicMenuItems?: MenuItem[];
  logoText?: string;
}

export const PublicHeader = ({ user, publicMenuItems = [], logoText = 'semincode' }: PublicHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 라우트 변경 시 drawer 자동 닫기
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // drawer 열린 동안 body scroll lock
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  // ESC로 drawer 닫기
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  const isActive = (href: string) => href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/');
    } catch { /* silent */ }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-[60px] z-[1020] flex items-center px-4 lg:px-8"
        style={{
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--blog-border)',
        }}
      >
        {/* 모바일 햄버거 */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 -ml-2 mr-1 rounded-md hover:bg-white/5 transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" style={{ color: 'var(--blog-fg)' }} />
        </button>

        {/* 로고 */}
        <Link to="/" className="font-bold text-[16px] tracking-[-0.02em]" style={{ color: 'var(--blog-fg)' }}>
          {logoText}<span style={{ color: 'var(--blog-accent)' }}>.</span>
        </Link>

        {/* 데스크톱 네비 */}
        <nav className="hidden lg:flex items-center gap-6 ml-8 text-[13px]">
          {publicMenuItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="transition-colors"
              style={{
                color: isActive(item.href) ? 'var(--blog-fg)' : 'var(--blog-fg-muted)',
                fontWeight: isActive(item.href) ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* ⌘K 트리거 — 데스크톱 (label) / 모바일 (아이콘만) */}
        <button
          type="button"
          onClick={openCommandPalette}
          className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-colors mr-2"
          style={{
            background: 'var(--blog-card)',
            border: '1px solid var(--blog-border)',
            color: 'var(--blog-fg-muted)',
          }}
          aria-label="검색"
        >
          <Search className="w-3 h-3" />
          <span>검색…</span>
          <span className="blog-kbd">⌘K</span>
        </button>
        <button
          type="button"
          onClick={openCommandPalette}
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/5 transition-colors"
          aria-label="검색"
        >
          <Search className="w-5 h-5" style={{ color: 'var(--blog-fg)' }} />
        </button>

        {/* 데스크톱 — 아바타 또는 프로필 inline */}
        {user ? (
          <div className="hidden lg:flex items-center gap-3 ml-1">
            <div
              className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[12px] hover:text-[var(--blog-fg)] transition-colors"
              style={{ color: 'var(--blog-fg-muted)' }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="hidden lg:inline-block text-[12px] px-2.5 py-1.5"
            style={{ color: 'var(--blog-fg-muted)' }}
          >
            로그인
          </Link>
        )}
      </header>

      {/* === 모바일 drawer === */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[1040]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed top-0 left-0 bottom-0 z-[1050] w-[280px] max-w-[85vw] flex flex-col"
            style={{
              background: 'var(--blog-bg)',
              borderRight: '1px solid var(--blog-border)',
              animation: 'blog-drawer-in 200ms ease-out',
            }}
            role="dialog"
            aria-modal
            aria-label="메뉴"
          >
            <div className="flex items-center justify-between h-[60px] px-4" style={{ borderBottom: '1px solid var(--blog-border)' }}>
              <span className="font-bold text-[16px]" style={{ color: 'var(--blog-fg)' }}>
                {logoText}<span style={{ color: 'var(--blog-accent)' }}>.</span>
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/5"
                aria-label="메뉴 닫기"
              >
                <X className="w-5 h-5" style={{ color: 'var(--blog-fg-muted)' }} />
              </button>
            </div>

            {/* Profile (정적) */}
            <div className="flex items-center gap-3 px-5 py-5">
              <div
                className="w-10 h-10 rounded-full grid place-items-center font-bold text-[15px] text-white"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              >
                {PROFILE.initials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: 'var(--blog-fg)' }}>{PROFILE.name}</div>
                <div className="text-[11.5px]" style={{ color: 'var(--blog-fg-muted)' }}>{PROFILE.role}</div>
              </div>
            </div>

            {/* Search */}
            <button
              type="button"
              onClick={() => { setDrawerOpen(false); openCommandPalette(); }}
              className="mx-5 flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px]"
              style={{
                background: 'var(--blog-card)',
                border: '1px solid var(--blog-border)',
                color: 'var(--blog-fg-muted)',
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">전체 검색…</span>
              <span className="blog-kbd">⌘K</span>
            </button>

            {/* Nav */}
            <nav className="mt-6 flex flex-col">
              {publicMenuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="px-5 py-3 text-[14px] transition-colors"
                  style={{
                    color: isActive(item.href) ? 'var(--blog-accent)' : 'var(--blog-fg)',
                    background: isActive(item.href) ? 'var(--blog-accent-soft)' : 'transparent',
                    fontWeight: isActive(item.href) ? 600 : 400,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Footer (login/logout) */}
            <div className="px-5 py-4" style={{ borderTop: '1px solid var(--blog-border)' }}>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[12px]"
                  style={{ color: 'var(--blog-fg-muted)' }}
                >
                  {user.name} · 로그아웃
                </button>
              ) : (
                <Link to="/login" className="text-[12px]" style={{ color: 'var(--blog-fg-muted)' }}>
                  로그인
                </Link>
              )}
            </div>
          </aside>
          <style>{`@keyframes blog-drawer-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
        </>
      )}
    </>
  );
};
