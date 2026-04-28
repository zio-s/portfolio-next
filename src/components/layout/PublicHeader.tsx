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

import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { openCommandPalette } from '@/features/posts/components/GlobalCommandPalette';
import { openMobileDrawer, MobileDrawer } from '@/features/posts/components/MobileDrawer';
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
        {/* 모바일 햄버거 → MobileDrawer */}
        <button
          type="button"
          onClick={openMobileDrawer}
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

      {/* 모바일 drawer (별도 컴포넌트, lazy fetch) */}
      <MobileDrawer publicMenuItems={publicMenuItems} user={user} />
    </>
  );
};
