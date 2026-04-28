'use client';

/**
 * 데스크톱 헤더 우상단 사용자 메뉴 dropdown
 *
 * DESIGN_RESPONSE_R3.md §5
 * - 트리거: 40px 원형 아바타 클릭
 * - 패널: 220px width, top:8px gap, --card bg + --border + shadow
 * - 항목: 변세민 / email · 관리자 대시보드 · 새 글 작성 · (separator) · 로그아웃(heart 색)
 * - hover: --blog-accent-soft bg
 *
 * 모바일에서는 사용 안 함 (MobileDrawer 안 프로필 영역 inline expanded로 대체).
 */

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenSquare, LogOut, ChevronDown } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { ROUTES } from '@/router/routes';

interface UserMenuProps {
  user: { name: string; email: string; avatar?: string };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // 외부 클릭 닫기
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await dispatch(logout()).unwrap();
      navigate('/');
    } catch { /* silent */ }
  };

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="relative ml-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="사용자 메뉴"
        className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
      >
        <div
          className="w-9 h-9 rounded-full grid place-items-center text-[13px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
          title={user.name}
        >
          {initial}
        </div>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform"
          style={{
            color: 'var(--blog-fg-muted)',
            transform: open ? 'rotate(180deg)' : undefined,
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[220px] overflow-hidden"
          style={{
            background: 'var(--blog-card)',
            border: '1px solid var(--blog-border)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,.4)',
            zIndex: 1060,
          }}
        >
          {/* User info */}
          <div className="px-3.5 py-3" style={{ borderBottom: '1px solid var(--blog-border)' }}>
            <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--blog-fg)' }}>
              {user.name}
            </div>
            <div className="blog-mono text-[11px] mt-0.5 truncate" style={{ color: 'var(--blog-fg-subtle)' }}>
              {user.email}
            </div>
          </div>

          {/* Links */}
          <div className="py-1.5">
            <Link
              to={ROUTES.DASHBOARD}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors hover:bg-[var(--blog-accent-soft)]"
              style={{ color: 'var(--blog-fg)' }}
            >
              <LayoutDashboard className="w-3.5 h-3.5" style={{ color: 'var(--blog-fg-muted)' }} />
              <span>관리자 대시보드</span>
            </Link>
            <Link
              to={ROUTES.BLOG_CREATE}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors hover:bg-[var(--blog-accent-soft)]"
              style={{ color: 'var(--blog-fg)' }}
            >
              <PenSquare className="w-3.5 h-3.5" style={{ color: 'var(--blog-fg-muted)' }} />
              <span>새 글 작성</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="py-1.5" style={{ borderTop: '1px solid var(--blog-border)' }}>
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors hover:bg-[var(--blog-accent-soft)]"
              style={{ color: 'var(--blog-heart)' }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
