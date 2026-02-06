# Redux Store Documentation

Complete Redux Toolkit setup for the Portfolio CMS application.

## Structure

```
store/
├── slices/
│   ├── authSlice.ts      # Authentication state management
│   ├── postsSlice.ts     # Posts/CMS content management
│   ├── usersSlice.ts     # User management
│   └── uiSlice.ts        # UI state (sidebar, theme, notifications)
├── store.ts              # Redux store configuration
├── hooks.ts              # Typed Redux hooks
├── types.ts              # TypeScript types
├── index.ts              # Barrel export
└── README.md             # This file
```

## Setup

### 1. Wrap your app with Redux Provider

```tsx
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
```

### 2. Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_URL=http://localhost:3000/api
```

## Usage Examples

### Authentication

```tsx
import { useAppDispatch, useAppSelector } from './store/hooks';
import { login, logout, selectAuth, selectIsAuthenticated } from './store';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectAuth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleLogin = async (email: string, password: string) => {
    try {
      await dispatch(login({ email, password })).unwrap();
      // Navigate to dashboard on success
    } catch (err) {
      // Handle error
      console.error('Login failed:', err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (isAuthenticated) {
    return <button onClick={handleLogout}>Logout</button>;
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleLogin(
        formData.get('email') as string,
        formData.get('password') as string
      );
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Posts Management

```tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  selectPosts,
  selectPostsLoading,
  setFilters,
} from './store';

function PostsComponent() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectPosts);
  const loading = useAppSelector(selectPostsLoading);

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleCreatePost = async (postData: any) => {
    try {
      await dispatch(createPost(postData)).unwrap();
      alert('Post created successfully!');
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleUpdatePost = async (id: string, updates: any) => {
    try {
      await dispatch(updatePost({ id, updates })).unwrap();
      alert('Post updated successfully!');
    } catch (err) {
      console.error('Failed to update post:', err);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deletePost(id)).unwrap();
        alert('Post deleted successfully!');
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  const handleFilterChange = (status: string) => {
    dispatch(setFilters({ status }));
  };

  if (loading) return <div>Loading posts...</div>;

  return (
    <div>
      <div>
        <button onClick={() => handleFilterChange('published')}>Published</button>
        <button onClick={() => handleFilterChange('draft')}>Drafts</button>
      </div>

      <div>
        {posts.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <button onClick={() => handleUpdatePost(post.id, { status: 'published' })}>
              Publish
            </button>
            <button onClick={() => handleDeletePost(post.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### UI State Management

```tsx
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  toggleSidebar,
  toggleTheme,
  addNotification,
  selectSidebarOpen,
  selectTheme,
  selectNotifications,
} from './store';

function UIComponent() {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const theme = useAppSelector(selectTheme);
  const notifications = useAppSelector(selectNotifications);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    dispatch(addNotification({ type, message }));
  };

  return (
    <div>
      <button onClick={handleToggleSidebar}>
        {sidebarOpen ? 'Close' : 'Open'} Sidebar
      </button>
      <button onClick={handleToggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button>
      <button onClick={() => showNotification('Success!', 'success')}>
        Show Notification
      </button>

      <div className="notifications">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            {notif.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Users Management

```tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  fetchUsers,
  updateUserRole,
  deleteUser,
  selectUsers,
  selectUsersLoading,
} from './store';

function UsersComponent() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const loading = useAppSelector(selectUsersLoading);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRoleChange = async (userId: string, role: 'admin' | 'user') => {
    try {
      await dispatch(updateUserRole({ id: userId, role })).unwrap();
      alert('User role updated!');
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        alert('User deleted!');
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <button onClick={() => handleRoleChange(
                user.id,
                user.role === 'admin' ? 'user' : 'admin'
              )}>
                Toggle Role
              </button>
              <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Features

### Auth Slice
- Login/Register with JWT tokens
- Get current user
- Update profile
- Logout
- Token persistence in localStorage
- Automatic axios header configuration

### Posts Slice
- Fetch posts with pagination
- Create, update, delete posts
- Publish posts
- Filter by status, search, tags
- Fetch by ID or slug
- Post selection for editing

### Users Slice
- Fetch all users
- Create, update, delete users
- Update user roles (admin/user)
- User selection for viewing/editing

### UI Slice
- Sidebar toggle
- Theme switching (light/dark)
- Notifications system
- Modal management
- Theme persistence in localStorage
- Auto theme application to document

## Advanced Usage

### Protected Route Component

```tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { selectIsAuthenticated, selectAuthLoading } from './store';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### Auto-login on App Start

```tsx
// App.tsx
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { getCurrentUser } from './store';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return <div>{/* Your app */}</div>;
}
```

### Custom Selectors

```tsx
// Use memoized selectors for better performance
import { selectPostById, selectFilteredPosts } from './store';

function PostDetail({ postId }: { postId: string }) {
  const post = useAppSelector((state) => selectPostById(postId)(state));

  if (!post) return <div>Post not found</div>;

  return <div>{post.title}</div>;
}
```

## TypeScript Benefits

- Full type safety across all Redux operations
- IntelliSense for all actions and selectors
- Type-safe async thunks with proper error handling
- Strongly typed state structure
- No need for manual type annotations in components

## Best Practices

### 🎯 필수 규칙 (Redux Best Practice)

#### 1. ✅ **항상 Selector 패턴 사용 (필수)**

**❌ 잘못된 방법 (직접 state 접근)**
```tsx
const user = useAppSelector((state) => state.auth.user);
const { loading, error } = useAppSelector((state) => state.auth);
```

**✅ 올바른 방법 (Selector 사용)**
```tsx
import { useAppSelector, selectUser, selectAuthLoading, selectAuthError } from '@/store';

const user = useAppSelector(selectUser);
const loading = useAppSelector(selectAuthLoading);
const error = useAppSelector(selectAuthError);
```

**이유:**
- 타입 안정성 향상 (RootState 타입 사용)
- 리팩토링 용이성 (state 구조 변경 시 selector만 수정)
- Memoization 최적화 가능
- 코드 일관성 유지
- **면접에서 "Redux best practice를 이해하고 있다"는 평가 획득**

#### 2. ✅ **Typed Hooks 사용**

```tsx
import { useAppDispatch, useAppSelector } from '@/store/hooks';
// 또는
import { useAppDispatch, useAppSelector } from '@/store';
```

#### 3. ✅ **Selector 작성 규칙**

**기본 Selector (RootState 타입 필수)**
```ts
// slices/authSlice.ts
import type { RootState } from '../store';

// ✅ RootState 사용 (올바름)
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

// ❌ 부분 타입 사용 (잘못됨)
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
```

**Derived Selector (계산된 값)**
```ts
export const selectUserRole = (state: RootState) => state.auth.user?.role;
export const selectIsAdmin = (state: RootState) =>
  state.auth.user?.role === UserRole.ADMIN;
```

**Memoized Selector (복잡한 계산)**
```ts
import { createSelector } from '@reduxjs/toolkit';

export const selectFilteredPosts = createSelector(
  [selectPosts, selectPostsFilters],
  (posts, filters) => {
    // 무거운 계산 (캐싱됨)
    return posts.filter(/* ... */);
  }
);
```

#### 4. ✅ **Async Thunk에서 .unwrap() 사용**

```tsx
try {
  await dispatch(login({ email, password })).unwrap();
  // 성공 처리
} catch (err) {
  // 에러 처리
}
```

#### 5. ✅ **에러 클리어**

```tsx
useEffect(() => {
  return () => {
    dispatch(clearError());
  };
}, [dispatch]);
```

### 🔍 코드 리뷰 체크리스트

개발 완료 후 반드시 확인:

- [ ] Selector 패턴 사용 (`selectUser` 등)
- [ ] RootState 타입 사용 (부분 타입 금지)
- [ ] Typed hooks 사용 (`useAppDispatch`, `useAppSelector`)
- [ ] Async thunk에서 `.unwrap()` 사용
- [ ] Slice에서 export, store/index.ts에서 re-export
- [ ] TSDoc 주석 작성
- [ ] 에러 처리 완료

### ❌ 금지 사항

1. **직접 state 접근 금지**
   ```tsx
   ❌ const user = useAppSelector((state) => state.auth.user);
   ✅ const user = useAppSelector(selectUser);
   ```

2. **부분 타입 사용 금지**
   ```ts
   ❌ export const selectUser = (state: { auth: AuthState }) => state.auth.user;
   ✅ export const selectUser = (state: RootState) => state.auth.user;
   ```

3. **Mutation 직접 호출 금지**
   ```tsx
   ❌ dispatch(authSlice.actions.setUser(user));
   ✅ dispatch(setCredentials({ user, token }));
   ```

4. **비동기 로직을 Reducer에 작성 금지**
   ```ts
   ❌ reducers: { async login(state, action) { ... } }
   ✅ createAsyncThunk 사용
   ```

### 📊 RTK Query vs Slice 선택 기준

**RTK Query 사용 (추천)**
- RESTful API CRUD 작업
- 자동 캐싱 필요
- 낙관적 업데이트 (Optimistic Update)
- 데이터 fetching + caching
- 예: `projectsApi`, `commentsApi`, `guestbookApi`

**Slice 사용**
- 클라이언트 사이드 상태
- 인증 상태 (세션 관리)
- UI 상태 (모달, 사이드바)
- 글로벌 설정
- 예: `authSlice`, `uiSlice`

### 🎓 참고 자료

- [Redux Toolkit 공식 문서](https://redux-toolkit.js.org/)
- [RTK Query 가이드](https://redux-toolkit.js.org/rtk-query/overview)
- [Reselect (Memoized Selectors)](https://github.com/reduxjs/reselect)
- [Redux Best Practices](https://redux.js.org/style-guide/style-guide)

### 📈 변경 이력

**2025-11-10: Redux 코딩 규칙 추가**
- ✅ authSlice selector RootState 타입 적용
- ✅ 5개 파일 selector 패턴 마이그레이션
  - CommentItem.tsx
  - CommentForm.tsx
  - MainLayout.tsx
  - AdminLayout.tsx
  - AdminLoginPage.tsx
- ✅ selectUserRole, selectIsAdmin selector 추가
- ✅ Redux 코딩 규칙 문서화

---

**💡 Tip:** Selector 패턴만 제대로 사용해도 면접에서 20점 상승 가능!
