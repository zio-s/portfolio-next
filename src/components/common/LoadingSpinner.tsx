import React from 'react';
import './LoadingSpinner.css';

/**
 * 로딩 스피너 컴포넌트의 Props 인터페이스
 */
export interface LoadingSpinnerProps {
  /** 스피너 크기 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 스피너 색상 */
  color?: 'primary' | 'secondary' | 'white' | 'current';
  /** 전체 화면 모드 */
  fullScreen?: boolean;
  /** 로딩 텍스트 */
  text?: string;
  /** 오버레이 표시 (전체 화면일 때만) */
  overlay?: boolean;
}

/**
 * 공통 로딩 스피너 컴포넌트
 *
 * @example
 * ```tsx
 * // 인라인 스피너
 * <LoadingSpinner size="md" />
 *
 * // 전체 화면 스피너
 * <LoadingSpinner fullScreen text="데이터를 불러오는 중..." />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text,
  overlay = true,
}) => {
  const spinnerClasses = ['spinner', `spinner--${size}`, `spinner--${color}`]
    .filter(Boolean)
    .join(' ');

  const renderSpinner = () => (
    <div className="spinner-container" role="status" aria-live="polite">
      <svg
        className={spinnerClasses}
        viewBox="0 0 50 50"
        aria-hidden="true"
      >
        <circle
          className="spinner__track"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="spinner__circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
      </svg>
      {text && <p className="spinner-text">{text}</p>}
      <span className="sr-only">{text || '로딩 중...'}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`spinner-fullscreen ${overlay ? 'spinner-fullscreen--overlay' : ''}`}
      >
        {renderSpinner()}
      </div>
    );
  }

  return renderSpinner();
};

export default LoadingSpinner;
