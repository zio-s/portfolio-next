// Redux Store Types

// Import and re-export User type and UserRole enum from services
import type { User as ServiceUser } from '../services/types';
import { UserRole } from '../services/types';

export type User = ServiceUser;
export { UserRole };

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Posts Types
export interface Post {
  id: string; // UUID
  title: string;
  content: string;
  excerpt: string;
  slug?: string;
  status: 'draft' | 'published' | 'archived';
  authorId?: string | null;
  author_id?: string | null; // Supabase snake_case
  author?: User;
  tags: string[];
  coverImage?: string;
  createdAt: string;
  created_at?: string; // Supabase snake_case
  updatedAt: string;
  updated_at?: string; // Supabase snake_case
  publishedAt?: string;
  published_at?: string; // Supabase snake_case
  // 통계 데이터
  likes_count?: number;
  views_count?: number;
  comments_count?: number;
  // 사용자별 상태
  is_liked?: boolean;
}

export interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: 'draft' | 'published' | 'archived';
    search?: string;
    tag?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Post Comments Types
export interface PostComment {
  id: string; // UUID
  post_id: string; // UUID
  postId?: string; // camelCase alias
  author_name: string;
  authorName?: string; // camelCase alias
  author_email?: string;
  authorEmail?: string; // camelCase alias
  content: string;
  parent_id?: string | null; // UUID for nested comments
  parentId?: string | null; // camelCase alias
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  createdAt?: string; // camelCase alias
  updated_at: string;
  updatedAt?: string; // camelCase alias
  // Nested replies
  replies?: PostComment[];
}

// Users Types
export interface UsersState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

// UI Types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  modalOpen: boolean;
  modalContent: string | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
