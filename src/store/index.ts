// Store
export { store, resetAllApiState, type RootState, type AppDispatch } from './store';

// Hooks
export { useAppDispatch, useAppSelector, useRedux } from './hooks';

// Auth Slice
export {
  login,
  register,
  getCurrentUser,
  updateProfile,
  logout,
  clearError as clearAuthError,
  setCredentials,
  clearAuth,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUserRole,
  selectIsAdmin,
} from './slices/authSlice';

// Posts Slice
export {
  fetchPosts,
  fetchPostById,
  fetchPostBySlug,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  clearError as clearPostsError,
  setCurrentPost,
  setFilters,
  clearFilters,
  setPage,
  selectPosts,
  selectCurrentPost,
  selectPostsLoading,
  selectPostsError,
  selectPostsFilters,
  selectPostsPagination,
  selectPostById,
  selectFilteredPosts,
} from './slices/postsSlice';

// Users Slice
export {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  clearError as clearUsersError,
  setCurrentUser,
  selectUsers,
  selectCurrentUser,
  selectUsersLoading,
  selectUsersError,
  selectUserById,
  selectAdminUsers,
  selectRegularUsers,
} from './slices/usersSlice';

// UI Slice
export {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleModal,
  selectSidebarOpen,
  selectTheme,
  selectNotifications,
  selectModalOpen,
  selectModalContent,
  selectUI,
  selectUnreadNotificationsCount,
  selectRecentNotifications,
  selectNotificationsByType,
} from './slices/uiSlice';

// Posts API (RTK Query)
export {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikeMutation,
  useIncrementViewMutation,
} from './api/postsApi';

// Types
export type {
  User,
  AuthState,
  Post,
  PostsState,
  UsersState,
  UIState,
  Notification,
  ApiResponse,
  ApiError,
  PaginatedResponse,
} from './types';
