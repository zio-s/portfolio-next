/**
 * Mobile Sidebar Component
 *
 * 모바일에서 오른쪽에서 슬라이드되는 인터랙티브 사이드바
 * - Admin과 Public 모드 지원
 * - 부드러운 애니메이션
 * - 사용자 프로필, 메뉴, 설정, 로그아웃
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Home, Folder, MessageSquare, BookOpen, Settings, LogOut, User } from 'lucide-react';
import type { HeaderMode, MenuItem as HeaderMenuItem } from './Header';

interface MobileSidebarProps {
  /** 헤더 모드 (admin | public) */
  mode?: HeaderMode;
  /** 사용자 정보 */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** 로그아웃 핸들러 */
  onLogout?: () => void;
  /** Public 모드 메뉴 아이템 */
  publicMenuItems?: HeaderMenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const adminMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '홈',
    icon: <Home className="w-5 h-5" />,
    href: '/dashboard',
  },
  {
    id: 'projects',
    label: '프로젝트',
    icon: <Folder className="w-5 h-5" />,
    href: '/admin/projects',
  },
  {
    id: 'comments',
    label: '댓글',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '/admin/comments',
  },
  {
    id: 'guestbook',
    label: '방문록',
    icon: <BookOpen className="w-5 h-5" />,
    href: '/admin/guestbook',
  },
];

export function MobileSidebar({
  mode = 'admin',
  user,
  onLogout,
  publicMenuItems = [],
}: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const getUserInitial = () => {
    if (!user) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  const handleItemClick = () => {
    // 메뉴 클릭 시 사이드바 닫기
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout?.();
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // 모드에 따라 메뉴 아이템 선택
  const menuItems: MenuItem[] = mode === 'admin' ? adminMenuItems : (publicMenuItems || []).map(item => ({
    id: item.id,
    label: item.label,
    href: item.href,
    icon: item.icon || <Home className="w-5 h-5" />,
    badge: item.badge,
  }));

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent/10 transition-colors lg:hidden"
        aria-label="메뉴 열기"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[300px] sm:w-[350px] bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with User Profile */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 hover:bg-accent/10 transition-colors"
                aria-label="닫기"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            {/* User Profile Card (Admin 모드이거나 로그인한 경우) */}
            {(mode === 'admin' || user) && user && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full border-2 border-border group-hover:border-accent transition-colors flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{getUserInitial()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-accent transition-colors">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <User className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            )}
          </div>

          <div className="h-px bg-border mx-4" />

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                onClick={handleItemClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:translate-x-1 active:scale-[0.98] ${
                  isActive(item.href)
                    ? 'bg-accent text-white shadow-sm'
                    : 'hover:bg-accent/10'
                }`}
              >
                <span className={`transition-transform duration-200 ${isActive(item.href) ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className="flex-1 font-medium text-sm">
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'bg-accent/10 text-accent'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="h-px bg-border mx-4" />

          {/* Bottom Actions */}
          <div className="p-4 space-y-2">
            {/* Settings (Admin 모드만) */}
            {mode === 'admin' && (
              <Link
                to="/settings"
                onClick={handleItemClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-accent/10 transition-all duration-200 hover:translate-x-1 active:scale-[0.98]"
              >
                <Settings className="w-5 h-5" />
                <span className="flex-1 font-medium text-sm">설정</span>
              </Link>
            )}

            {mode === 'admin' && <div className="h-px bg-border my-2" />}

            {/* Logout (로그인한 경우만) */}
            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-all duration-200 hover:translate-x-1 active:scale-[0.98]"
              >
                <LogOut className="w-5 h-5" />
                <span className="flex-1 font-medium text-sm">로그아웃</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
