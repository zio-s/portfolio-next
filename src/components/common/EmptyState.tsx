import React from 'react';
import './EmptyState.css';

/**
 * 빈 상태 컴포넌트의 Props 인터페이스
 */
export interface EmptyStateProps {
  /** 제목 */
  title?: string;
  /** 설명 */
  description?: string;
  /** 아이콘 또는 이미지 */
  icon?: React.ReactNode;
  /** 액션 버튼 */
  action?: React.ReactNode;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 공통 빈 상태 컴포넌트
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="데이터가 없습니다"
 *   description="아직 등록된 항목이 없습니다. 새로운 항목을 추가해보세요."
 *   icon={<EmptyIcon />}
 *   action={<Button>새 항목 추가</Button>}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = '데이터가 없습니다',
  description,
  icon,
  action,
  size = 'md',
}) => {
  const containerClasses = ['empty-state', `empty-state--${size}`]
    .filter(Boolean)
    .join(' ');

  // 기본 아이콘 SVG
  const defaultIcon = (
    <svg
      className="empty-state__default-icon"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path
        d="M32 16v32M16 32h32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {/* 아이콘 */}
      {(icon || defaultIcon) && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon || defaultIcon}
        </div>
      )}

      {/* 내용 */}
      <div className="empty-state__content">
        {title && <h3 className="empty-state__title">{title}</h3>}
        {description && <p className="empty-state__description">{description}</p>}
      </div>

      {/* 액션 */}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
