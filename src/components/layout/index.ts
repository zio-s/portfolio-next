/**
 * Layout Components Export
 *
 * 레이아웃 관련 컴포넌트를 내보내는 인덱스 파일입니다.
 *
 * 사용 예시:
 * ```typescript
 * import { MainLayout, AuthLayout, Header, Sidebar, Footer } from '@/components/layout';
 * ```
 */

// 메인 레이아웃
export { MainLayout } from './MainLayout';
export type { default as MainLayoutType } from './MainLayout';

// 인증 레이아웃
export {
  AuthLayout,
  LoginLayout,
  RegisterLayout,
  ForgotPasswordLayout,
  ResetPasswordLayout,
} from './AuthLayout';
export type { default as AuthLayoutType } from './AuthLayout';

// 개별 컴포넌트
export { Header } from './Header';
export type { default as HeaderType } from './Header';

export { Sidebar } from './Sidebar';
export type { default as SidebarType } from './Sidebar';

export { Footer } from './Footer';
export type { default as FooterType } from './Footer';

// 스타일 import (필요시)
import './layout.css';
