/**
 * Admin Layout
 *
 * 관리자 페이지용 레이아웃 (Header + Sidebar 포함)
 */

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAppSelector, selectUser } from '../../store';
import './layout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin 네비게이션 섹션
 */
const adminSections = [
  {
    title: '대시보드',
    items: [
      {
        id: 'dashboard',
        label: '홈',
        path: '/dashboard',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: '콘텐츠 관리',
    items: [
      {
        id: 'admin-projects',
        label: '프로젝트',
        path: '/admin/projects',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
          </svg>
        ),
      },
      {
        id: 'admin-comments',
        label: '댓글',
        path: '/admin/comments',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        ),
      },
      {
        id: 'admin-guestbook',
        label: '방문록',
        path: '/admin/guestbook',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
          </svg>
        ),
      },
    ],
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // localStorage에서 사이드바 상태 불러오기
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Redux Selector 패턴 사용 (Best Practice)
  const user = useAppSelector(selectUser);

  const handleSidebarToggle = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    // localStorage에 상태 저장
    localStorage.setItem('admin-sidebar-collapsed', String(newState));
  };

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <Header
        onMenuToggle={handleMobileMenuToggle}
        user={
          user
            ? {
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                avatar: user.user_metadata?.avatar_url,
              }
            : undefined
        }
        logoText="Portfolio CMS"
      />

      {/* Body */}
      <div className="admin-layout__body">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileSidebarClose}
          sections={adminSections}
        />

        {/* Main Content */}
        <main className={`admin-layout__content ${isSidebarCollapsed ? 'admin-layout__content--collapsed' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
