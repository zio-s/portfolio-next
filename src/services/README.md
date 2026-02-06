# API 서비스 레이어

프론트엔드 포트폴리오 CMS의 모든 API 통신을 담당하는 서비스 레이어입니다.

## 📁 파일 구조

```
services/
├── api.ts              # Axios 인스턴스 및 기본 설정
├── authService.ts      # 인증 관련 API (로그인, 회원가입 등)
├── postsService.ts     # 게시글 CRUD API
├── usersService.ts     # 사용자 관리 API
├── uploadService.ts    # 파일 업로드 API
├── types.ts            # TypeScript 타입 정의
├── endpoints.ts        # API 엔드포인트 상수
├── errorHandler.ts     # 중앙 집중식 에러 처리
├── index.ts            # 서비스 진입점
└── README.md           # 이 문서
```

## 🚀 주요 기능

### 1. JWT 토큰 자동 관리
- 모든 요청에 JWT 토큰 자동 주입
- 토큰 만료 시 자동 갱신
- 401 에러 발생 시 자동 재시도

### 2. 중앙 집중식 에러 처리
- AxiosError를 사용자 친화적인 한글 메시지로 변환
- 유효성 검사 에러 포맷팅
- 에러 로깅 및 추적

### 3. 타입 안전성
- 모든 API 요청/응답에 TypeScript 타입 적용
- 자동완성 및 타입 체크 지원

### 4. 파일 업로드
- 진행률 표시 지원
- 요청 취소 기능
- Base64 이미지 업로드

## 📖 사용 방법

### 환경 설정

`.env` 파일에 API Base URL을 설정합니다:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 기본 사용 예제

#### 1. 로그인

```typescript
import { authService } from '@/services';

try {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'password123',
    rememberMe: true
  });

  console.log('로그인 성공:', response.user.name);
  // 토큰은 자동으로 저장됨
} catch (error) {
  console.error('로그인 실패:', error.message);
}
```

#### 2. 게시글 조회

```typescript
import { postsService } from '@/services';

try {
  const result = await postsService.getPosts({
    page: 1,
    limit: 20,
    status: PostStatus.PUBLISHED,
    sortBy: 'createdAt',
    order: 'desc'
  });

  console.log('게시글 목록:', result.items);
  console.log('전체 페이지:', result.meta.totalPages);
} catch (error) {
  console.error('조회 실패:', error.message);
}
```

#### 3. 게시글 생성

```typescript
import { postsService, PostStatus } from '@/services';

try {
  const newPost = await postsService.createPost({
    title: '새 글 제목',
    content: '게시글 내용...',
    excerpt: '요약',
    status: PostStatus.DRAFT,
    categoryId: '1',
    tagIds: ['tag1', 'tag2']
  });

  console.log('게시글 생성:', newPost.id);
} catch (error) {
  console.error('생성 실패:', error.message);
}
```

#### 4. 이미지 업로드 (진행률 표시)

```typescript
import { uploadService } from '@/services';

const handleImageUpload = async (file: File) => {
  try {
    const uploadedImage = await uploadService.uploadImage(file, {
      onProgress: (progress) => {
        console.log(`업로드 진행: ${progress}%`);
        setUploadProgress(progress);
      }
    });

    console.log('업로드 완료:', uploadedImage.url);
    setImageUrl(uploadedImage.url);
  } catch (error) {
    console.error('업로드 실패:', error.message);
  }
};
```

#### 5. 요청 취소

```typescript
import { uploadService } from '@/services';

const abortController = uploadService.createCancelToken();

// 업로드 시작
uploadService.uploadImage(file, {
  signal: abortController.signal,
  onProgress: (progress) => console.log(progress)
}).catch((error) => {
  if (error.name === 'CanceledError') {
    console.log('업로드 취소됨');
  }
});

// 업로드 취소
abortController.abort();
```

### React 컴포넌트에서 사용

#### useEffect로 데이터 가져오기

```typescript
import { useEffect, useState } from 'react';
import { postsService, type Post } from '@/services';

function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const result = await postsService.getPosts({ page: 1, limit: 10 });
        setPosts(result.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

#### 폼 제출 처리

```typescript
import { useState } from 'react';
import { authService } from '@/services';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await authService.login({ email, password });
      // 로그인 성공 - 페이지 리다이렉트
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">로그인</button>
    </form>
  );
}
```

### Redux Toolkit과 함께 사용

```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { postsService, type Post } from '@/services';

