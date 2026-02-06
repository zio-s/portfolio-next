/**
 * Common UI Components
 *
 * 재사용 가능한 공통 UI 컴포넌트 모음
 * 모든 컴포넌트는 TypeScript로 작성되었으며, 접근성과 반응형을 지원합니다.
 */

// Button 컴포넌트 (from UI)
export { Button } from '../ui/button';
export type { ButtonProps } from '../ui/button';

// Input 컴포넌트
export { Input } from './Input';
export type { InputProps } from './Input';

// Card 컴포넌트 (from UI)
export { Card, CardHeader, CardContent as CardBody, CardFooter } from '../ui/card';
export type { CardProps } from '../ui/card';

// LoadingSpinner 컴포넌트
export { LoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

// Table 컴포넌트
export { Table } from './Table';
export type { TableProps, TableColumn } from './Table';

// Pagination 컴포넌트
export { Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';

// SearchBar 컴포넌트
export { SearchBar } from './SearchBar';
export type { SearchBarProps } from './SearchBar';

// Dropdown 컴포넌트
export { Dropdown } from './Dropdown';
export type { DropdownProps, DropdownItem } from './Dropdown';

// Badge 컴포넌트 (from UI)
export { Badge } from '../ui/badge';
export type { BadgeProps } from '../ui/badge';

// EmptyState 컴포넌트
export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// ErrorBoundary 컴포넌트
export { ErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps } from './ErrorBoundary';
