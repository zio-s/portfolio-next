import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './layout.css';

/**
 * 네비게이션 아이템 인터페이스
 */
interface NavItem {
  /** 고유 식별자 */
  id: string;
  /** 표시될 텍스트 */
  label: string;
  /** 라우트 경로 */
  path: string;
  /** 아이콘 (SVG path 또는 컴포넌트) */
  icon: React.ReactNode;
  /** 배지 숫자 (선택사항) */
  badge?: number;
}

/**
 * 네비게이션 섹션 인터페이스
 */
interface NavSection {
  /** 섹션 제목 */
  title: string;
  /** 섹션 내 아이템 목록 */
  items: NavItem[];
}

/**
 * 사이드바 Props 인터페이스
 */
interface SidebarProps {
  /** 접기/펴기 상태 */
  isCollapsed?: boolean;
  /** 접기/펴기 토글 핸들러 */
  onToggle?: () => void;
  /** 모바일에서 열림 상태 */
  isMobileOpen?: boolean;
  /** 모바일에서 닫기 핸들러 */
  onMobileClose?: () => void;
  /** 네비게이션 섹션 목록 */
  sections?: NavSection[];
}

/**
 * 기본 네비게이션 섹션 데이터
 */
const defaultSections: NavSection[] = [
  {
    title: '대시보드',
    items: [
      {
        id: 'home',
        label: '홈',
        path: '/',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        ),
      },
      {
        id: 'analytics',
        label: '분석',
        path: '/analytics',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: '콘텐츠',
    items: [
      {
        id: 'projects',
        label: '프로젝트',
        path: '/projects',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
          </svg>
        ),
        badge: 5,
      },
      {
        id: 'blog',
        label: '블로그',
        path: '/blog',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        ),
        badge: 12,
      },
      {
        id: 'media',
        label: '미디어',
        path: '/media',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: '설정',
    items: [
      {
        id: 'users',
        label: '사용자',
        path: '/users',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
        ),
      },
      {
        id: 'settings',
        label: '설정',
        path: '/settings',
        icon: (
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        ),
      },
    ],
  },
];

/**
 * 사이드바 컴포넌트
 *
 * 네비게이션 메뉴를 제공하며 다음 기능을 지원합니다:
 * - 데스크톱: 접기/펴기 토글
 * - 모바일: 햄버거 메뉴로 열기/닫기
 * - 현재 페이지 하이라이트
 * - 배지 표시 (알림, 개수 등)
 */
export const Sidebar = ({
  isCollapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
  sections = defaultSections,
}: SidebarProps) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  /**
   * 화면 크기 변경 감지 (모바일/데스크톱)
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  /**
   * 네비게이션 아이템 클릭 핸들러
   * 모바일에서는 사이드바를 닫습니다.
   */
  const handleNavClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  /**
   * 경로가 현재 활성화된 경로인지 확인
   */
  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isMobile && isMobileOpen && (
        <div
          className="sidebar-overlay sidebar-overlay--visible"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''} ${
          isMobile && isMobileOpen ? 'sidebar--mobile-open' : ''
        }`}
      >
        {/* 토글 버튼 (데스크톱만) */}
        {!isMobile && onToggle && (
          <div className="sidebar__toggle">
            <button
              className="sidebar__toggle-button"
              onClick={onToggle}
              aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            >
              <svg
                className="sidebar__toggle-icon"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
          </div>
        )}

        {/* 네비게이션 콘텐츠 */}
        <div className="sidebar__content">
          <nav className="sidebar__nav">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="sidebar__nav-section">
                {/* 섹션 제목 */}
                {section.title && (
                  <div className="sidebar__nav-section-title" aria-label={section.title}>
                    {section.title}
                  </div>
                )}

                {/* 네비게이션 아이템 */}
                {section.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar__nav-item ${
                        isActive || isActivePath(item.path) ? 'sidebar__nav-item--active' : ''
                      }`
                    }
                    onClick={handleNavClick}
                    aria-label={item.label}
                  >
                    {/* 아이콘 */}
                    <span className="sidebar__nav-icon">{item.icon}</span>

                    {/* 텍스트 */}
                    <span className="sidebar__nav-text">{item.label}</span>

                    {/* 배지 */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="sidebar__nav-badge" aria-label={`${item.badge}개의 알림`}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