// 비동기 액션 생성
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page, limit }: { page: number; limit: number }) => {
    const result = await postsService.getPosts({ page, limit });
    return result;
  }
);

// 슬라이스 정의
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [] as Post[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '알 수 없는 오류';
      });
  },
});

export default postsSlice.reducer;
```

## 🔧 API 서비스 목록

### authService

| 메서드 | 설명 | 파라미터 | 반환 |
|--------|------|----------|------|
| `login()` | 로그인 | `LoginRequest` | `AuthResponse` |
| `register()` | 회원가입 | `RegisterRequest` | `AuthResponse` |
| `logout()` | 로그아웃 | - | `void` |
| `getCurrentUser()` | 현재 사용자 조회 | - | `User` |
| `updateProfile()` | 프로필 수정 | `UpdateProfileRequest` | `User` |
| `changePassword()` | 비밀번호 변경 | `ChangePasswordRequest` | `void` |
| `forgotPassword()` | 비밀번호 재설정 요청 | `ForgotPasswordRequest` | `void` |
| `resetPassword()` | 비밀번호 재설정 | `ResetPasswordRequest` | `void` |
| `isAuthenticated()` | 로그인 상태 확인 | - | `boolean` |

### postsService

| 메서드 | 설명 | 파라미터 | 반환 |
|--------|------|----------|------|
| `getPosts()` | 게시글 목록 조회 | `PostListParams?` | `PaginatedResponse<Post>` |
| `getPost()` | 게시글 상세 조회 | `id` | `Post` |
| `createPost()` | 게시글 생성 | `CreatePostRequest` | `Post` |
| `updatePost()` | 게시글 수정 | `id`, `UpdatePostRequest` | `Post` |
| `deletePost()` | 게시글 삭제 | `id` | `void` |
| `publishPost()` | 게시글 발행 | `id` | `Post` |
| `unpublishPost()` | 게시글 비공개 | `id` | `Post` |
| `searchPosts()` | 게시글 검색 | `query`, `params?` | `PaginatedResponse<Post>` |
| `getPostsByCategory()` | 카테고리별 조회 | `category`, `params?` | `PaginatedResponse<Post>` |
| `getPostsByTag()` | 태그별 조회 | `tag`, `params?` | `PaginatedResponse<Post>` |

### usersService

| 메서드 | 설명 | 파라미터 | 반환 |
|--------|------|----------|------|
| `getUsers()` | 사용자 목록 조회 | `PaginationParams?` | `PaginatedResponse<User>` |
| `getUser()` | 사용자 상세 조회 | `id` | `User` |
| `createUser()` | 사용자 생성 | `CreateUserRequest` | `User` |
| `updateUser()` | 사용자 수정 | `id`, `UpdateUserRequest` | `User` |
| `deleteUser()` | 사용자 삭제 | `id` | `void` |
| `searchUsers()` | 사용자 검색 | `query`, `params?` | `PaginatedResponse<User>` |
| `getUsersByRole()` | 역할별 조회 | `role`, `params?` | `PaginatedResponse<User>` |
| `toggleUserStatus()` | 활성화/비활성화 | `id`, `isActive` | `User` |

### uploadService

| 메서드 | 설명 | 파라미터 | 반환 |
|--------|------|----------|------|
| `uploadImage()` | 이미지 업로드 | `file`, `options?` | `UploadedFile` |
| `uploadDocument()` | 문서 업로드 | `file`, `options?` | `UploadedFile` |
| `uploadGeneralFile()` | 일반 파일 업로드 | `file`, `options?` | `UploadedFile` |
| `uploadMultipleFiles()` | 여러 파일 업로드 | `files`, `options?` | `UploadedFile[]` |
| `uploadBase64Image()` | Base64 이미지 업로드 | `base64`, `filename`, `options?` | `UploadedFile` |
| `formatFileSize()` | 파일 크기 포맷팅 | `bytes` | `string` |
| `createCancelToken()` | 취소 토큰 생성 | - | `AbortController` |

## 🛡️ 에러 처리

### 에러 타입

모든 API 에러는 `ApiErrorClass`로 변환되며, 다음 속성을 가집니다:

```typescript
interface ApiErrorClass extends Error {
  message: string;          // 에러 메시지 (한글)
  statusCode: number;       // HTTP 상태 코드
  errorCode?: string;       // 서버 에러 코드
  errors?: ValidationError[]; // 유효성 검사 에러
  originalError?: AxiosError; // 원본 Axios 에러
}
```

### 에러 처리 예제

```typescript
import { authService, ApiErrorClass, isValidationError } from '@/services';

