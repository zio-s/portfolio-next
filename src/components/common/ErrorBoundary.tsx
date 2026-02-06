import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

/**
 * 에러 경계 컴포넌트의 Props 인터페이스
 */
export interface ErrorBoundaryProps {
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 폴백 UI (커스텀) */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** 에러 발생 시 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 에러 리셋 콜백 */
  onReset?: () => void;
}

/**
 * 에러 경계 컴포넌트의 State 인터페이스
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 공통 에러 경계 컴포넌트
 *
 * React 컴포넌트 트리에서 발생하는 JavaScript 에러를 캐치하고
 * 에러 UI를 표시하며 에러를 기록합니다.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h2>에러가 발생했습니다</h2>
 *       <button onClick={reset}>다시 시도</button>
 *     </div>
 *   )}
 *   onError={(error) => console.error(error)}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * 에러가 발생했을 때 state를 업데이트
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 에러 정보를 로깅
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 부모 컴포넌트에 에러 전달
    this.props.onError?.(error, errorInfo);
  }

  /**
   * 에러 상태 리셋
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });

    // 리셋 콜백 호출
    this.props.onReset?.();
  };

  /**
   * 기본 폴백 UI
   */
  renderDefaultFallback(): ReactNode {
    const { error } = this.state;

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary__container">
          {/* 에러 아이콘 */}
          <div className="error-boundary__icon" aria-hidden="true">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
              <path
                d="M32 20v16M32 44h.01"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 에러 내용 */}
          <div className="error-boundary__content">
            <h2 className="error-boundary__title">문제가 발생했습니다</h2>
            <p className="error-boundary__description">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요.
            </p>

            {/* 개발 환경에서만 에러 상세 정보 표시 */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="error-boundary__details">
                <summary className="error-boundary__summary">에러 상세 정보</summary>
                <pre className="error-boundary__error">
                  <code>{error.toString()}</code>
                  {error.stack && (
                    <>
                      {'\n\n'}
                      <code>{error.stack}</code>
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="error-boundary__actions">
            <button
              className="error-boundary__button error-boundary__button--primary"
              onClick={this.resetError}
            >
              다시 시도
            </button>
            <button
              className="error-boundary__button error-boundary__button--secondary"
              onClick={() => window.location.reload()}
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // 커스텀 폴백이 함수인 경우
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }

      // 커스텀 폴백이 ReactNode인 경우
      if (fallback) {
        return fallback;
      }

      // 기본 폴백 UI
      return this.renderDefaultFallback();
    }

    // 정상 렌더링
    return children;
  }
}

export default ErrorBoundary;
