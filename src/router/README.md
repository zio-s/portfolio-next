# 라우터 시스템 문서

React Router v6를 사용한 Portfolio CMS의 라우팅 시스템입니다.

## 📁 파일 구조

```
router/
├── AppRouter.tsx          # 메인 라우터 컴포넌트
├── ProtectedRoute.tsx     # 인증 필요 라우트 보호
├── PublicRoute.tsx        # 비로그인 전용 라우트
├── routes.ts              # 라우트 경로 상수
├── index.ts               # 모듈 진입점
└── README.md              # 이 문서
```

## 🚀 사용 방법

### 1. 기본 설정

`App.tsx`에서 라우터를 불러와 사용합니다:

```tsx
import { AppRouter } from './router';
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}
```

### 2. 라우트 경로 사용

경로 상수를 import하여 사용합니다:

```tsx
import { ROUTES, routeHelpers } from './router';

// 정적 경로 사용
<Link to={ROUTES.LOGIN}>로그인</Link>
<Link to={ROUTES.DASHBOARD}>대시보드</Link>

// 동적 경로 사용
<Link to={routeHelpers.postDetail(123)}>게시글 상세</Link>
<Link to={routeHelpers.postEdit(123)}>게시글 수정</Link>
```

### 3. 프로그래밍 방식 네비게이션

```tsx
import { useNavigate } from 'react-router-dom';
import { ROUTES } from './router';

function MyComponent() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 로그인 후 대시보드로 이동
    navigate(ROUTES.DASHBOARD);
  };

  const handleBack = () => {
    // 이전 페이지로 이동
    navigate(-1);
  };
}
```

## 🛡️ 라우트 보호

### ProtectedRoute (보호된 라우트)

로그인이 필요한 페이지를 보호합니다.

**동작 방식:**
1. 사용자 인증 상태 확인
2. 로딩 중이면 스피너 표시
3. 인증되지 않았으면 로그인 페이지로 리다이렉트
4. 인증되었으면 페이지 렌더링

**사용 예:**

```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

### PublicRoute (공개 라우트)

로그인하지 않은 사용자 전용 페이지입니다.

**동작 방식:**
1. 이미 로그인한 경우 대시보드로 리다이렉트
2. 로그인하지 않은 경우 페이지 렌더링

**사용 예:**

```tsx
<Route path="/login" element={
  <PublicRoute>
    <LoginPage />
  </PublicRoute>
} />

<Route path="/register" element={
  <PublicRoute redirectTo="/profile">
    <RegisterPage />
  </PublicRoute>
} />
```

## 📋 라우트 목록

### 공개 라우트 (인증 불필요)

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 랜딩/홈 페이지 |
| `/login` | LoginPage | 로그인 페이지 |
| `/register` | RegisterPage | 회원가입 페이지 |

### 보호된 라우트 (로그인 필요)

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/dashboard` | DashboardPage | 대시보드 메인 |
| `/posts` | PostsPage | 게시글 목록 |
| `/posts/create` | PostCreatePage | 게시글 작성 |
| `/posts/:id` | PostDetailPage | 게시글 상세 |
| `/posts/:id/edit` | PostEditPage | 게시글 수정 |
| `/users` | UsersPage | 사용자 목록 (관리자) |
| `/users/:id` | UserDetailPage | 사용자 상세 (관리자) |
| `/profile` | ProfilePage | 내 프로필 |

### 에러 라우트

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/404` | NotFoundPage | 404 에러 페이지 |
| `*` | → `/404` | 정의되지 않은 모든 경로 |

## 🔧 코드 분할 (Code Splitting)

모든 페이지는 React의 `lazy`를 사용하여 동적으로 로드됩니다.

**장점:**
- 초기 번들 크기 감소
- 페이지별 필요할 때만 로드
- 전체 앱 성능 향상

**구현:**

```tsx
// AppRouter.tsx
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));

// Suspense로 감싸서 로딩 처리
<Suspense fallback={<PageLoadingFallback />}>
  <Routes>
    {/* 라우트 정의 */}
  </Routes>
