import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './layout.css';

/**
 * 인증 레이아웃 Props 인터페이스
 */
interface AuthLayoutProps {
  /** 메인 콘텐츠 (로그인/회원가입 폼 등) */
  children: ReactNode;
  /** 페이지 제목 */
  title: string;
  /** 부제목 (선택사항) */
  subtitle?: string;
  /** 로고 텍스트 */
  logoText?: string;
  /** 푸터 텍스트 */
  footerText?: string;
  /** 푸터 링크 텍스트 */
  footerLinkText?: string;
  /** 푸터 링크 경로 */
  footerLinkPath?: string;
}

/**
 * 인증 레이아웃 컴포넌트
 *
 * 로그인, 회원가입 등 인증 관련 페이지를 위한 레이아웃입니다.
 *
 * 특징:
 * - 중앙 정렬된 카드 스타일 디자인
 * - 그라데이션 배경
 * - 로고 및 타이틀 영역
 * - 폼 콘텐츠 영역
 * - 하단 링크 영역 (예: "계정이 있으신가요? 로그인")
 * - 반응형 디자인
 */
export const AuthLayout = ({
  children,
  title,
  subtitle,
  logoText = 'Portfolio CMS',
  footerText,
  footerLinkText,
  footerLinkPath,
}: AuthLayoutProps) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        {/* 헤더 영역 */}
        <div className="auth-layout__header">
          {/* 로고 */}
          <div className="auth-layout__logo">
            <svg
              className="auth-layout__logo-icon"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-4.28-1.05-7.5-5.28-7.5-9.5V8.3l7.5-3.75L19.5 8.3V11c0 4.22-3.22 8.45-7.5 9.5z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="auth-layout__logo-text">{logoText}</span>
          </div>

          {/* 타이틀 */}
          <h1 className="auth-layout__title">{title}</h1>

          {/* 부제목 (선택사항) */}
          {subtitle && (
            <p className="auth-layout__subtitle">{subtitle}</p>
          )}
        </div>

        {/* 메인 콘텐츠 (폼 등) */}
        <div className="auth-layout__content">
          {children}
        </div>

        {/* 푸터 영역 (링크) */}
        {footerText && footerLinkText && footerLinkPath && (
          <div className="auth-layout__footer">
            <p className="auth-layout__footer-text">
              {footerText}{' '}
              <Link
                to={footerLinkPath}
                className="auth-layout__footer-link"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 로그인 레이아웃 래퍼
 * 로그인 페이지에 최적화된 기본 설정을 제공합니다.
 */
export const LoginLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthLayout
      title="로그인"
      subtitle="계정에 로그인하여 시작하세요"
      footerText="계정이 없으신가요?"
      footerLinkText="회원가입"
      footerLinkPath="/register"
    >
      {children}
    </AuthLayout>
  );
};

/**
 * 회원가입 레이아웃 래퍼
 * 회원가입 페이지에 최적화된 기본 설정을 제공합니다.
 */
export const RegisterLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthLayout
      title="회원가입"
      subtitle="새 계정을 만들어 시작하세요"
      footerText="이미 계정이 있으신가요?"
      footerLinkText="로그인"
      footerLinkPath="/login"
    >
      {children}
    </AuthLayout>
  );
};

/**
 * 비밀번호 찾기 레이아웃 래퍼
 */
export const ForgotPasswordLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthLayout
      title="비밀번호 찾기"
      subtitle="이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다"
      footerText="계정이 기억나셨나요?"
      footerLinkText="로그인"
      footerLinkPath="/login"
    >
      {children}
    </AuthLayout>
  );
};

/**
 * 비밀번호 재설정 레이아웃 래퍼
 */
export const ResetPasswordLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthLayout
      title="비밀번호 재설정"
      subtitle="새로운 비밀번호를 입력하세요"
      footerText="비밀번호가 기억나셨나요?"
      footerLinkText="로그인"
      footerLinkPath="/login"
    >
      {children}
    </AuthLayout>
  );
};

export default AuthLayout;
