# 커스텀 훅 라이브러리

프로덕션 레벨의 타입 안전한 React 커스텀 훅 모음입니다. 외부 의존성 없이 React만을 사용하여 구현되었습니다.

## 목차

- [설치 및 사용](#설치-및-사용)
- [훅 목록](#훅-목록)
  - [useDebounce](#usedebounce)
  - [useLocalStorage](#uselocalstorage)
  - [useAsync](#useasync)
  - [usePagination](#usepagination)
  - [useForm](#useform)
  - [useClickOutside](#useclickoutside)
  - [useMediaQuery](#usemediaquery)
  - [useOnMount](#useonmount)
  - [useToggle](#usetoggle)
  - [useCopyToClipboard](#usecopytoclipboard)
- [타입 안전성](#타입-안전성)
- [브라우저 호환성](#브라우저-호환성)

## 설치 및 사용

모든 훅은 `src/hooks` 디렉토리에서 개별적으로 또는 index 파일을 통해 가져올 수 있습니다.

```tsx
// 개별 import
import { useDebounce } from '@/hooks/useDebounce';

// index를 통한 import (권장)
import { useDebounce, useLocalStorage, useAsync } from '@/hooks';
```

## 훅 목록

### useDebounce

값 변경을 지연시켜 검색 입력 등 비용이 많이 드는 작업을 최적화합니다.

**사용 예시:**

```tsx
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // API 호출은 사용자가 500ms 동안 타이핑을 멈춘 후에만 실행
      fetchSearchResults(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="검색어를 입력하세요..."
    />
  );
}
```

**매개변수:**
- `value: T` - 디바운싱할 값
- `delay?: number` - 지연 시간(밀리초, 기본값: 500)

**반환값:**
- `T` - 디바운싱된 값

---

### useLocalStorage

localStorage와 동기화되는 상태를 관리합니다. 타입 안전성과 자동 JSON 직렬화를 제공합니다.

**사용 예시:**

```tsx
import { useLocalStorage } from '@/hooks';

type Theme = 'light' | 'dark';

function ThemeSelector() {
  const [theme, setTheme, removeTheme] = useLocalStorage<Theme>('theme', 'light');

  return (
    <div>
      <p>현재 테마: {theme}</p>
      <button onClick={() => setTheme('dark')}>다크 모드</button>
      <button onClick={() => setTheme('light')}>라이트 모드</button>
      <button onClick={removeTheme}>초기화</button>
    </div>
  );
}
```

**특징:**
- 다른 탭/윈도우와 자동 동기화
- TypeScript 제네릭으로 타입 안전성 보장
- SSR 환경 대응
- 함수형 업데이트 지원

**매개변수:**
- `key: string` - localStorage 키
- `initialValue: T` - 초기값

**반환값:**
- `[value: T, setValue: Function, removeValue: Function]`

---

### useAsync

비동기 작업의 로딩, 에러, 데이터 상태를 자동으로 관리합니다.

**사용 예시:**

```tsx
import { useAsync } from '@/hooks';

interface User {
  id: string;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: string }) {
  const fetchUser = async () => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('사용자를 불러올 수 없습니다');
    return response.json() as Promise<User>;
  };

  const { isLoading, error, data, execute, reset } = useAsync(fetchUser, true);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={execute}>새로고침</button>
      <button onClick={reset}>초기화</button>
    </div>
  );
}
```

**매개변수:**
- `asyncFunction: () => Promise<T>` - 실행할 비동기 함수
- `immediate?: boolean` - 마운트 시 즉시 실행 여부 (기본값: true)

**반환값:**
- `isLoading: boolean` - 로딩 중 여부
- `error: Error | null` - 에러 객체
- `data: T | null` - 결과 데이터
- `execute: () => Promise<void>` - 수동 실행 함수
- `reset: () => void` - 상태 초기화 함수

---

### usePagination

페이지네이션 로직을 관리합니다.

**사용 예시:**

```tsx
import { usePagination } from '@/hooks';

interface User {
  id: string;
  name: string;
}

function UserList({ users }: { users: User[] }) {
  const pagination = usePagination(users.length, 10);

  const visibleUsers = users.slice(
    pagination.startIndex,
    pagination.endIndex + 1
  );

  return (
    <div>
      <ul>
        {visibleUsers.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>

      <div className="pagination">
        <button
          onClick={pagination.goToFirstPage}
          disabled={!pagination.hasPreviousPage}
        >
          처음
        </button>
        <button
          onClick={pagination.previousPage}
          disabled={!pagination.hasPreviousPage}
        >
          이전
        </button>

        <span>
          {pagination.currentPage} / {pagination.totalPages}
        </span>

        <button
          onClick={pagination.nextPage}
          disabled={!pagination.hasNextPage}
        >
          다음
        </button>
        <button
          onClick={pagination.goToLastPage}
          disabled={!pagination.hasNextPage}
        >
          마지막
        </button>

        <select
          value={pagination.pageSize}
          onChange={(e) => pagination.setPageSize(Number(e.target.value))}
        >
          <option value={10}>10개씩</option>
          <option value={20}>20개씩</option>
          <option value={50}>50개씩</option>
        </select>
      </div>
    </div>
  );
}
```

**매개변수:**
- `totalItems: number` - 전체 항목 수
- `initialPageSize?: number` - 페이지당 항목 수 (기본값: 10)
- `initialPage?: number` - 초기 페이지 번호 (기본값: 1)

**반환값:** `PaginationState` 객체
- `currentPage: number` - 현재 페이지 번호
- `pageSize: number` - 페이지당 항목 수
- `totalPages: number` - 전체 페이지 수
- `hasNextPage: boolean` - 다음 페이지 존재 여부
- `hasPreviousPage: boolean` - 이전 페이지 존재 여부
- `startIndex: number` - 현재 페이지 시작 인덱스
- `endIndex: number` - 현재 페이지 끝 인덱스
- `nextPage: () => void` - 다음 페이지로 이동
- `previousPage: () => void` - 이전 페이지로 이동
- `goToPage: (page: number) => void` - 특정 페이지로 이동
- `goToFirstPage: () => void` - 첫 페이지로 이동
- `goToLastPage: () => void` - 마지막 페이지로 이동
- `setPageSize: (size: number) => void` - 페이지 크기 변경

---

### useForm

폼 상태 관리 및 유효성 검사를 처리합니다.

**사용 예시:**

```tsx
import { useForm } from '@/hooks';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

function LoginPage() {
  const form = useForm<LoginForm>(
    {
      email: '',
      password: '',
      rememberMe: false,
    },
    {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
      password: {
        required: true,
        minLength: 8,
        validate: (value) => {
          if (!/[A-Z]/.test(value)) {
            return '대문자를 포함해야 합니다';
          }
          if (!/[0-9]/.test(value)) {
            return '숫자를 포함해야 합니다';
          }
          return true;
        },
      },
    }
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    console.log('제출된 값:', values);
    // API 호출 등...
  });

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>이메일</label>
        <input
          name="email"
          type="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
        {form.touched.email && form.errors.email && (
          <span className="error">{form.errors.email}</span>
        )}
      </div>

      <div>
        <label>비밀번호</label>
        <input
          name="password"
          type="password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
        {form.touched.password && form.errors.password && (
          <span className="error">{form.errors.password}</span>
        )}
      </div>

      <div>
        <label>
          <input
            name="rememberMe"
            type="checkbox"
            checked={form.values.rememberMe}
            onChange={form.handleChange}
          />
          로그인 상태 유지
        </label>
      </div>

      <button type="submit" disabled={!form.isValid || form.isSubmitting}>
        {form.isSubmitting ? '로그인 중...' : '로그인'}
      </button>

      <button type="button" onClick={form.resetForm}>
        초기화
      </button>
    </form>
  );
}
```

**유효성 검사 규칙:**
- `required?: boolean` - 필수 입력
- `minLength?: number` - 최소 길이
- `maxLength?: number` - 최대 길이
- `pattern?: RegExp` - 정규식 패턴
- `validate?: (value) => boolean | string` - 커스텀 유효성 검사

**매개변수:**
- `initialValues: T` - 초기 폼 값
- `validationRules?: ValidationRules<T>` - 유효성 검사 규칙

**반환값:** `UseFormReturn<T>` 객체
- `values: T` - 폼 데이터 값들
- `errors: FormErrors<T>` - 필드별 에러 메시지
- `touched: object` - 터치된 필드들
- `isValid: boolean` - 폼 유효성 여부
- `isSubmitting: boolean` - 제출 중 여부
- `handleChange` - 입력 변경 핸들러
- `handleBlur` - blur 핸들러
- `handleSubmit` - 폼 제출 핸들러
- `setFieldValue` - 특정 필드 값 설정
- `setFieldError` - 특정 필드 에러 설정
- `setFieldTouched` - 특정 필드를 터치됨으로 표시
- `resetForm` - 폼 초기화

---

### useClickOutside

요소 외부 클릭을 감지합니다. 드롭다운, 모달, 팝업을 닫을 때 유용합니다.

**사용 예시:**

```tsx
import { useRef, useState } from 'react';
import { useClickOutside } from '@/hooks';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>
        메뉴 {isOpen ? '닫기' : '열기'}
      </button>

      {isOpen && (
        <ul className="dropdown-menu">
          <li>항목 1</li>
          <li>항목 2</li>
          <li>항목 3</li>
        </ul>
      )}
    </div>
  );
}
```

**매개변수:**
- `ref: RefObject<T>` - 대상 요소의 ref
- `handler: (event) => void` - 외부 클릭 시 실행할 콜백
- `enabled?: boolean` - 훅 활성화 여부 (기본값: true)

---

### useMediaQuery

CSS 미디어 쿼리의 매칭 여부를 추적합니다.

**사용 예시:**

```tsx
import {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersDarkMode,
} from '@/hooks';

function ResponsiveComponent() {
  // 기본 사용법
  const isLargeScreen = useMediaQuery('(min-width: 1200px)');

  // 헬퍼 훅 사용
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const prefersDark = usePrefersDarkMode();

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
      {isLargeScreen && <p>대형 화면입니다</p>}
      {prefersDark && <p>다크 모드 선호</p>}
    </div>
  );
}
```

**헬퍼 훅:**
- `useIsMobile()` - 모바일 (max-width: 768px)
- `useIsTablet()` - 태블릿 (769px ~ 1024px)
- `useIsDesktop()` - 데스크톱 (min-width: 1025px)
- `usePrefersDarkMode()` - 다크 모드 선호
- `usePrefersReducedMotion()` - 모션 감소 선호 (접근성)

**매개변수:**
- `query: string` - CSS 미디어 쿼리 문자열

**반환값:**
- `boolean` - 미디어 쿼리 매칭 여부

---

### useOnMount

컴포넌트 마운트 시 한 번만 콜백을 실행합니다.

**사용 예시:**

```tsx
import { useOnMount } from '@/hooks';

function AnalyticsComponent() {
  useOnMount(() => {
    console.log('컴포넌트가 마운트되었습니다');

    // 초기 데이터 로드
    fetchInitialData();

    // 분석 이벤트 전송
    analytics.trackPageView();

    // 클린업 함수 반환 가능
    return () => {
      console.log('컴포넌트가 언마운트되었습니다');
    };
  });

  return <div>컨텐츠</div>;
}
```

**매개변수:**
- `callback: () => void | (() => void)` - 마운트 시 실행할 함수

---

### useToggle

Boolean 상태를 쉽게 토글하고 관리합니다.

**사용 예시:**

```tsx
import { useToggle } from '@/hooks';

function Modal() {
  const [isOpen, { toggle, setTrue, setFalse, setValue }] = useToggle(false);

  return (
    <div>
      <button onClick={toggle}>토글</button>
      <button onClick={setTrue}>열기</button>
      <button onClick={setFalse}>닫기</button>
      <button onClick={() => setValue(true)}>값으로 설정</button>

      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>모달 제목</h2>
            <p>모달 내용</p>
            <button onClick={setFalse}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**매개변수:**
- `initialValue?: boolean` - 초기값 (기본값: false)

**반환값:**
- `[value: boolean, actions: object]`
  - `toggle: () => void` - 값 토글
  - `setTrue: () => void` - true로 설정
  - `setFalse: () => void` - false로 설정
  - `setValue: (value: boolean) => void` - 특정 값으로 설정

---

### useCopyToClipboard

클립보드에 텍스트를 복사하고 상태를 추적합니다.

**사용 예시:**

```tsx
import { useCopyToClipboard } from '@/hooks';

function ShareButton({ url }: { url: string }) {
  const [copyState, copyToClipboard] = useCopyToClipboard();

  const handleCopy = async () => {
    await copyToClipboard(url);

    // 2초 후 성공 메시지 제거
    setTimeout(() => {
      // 상태는 자동으로 관리됨
    }, 2000);
  };

  return (
    <div>
      <button onClick={handleCopy}>
        {copyState.success ? '✓ 복사됨!' : '📋 URL 복사'}
      </button>

      {copyState.error && (
        <span className="error">
          복사 실패: {copyState.error.message}
        </span>
      )}

      {copyState.value && (
        <span className="copied-value">
          복사된 값: {copyState.value}
        </span>
      )}
    </div>
  );
}
```

**특징:**
- 최신 Clipboard API 사용
- 구형 브라우저를 위한 fallback 지원
- SSR 환경 대응

**반환값:**
- `[state: CopyState, copyFn: (text: string) => Promise<void>]`
  - `state.value: string | null` - 복사된 값
  - `state.success: boolean` - 복사 성공 여부
  - `state.error: Error | null` - 에러 객체

---

## 타입 안전성

모든 훅은 TypeScript로 작성되었으며 완전한 타입 지원을 제공합니다.

```tsx
// 제네릭을 사용한 타입 안전성
const [user, setUser] = useLocalStorage<User>('user', defaultUser);

// 인터페이스를 사용한 폼 타입
interface SignupForm {
  username: string;
  email: string;
  password: string;
}
const form = useForm<SignupForm>(initialValues, validationRules);

// 자동 타입 추론
const debouncedValue = useDebounce(searchTerm, 300); // string 타입으로 추론
```

## 브라우저 호환성

모든 훅은 다음 환경을 지원합니다:

- **최신 브라우저**: Chrome, Firefox, Safari, Edge (최신 2개 버전)
- **모바일 브라우저**: iOS Safari, Chrome Mobile
- **SSR**: Next.js, Gatsby 등 서버 사이드 렌더링 환경
- **구형 브라우저**: fallback 코드 포함 (가능한 경우)

**특별 고려사항:**
- `useLocalStorage`: SSR에서 안전하게 동작
- `useMediaQuery`: SSR에서 false 반환
- `useCopyToClipboard`: Clipboard API 미지원 브라우저를 위한 fallback 포함

## 성능 최적화

모든 훅은 성능을 고려하여 설계되었습니다:

- **메모이제이션**: `useCallback`, `useMemo` 사용으로 불필요한 재렌더링 방지
- **이벤트 정리**: 모든 이벤트 리스너는 컴포넌트 언마운트 시 제거
- **타이머 정리**: setTimeout, setInterval은 항상 정리
- **조건부 실행**: 필요한 경우에만 로직 실행

## 에러 처리

모든 훅은 프로덕션 환경을 고려한 에러 처리를 포함합니다:

```tsx
// localStorage 에러 처리 예시
try {
  const item = window.localStorage.getItem(key);
  return item ? JSON.parse(item) : initialValue;
} catch (error) {
  console.error(`localStorage에서 키 "${key}"를 읽는 중 오류 발생:`, error);
  return initialValue;
}
```

## 라이선스

이 프로젝트의 라이선스를 따릅니다.

## 기여

버그 리포트 및 기능 제안은 이슈로 등록해주세요.

---

**작성일**: 2025-10-27
**버전**: 1.0.0
**의존성**: React 16.8+ (Hooks 지원)
