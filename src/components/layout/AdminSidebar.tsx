'use client';

/**
 * AdminSidebar — 블로그 디자인 시스템과 통일된 관리자 사이드바
 *
 * 참조: claudedocs/ADMIN_REDESIGN_SPEC.md §2.1
 * 톤: Linear / Vercel Dashboard 절제된 미니멀 다크
 *
 * - 240px 폭 (현재 Sidebar 유사)
 * - mono uppercase 섹션 라벨
 * - active row: --blog-accent-soft + accent + 좌측 2px border
 * - 하단 사용자 영역 (정적 프로필)
 */

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  FileText,
  MessageSquare,
  BookOpen,
  User,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector, selectUser } from '../../store';
import { logout } from '../../store/slices/authSlice';

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'Dashboard',
    items: [
      { id: 'home', label: 'Home', path: '/dashboard', icon: <Home /> },
    ],
  },
  {
    title: 'Content',
    items: [
      { id: 'projects', label: 'Projects', path: '/admin/projects', icon: <FolderOpen /> },
      { id: 'posts',    label: 'Posts',    path: '/admin/posts',    icon: <FileText /> },
      { id: 'comments', label: 'Comments', path: '/admin/comments', icon: <MessageSquare /> },
      { id: 'guestbook', label: 'Guestbook', path: '/admin/guestbook', icon: <BookOpen /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile', path: '/profile', icon: <User /> },
      { id: 'view-site', label: 'View Site', path: '/', icon: <ExternalLink />, external: true },
    ],
  },
];

export function AdminSidebar({ isMobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  // ESC로 모바일 drawer 닫기
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onMobileClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileOpen, onMobileClose]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/');
    } catch { /* silent */ }
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'A';
  const userEmail = user?.email ?? '';

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="h-[60px] flex items-center px-4" style={{ borderBottom: '1px solid var(--blog-border)' }}>
        <NavLink to="/dashboard" className="font-bold text-[15px] tracking-[-0.02em]" style={{ color: 'var(--blog-fg)' }}>
          semincode<span style={{ color: 'var(--blog-accent)' }}>.</span>
          <span className="ml-2 blog-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--blog-accent)' }}>
            admin
          </span>
        </NavLink>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden ml-auto inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/5"
            aria-label="메뉴 닫기"
          >
            <X className="w-4 h-4" style={{ color: 'var(--blog-fg-muted)' }} />
          </button>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto blog-scrollbar-hide py-2">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="admin-sidebar-section">
              <span className="blog-uppercase-label text-[10px]">{section.title}</span>
            </div>
            {section.items.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onMobileClose}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer noopener' : undefined}
                className="admin-sidebar-row"
                data-active={isActive(item.path) && !item.external}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.external && <ExternalLink className="w-3 h-3 ml-auto opacity-50" />}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--blog-border)' }}>
        <div className="flex items-center gap-2.5 px-1">
          <div
            className="w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
          >
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] truncate" style={{ color: 'var(--blog-fg)' }}>
              admin
            </div>
            <div className="blog-mono text-[10.5px] truncate" style={{ color: 'var(--blog-fg-subtle)' }}>
              {userEmail || 'not signed in'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="로그아웃"
            className="admin-action-icon"
            data-tone="danger"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 모바일 백드롭 */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[1040] lg:hidden"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={onMobileClose}
          aria-hidden
        />
      )}
      {/* Desktop sidebar */}
      <aside className="admin-sidebar hidden lg:flex shrink-0">
        {sidebarContent}
      </aside>
      {/* Mobile drawer */}
      {isMobileOpen && (
        <aside
          className="admin-sidebar fixed top-0 left-0 bottom-0 z-[1050] flex lg:hidden"
          style={{ animation: 'blog-drawer-in 240ms ease-out', boxShadow: '8px 0 32px rgba(0,0,0,0.4)' }}
          role="dialog"
          aria-modal
          aria-label="관리자 메뉴"
        >
          {sidebarContent}
        </aside>
      )}
    </>
  );
}
