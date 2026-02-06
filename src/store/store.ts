import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import usersReducer from './slices/usersSlice';
import uiReducer from './slices/uiSlice';
import recentMenuReducer from './slices/recentMenuSlice';
import { projectsApi } from '../features/portfolio/api/projectsApi';
import { commentsApi } from '../features/comments/api/commentsApi';
import { adminApi } from '../features/admin/api/adminApi';
import { guestbookApi } from '../features/guestbook/api/guestbookApi';
import { postsApi } from './api/postsApi';
import { postCommentsApi } from './api/postCommentsApi';

// Configure Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer,
    ui: uiReducer,
    recentMenu: recentMenuReducer,
    // RTK Query APIs
    [projectsApi.reducerPath]: projectsApi.reducer,
    [commentsApi.reducerPath]: commentsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [guestbookApi.reducerPath]: guestbookApi.reducer,
    [postsApi.reducerPath]: postsApi.reducer,
    [postCommentsApi.reducerPath]: postCommentsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['ui/addNotification'],
        // Ignore these paths in the state
        ignoredPaths: ['ui.notifications'],
      },
      // immutableCheck 경고 임계값 증가 (개발 모드 성능 개선)
      immutableCheck: {
        warnAfter: 128, // 기본값 32ms → 128ms로 증가
      },
    })
      .concat(projectsApi.middleware)
      .concat(commentsApi.middleware)
      .concat(adminApi.middleware)
      .concat(guestbookApi.middleware)
      .concat(postsApi.middleware)
      .concat(postCommentsApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Initialize theme on app start (client-side only)
const initializeTheme = () => {
  if (typeof window === 'undefined') return;

  const theme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

initializeTheme();

// RTK Query 캐시 초기화 유틸리티
export const resetAllApiState = () => {
  store.dispatch(projectsApi.util.resetApiState());
  store.dispatch(commentsApi.util.resetApiState());
  store.dispatch(adminApi.util.resetApiState());
  store.dispatch(guestbookApi.util.resetApiState());
  store.dispatch(postsApi.util.resetApiState());
  store.dispatch(postCommentsApi.util.resetApiState());
  console.log('[Store] All API caches cleared');
};

export default store;
