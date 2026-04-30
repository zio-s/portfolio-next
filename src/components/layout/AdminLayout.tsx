'use client';

/**
 * Admin Layout — 블로그 디자인 시스템과 통일
 * 참조: claudedocs/ADMIN_REDESIGN_SPEC.md §2.2
 *
 * - 좌측 240px AdminSidebar (lg+)
 * - 모바일: 햄버거 → drawer
 * - 헤더: 56px 미니멀 (PublicHeader/UserMenu 톤 차용)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="admin-root flex">
      <AdminSidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar — 미니멀, 모바일에서만 햄버거 노출 */}
        <header
          className="lg:hidden h-[56px] flex items-center px-4 sticky top-0 z-30"
          style={{
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--blog-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="inline-flex items-center justify-center w-9 h-9 -ml-2 rounded-md hover:bg-white/5"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" style={{ color: 'var(--blog-fg)' }} />
          </button>
          <Link
            to="/dashboard"
            className="ml-2 font-bold text-[15px] tracking-[-0.02em]"
            style={{ color: 'var(--blog-fg)' }}
          >
            semincode<span style={{ color: 'var(--blog-accent)' }}>.</span>
            <span className="ml-2 blog-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--blog-accent)' }}>
              admin
            </span>
          </Link>
        </header>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