</Suspense>
```

## 🔐 인증 흐름

### 로그인 시나리오

1. 사용자가 `/login`에 접근
2. `PublicRoute`가 인증 상태 확인
3. 인증되지 않음 → LoginPage 렌더링
4. 로그인 성공 → Redux store 업데이트
5. 대시보드로 리다이렉트

### 보호된 페이지 접근 시나리오

1. 사용자가 `/dashboard`에 접근
2. `ProtectedRoute`가 인증 상태 확인
3. 인증되지 않음 → `/login`으로 리다이렉트 (현재 경로 저장)
4. 로그인 성공 → 원래 요청한 페이지로 이동

### 로그아웃 시나리오

1. 사용자가 로그아웃 버튼 클릭
2. Redux action `logout()` dispatch
3. localStorage에서 토큰 제거
4. Redux store 초기화
5. 홈 페이지로 리다이렉트

## 📝 새 라우트 추가하기

### 1. 페이지 컴포넌트 생성

`src/pages/NewPage.tsx`:

```tsx
const NewPage = () => {
  return (
    <div>
      <h1>새 페이지</h1>
    </div>
  );
};

export default NewPage;
```

### 2. 라우트 경로 추가

`routes.ts`에 경로 추가:

```tsx
export const PROTECTED_ROUTES = {
  // 기존 라우트...
  NEW_PAGE: '/new-page',
} as const;
```

### 3. AppRouter에 라우트 등록

`AppRouter.tsx`:

```tsx
// 1. lazy import 추가
const NewPage = lazy(() => import('../pages/NewPage'));

// 2. Routes에 추가
<Route
  path={ROUTES.NEW_PAGE}
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

## 🎯 라우트 헬퍼 함수

동적 경로를 위한 헬퍼 함수들:

```tsx
// routes.ts
export const routeHelpers = {
  postDetail: (id: string | number) => `/posts/${id}`,
  postEdit: (id: string | number) => `/posts/${id}/edit`,
  userDetail: (id: string | number) => `/users/${id}`,
};

// 사용 예
<Link to={routeHelpers.postDetail(123)}>게시글 보기</Link>
```

## 🔄 리다이렉트 처리

### 로그인 후 원래 페이지로 돌아가기

`ProtectedRoute`는 리다이렉트 시 현재 경로를 `location.state`에 저장:

```tsx
// ProtectedRoute.tsx
<Navigate
  to={PUBLIC_ROUTES.LOGIN}
  state={{ from: location }}
  replace
/>

// LoginPage.tsx에서 사용
const location = useLocation();
const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
navigate(from);
```

## 🛠️ 고급 기능

### 권한 기반 라우팅

관리자 전용 페이지 보호:

```tsx
// 페이지 컴포넌트 내에서 권한 확인
const UsersPage = () => {
  const user = useAppSelector(selectUser);

  if (user?.role !== 'admin') {
    return <div>접근 권한 없음</div>;
  }

  return <div>{/* 관리자 페이지 */}</div>;
};
```

### 조건부 라우트

```tsx
{user?.role === 'admin' && (
  <Route path="/admin" element={<AdminPage />} />
)}
```

## 📊 성능 최적화

1. **코드 분할**: `lazy()` 사용으로 필요한 페이지만 로드
2. **프리로딩**: 중요한 페이지는 미리 로드
3. **메모이제이션**: 라우트 컴포넌트 최적화

```tsx
// 프리로딩 예시
const preloadDashboard = () => {
  import('../pages/DashboardPage');
};

<Link
  to={ROUTES.DASHBOARD}
  onMouseEnter={preloadDashboard}
>
  대시보드
</Link>
```

## 🐛 문제 해결

### 페이지가 로드되지 않음

1. 페이지 컴포넌트가 `export default`로 내보내지는지 확인
2. `AppRouter.tsx`에서 `lazy()` import가 올바른지 확인
3. 라우트 경로가 정확한지 확인

### 인증 리다이렉트가 작동하지 않음

1. Redux store가 올바르게 설정되었는지 확인
2. `localStorage`에 토큰이 저장되는지 확인
3. `getCurrentUser` action이 올바르게 동작하는지 확인

### 404 페이지가 표시되지 않음

1. 와일드카드 라우트(`*`)가 마지막에 있는지 확인
2. `/404` 라우트가 정의되었는지 확인

## 📚 참고 자료

- [React Router v6 공식 문서](https://reactrouter.com/)
- [React.lazy 문서](https://react.dev/reference/react/lazy)
- [Redux Toolkit 문서](https://redux-toolkit.js.org/)

## ✅ 체크리스트

라우터 시스템 사용 전 확인사항:

- [ ] Redux store 설정 완료
- [ ] authSlice 구현 완료
- [ ] 모든 페이지 컴포넌트 생성
- [ ] 라우트 경로 상수 정의
- [ ] AppRouter를 App.tsx에서 사용
- [ ] Provider로 Redux store 연결