try {
  await authService.login({ email, password });
} catch (error) {
  if (error instanceof ApiErrorClass) {
    // HTTP 상태 코드별 처리
    if (error.statusCode === 401) {
      alert('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else if (error.statusCode === 422) {
      // 유효성 검사 에러
      const messages = error.getValidationMessages();
      console.log(messages);
    } else {
      alert(error.message);
    }
  }
}
```

### 에러 헬퍼 함수

```typescript
import {
  getErrorMessage,
  isRetryableError,
  isAuthError,
  isValidationError,
  formatValidationErrors
} from '@/services';

// 에러 메시지 추출
const message = getErrorMessage(error);

// 재시도 가능 여부
if (isRetryableError(error)) {
  // 네트워크 에러 또는 5xx 서버 에러
}

// 인증 에러 여부
if (isAuthError(error)) {
  // 401 또는 403 에러
}

// 유효성 검사 에러 여부
if (isValidationError(error)) {
  const messages = formatValidationErrors(error);
}
```

## 🔑 토큰 관리

### 토큰 저장 위치

토큰은 `localStorage`에 저장됩니다:
- `access_token`: 액세스 토큰
- `refresh_token`: 리프레시 토큰

### 토큰 관리 함수

```typescript
import { getAccessToken, setTokens, clearTokens } from '@/services';

// 토큰 가져오기
const token = getAccessToken();

// 토큰 저장
setTokens('new_access_token', 'new_refresh_token');

// 토큰 제거
clearTokens();
```

### 자동 토큰 갱신

Axios 인터셉터가 자동으로 토큰 갱신을 처리합니다:

1. API 요청 시 401 에러 발생
2. 리프레시 토큰으로 새 액세스 토큰 요청
3. 새 토큰으로 원래 요청 재시도
4. 토큰 갱신 실패 시 로그인 페이지로 리다이렉트

## 📝 타입 정의

### 주요 타입

```typescript
// 사용자
interface User {
  id: string | number;
  email: string;
  name: string;
  role: UserRole;
  // ...
}

// 게시글
interface Post {
  id: string | number;
  title: string;
  content: string;
  status: PostStatus;
  // ...
}

// 페이지네이션
interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// API 응답
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

자세한 타입 정의는 `types.ts` 파일을 참조하세요.

## 🧪 테스트

### Jest 테스트 예제

```typescript
import { authService } from '@/services';

describe('authService', () => {
  it('로그인 성공', async () => {
    const response = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(response.accessToken).toBeDefined();
    expect(response.user.email).toBe('test@example.com');
  });

  it('잘못된 비밀번호로 로그인 실패', async () => {
    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong_password'
      })
    ).rejects.toThrow('이메일 또는 비밀번호가 올바르지 않습니다.');
  });
});
```

## 🔍 디버깅

개발 환경에서는 모든 API 요청/응답이 콘솔에 자동으로 로깅됩니다:

```
📤 API 요청: { method: 'POST', url: '/auth/login', data: {...} }
📥 API 응답: { status: 200, data: {...} }
🚨 API 에러: { 메시지: '...', 상태 코드: 401, ... }
```

프로덕션 환경에서는 에러 추적 서비스(Sentry, LogRocket 등)로 전송하도록 설정할 수 있습니다.

## 📚 참고 자료

- [Axios 공식 문서](https://axios-http.com/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [React Query](https://tanstack.com/query/latest) - 서버 상태 관리 라이브러리 (선택사항)

## 🤝 기여

API 서비스 레이어 개선에 기여하려면:

1. 새로운 서비스 파일 추가 시 `index.ts`에 export 추가
2. 모든 타입 정의는 `types.ts`에 추가
3. 엔드포인트 상수는 `endpoints.ts`에 추가
4. 한글 주석 및 JSDoc 작성 필수
