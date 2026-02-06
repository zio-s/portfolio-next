import React, { forwardRef } from 'react';
import './Input.css';

/**
 * 입력 필드 컴포넌트의 Props 인터페이스
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 레이블 텍스트 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 입력 필드 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
  /** 왼쪽 아이콘 */
  leftIcon?: React.ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: React.ReactNode;
  /** 필수 입력 표시 */
  required?: boolean;
}

/**
 * 공통 입력 필드 컴포넌트
 *
 * @example
 * ```tsx
 * <Input
 *   label="이메일"
 *   type="email"
 *   placeholder="example@email.com"
 *   error={errors.email}
 *   required
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      required,
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // 고유 ID 생성 (접근성)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // 클래스명 조합
    const wrapperClasses = ['input-wrapper', fullWidth && 'input-wrapper--full-width']
      .filter(Boolean)
      .join(' ');

    const inputGroupClasses = [
      'input-group',
      `input-group--${size}`,
      error && 'input-group--error',
      disabled && 'input-group--disabled',
      leftIcon && 'input-group--with-left-icon',
      rightIcon && 'input-group--with-right-icon',
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = ['input', className].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        {/* 레이블 */}
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {required && <span className="input-label__required" aria-label="필수">*</span>}
          </label>
        )}

        {/* 입력 그룹 */}
        <div className={inputGroupClasses}>
          {/* 왼쪽 아이콘 */}
          {leftIcon && <span className="input-icon input-icon--left">{leftIcon}</span>}

          {/* 입력 필드 */}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />

          {/* 오른쪽 아이콘 */}
          {rightIcon && <span className="input-icon input-icon--right">{rightIcon}</span>}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p id={errorId} className="input-error" role="alert">
            {error}
          </p>
        )}

        {/* 도움말 텍스트 */}
        {!error && helperText && (
          <p id={helperId} className="input-helper">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
