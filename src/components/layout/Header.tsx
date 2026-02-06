import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RecentMenuPanel } from './RecentMenuPanel';
import { MobileSidebar } from './MobileSidebar';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import './layout.css';

/**
 * 헤더 모드 타입
 */
export type HeaderMode = 'admin' | 'public';

/**
 * 메뉴 아이템 인터페이스
 */
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
}

/**
 * 헤더 Props 인터페이스
 */
interface HeaderProps {
  /** 헤더 모드 (admin | public) */
  mode?: HeaderMode;
  /** 사이드바 토글 핸들러 (Admin 모드 전용) */
  onMenuToggle?: () => void;
  /** 현재 사용자 정보 */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** 로고 클릭 핸들러 */
  onLogoClick?: () => void;
  /** 로고 텍스트 */
  logoText?: string;
  /** Public 모드 메뉴 아이템 */
  publicMenuItems?: MenuItem[];
}

/**
 * 통합 헤더 컴포넌트
 *
 * Admin과 Public 페이지 모두에서 사용 가능한 범용 헤더
 * - mode props로 동작 제어
 * - Admin: 사이드바, 프로필, 최근방문
 * - Public: 단순 네비게이션
 */
export const Header = ({
  mode = 'admin',
  onMenuToggle,
  user,
  onLogoClick,
  logoText = 'Portfolio CMS',
  publicMenuItems = [],
}: HeaderProps) => {
  // Redux 및 라우터
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // 프로필 드롭다운 열림 상태
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  /**
   * 네비게이션 active 상태 체크
   */
  const isActiveNavItem = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  /**
   * 프로필 드롭다운 토글 핸들러
   */
  const handleProfileToggle = () => {
    setIsProfileOpen((prev) => !prev);
  };

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      // Admin 모드: /admin/login으로, Public 모드: 홈으로
      navigate(mode === 'admin' ? '/admin/login' : '/');
    } catch {
      // Error handled silently
    }
    setIsProfileOpen(false);
  };

  /**
   * 사용자 이름의 첫 글자 추출 (아바타용)
   */
  const getUserInitial = () => {
    if (!user) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  /**
   * 외부 클릭시 프로필 드롭다운 닫기
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header className="header">
      {/* 왼쪽 영역: 메뉴 토글 (Admin) + 로고 */}
      <div className="header__left">
        {/* Admin 모드: 데스크톱 사이드바 토글 버튼 */}
        {mode === 'admin' && onMenuToggle && (
          <button
            className="header__menu-toggle header__menu-toggle--desktop"
            onClick={onMenuToggle}
            aria-label="사이드바 토글"
          >
            <svg
              className="header__menu-toggle-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        {/* 로고 */}
        <Link
          to={mode === 'admin' ? '/admin' : '/'}
          className="header__logo"
          onClick={onLogoClick}
        >
          <svg
            className="header__logo-icon"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-4.28-1.05-7.5-5.28-7.5-9.5V8.3l7.5-3.75L19.5 8.3V11c0 4.22-3.22 8.45-7.5 9.5z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="header__logo-text">{logoText}</span>
        </Link>

        {/* Public 모드: 데스크톱 네비게이션 메뉴 */}
        {mode === 'public' && publicMenuItems.length > 0 && (
          <nav className="header__nav header__nav--desktop">
            {publicMenuItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`header__nav-item ${
                  isActiveNavItem(item.href) ? 'header__nav-item--active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* 오른쪽 영역: 최근 방문 + 프로필 + 모바일 사이드바 */}
      <div className="header__right">
        {/* Admin 모드: 최근 방문 사이드 패널 (Desktop) */}
        {mode === 'admin' && (
          <div className="header__recent-panel--desktop">
            <RecentMenuPanel />
          </div>
        )}

        {/* Admin 모드: 프로필 드롭다운 (Desktop) */}
        {mode === 'admin' && user && (
          <div className="header__profile header__profile--desktop" ref={profileRef}>
            <button
              className="header__profile-button"
              onClick={handleProfileToggle}
              aria-label="사용자 메뉴"
              aria-expanded={isProfileOpen}
            >
              {/* 아바타 */}
              <div className="header__profile-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{getUserInitial()}</span>
                )}
              </div>
              {/* 사용자 이름 (데스크톱만) */}
              <span className="header__profile-name">{user.name}</span>
              {/* 드롭다운 화살표 */}
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{
                  transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            <div
              className={`header__profile-dropdown ${
                isProfileOpen ? 'header__profile-dropdown--open' : ''
              }`}
            >
              {/* 사용자 정보 */}
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {user.email}
                </div>
              </div>

              {/* 메뉴 아이템 */}
              <Link
                to="/profile"
                className="header__profile-dropdown-item"
                onClick={() => setIsProfileOpen(false)}
              >
                <svg className="header__profile-dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span>프로필</span>
              </Link>

              <Link
                to="/settings"
                className="header__profile-dropdown-item"
                onClick={() => setIsProfileOpen(false)}
              >
                <svg className="header__profile-dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                </svg>
                <span>설정</span>
              </Link>

              <div className="header__profile-dropdown-divider" />

              <button
                className="header__profile-dropdown-item header__profile-dropdown-item--danger"
                onClick={handleLogout}
              >
                <svg className="header__profile-dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        )}

        {/* 모바일 사이드바 (Mobile Only) */}
        <MobileSidebar
          mode={mode}
          user={user}
          onLogout={handleLogout}
          publicMenuItems={publicMenuItems}
        />
      </div>
    </header>
  );
};

export default Header;
