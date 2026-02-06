/**
 * 커스텀 훅 라이브러리
 *
 * 이 파일은 프로젝트에서 사용되는 모든 커스텀 React 훅을 내보냅니다.
 */

// 비동기 작업 처리
export { useAsync } from './useAsync';
export type { AsyncState } from './useAsync';

// 외부 클릭 감지
export { useClickOutside } from './useClickOutside';

// 클립보드 복사
export { useCopyToClipboard } from './useCopyToClipboard';
export type { CopyState } from './useCopyToClipboard';

// 디바운싱
export { useDebounce } from './useDebounce';

// 폼 관리
export { useForm } from './useForm';
export type {
  ValidationRule,
  ValidationRules,
  FormErrors,
  UseFormReturn,
} from './useForm';

// localStorage 동기화
export { useLocalStorage } from './useLocalStorage';

// 미디어 쿼리
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
} from './useMediaQuery';

// 마운트 시 실행
export { useOnMount } from './useOnMount';

// 페이지네이션
export { usePagination } from './usePagination';
export type { PaginationState } from './usePagination';

// Boolean 토글
export { useToggle } from './useToggle';
