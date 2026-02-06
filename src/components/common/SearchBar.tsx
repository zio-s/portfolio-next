import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

/**
 * 검색 바 컴포넌트의 Props 인터페이스
 */
export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /** 검색 값 변경 콜백 */
  onChange?: (value: string) => void;
  /** 디바운스 지연 시간 (ms) */
  debounceDelay?: number;
  /** 검색 제출 콜백 */
  onSearch?: (value: string) => void;
  /** 초기화 버튼 표시 여부 */
  showClearButton?: boolean;
  /** 검색 버튼 표시 여부 */
  showSearchButton?: boolean;
  /** 검색 아이콘 표시 여부 */
  showSearchIcon?: boolean;
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
}

/**
 * 공통 검색 바 컴포넌트 (디바운스 내장)
 *
 * @example
 * ```tsx
 * <SearchBar
 *   placeholder="검색어를 입력하세요"
 *   onChange={handleSearch}
 *   debounceDelay={300}
 *   showClearButton
 * />
 * ```
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  onChange,
  debounceDelay = 300,
  onSearch,
  showClearButton = true,
  showSearchButton = false,
  showSearchIcon = true,
  size = 'md',
  fullWidth = false,
  placeholder = '검색...',
  value: controlledValue,
  defaultValue,
  ...props
}) => {
  const [inputValue, setInputValue] = useState<string>(
    (controlledValue as string) || (defaultValue as string) || ''
  );
  const [isComposing, setIsComposing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isControlled = controlledValue !== undefined;

  // 제어 컴포넌트 업데이트 처리
  useEffect(() => {
    if (isControlled) {
      setInputValue(controlledValue as string);
    }
  }, [controlledValue, isControlled]);

  // 디바운스 처리
  useEffect(() => {
    // IME 입력 중이거나 제어 컴포넌트면 디바운스 처리 안함
    if (isComposing || isControlled) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange?.(inputValue);
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, debounceDelay, onChange, isComposing, isControlled]);

  // 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // 제어 컴포넌트면 즉시 onChange 호출
    if (isControlled) {
      onChange?.(newValue);
    }
  };

  // IME 입력 시작
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // IME 입력 종료
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    const newValue = (e.target as HTMLInputElement).value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  // 초기화 핸들러
  const handleClear = () => {
    setInputValue('');
    onChange?.('');
  };

  // 검색 제출 핸들러
  const handleSearch = () => {
    onSearch?.(inputValue);
  };

  // 키보드 엔터 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleSearch();
    }
  };

  // 클래스명 조합
  const containerClasses = [
    'search-bar',
    `search-bar--${size}`,
    fullWidth && 'search-bar--full-width',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <div className="search-bar__wrapper">
        {/* 검색 아이콘 */}
        {showSearchIcon && (
          <span className="search-bar__icon search-bar__icon--search" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}

        {/* 입력 필드 */}
        <input
          type="search"
          className="search-bar__input"
          value={inputValue}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="검색"
          {...props}
        />

        {/* 초기화 버튼 */}
        {showClearButton && inputValue && (
          <button
            type="button"
            className="search-bar__button search-bar__button--clear"
            onClick={handleClear}
            aria-label="검색어 지우기"
            title="지우기"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* 검색 버튼 */}
        {showSearchButton && (
          <button
            type="button"
            className="search-bar__button search-bar__button--search"
            onClick={handleSearch}
            aria-label="검색"
            title="검색"
          >
            검색
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
