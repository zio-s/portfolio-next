/**
 * API 서비스 타입 정의
 *
 * 모든 API 요청/응답에 사용되는 TypeScript 타입을 정의합니다.
 */

/**
 * 공통 API 응답 래퍼
 */
export interface ApiResponse<T = unknown> {
  /** 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data: T;
  /** 에러 메시지 (실패시) */
  message?: string;
  /** HTTP 상태 코드 */
  statusCode?: number;
}

/**
 * 페이지네이션 정보
 */
export interface PaginationMeta {
  /** 현재 페이지 */
  currentPage: number;
  /** 페이지당 항목 수 */
  perPage: number;
  /** 전체 항목 수 */
  total: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
  /** 이전 페이지 존재 여부 */
  hasPrev: boolean;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  /** 데이터 목록 */
  items: T[];
  /** 페이지네이션 메타 정보 */
  meta: PaginationMeta;
}

/**
 * 페이지네이션 요청 파라미터
 */
export interface PaginationParams {
  /** 페이지 번호 (1부터 시작) */
  page?: number;
  /** 페이지당 항목 수 */
  limit?: number;
  /** 정렬 필드 */
  sortBy?: string;
  /** 정렬 순서 */
  order?: 'asc' | 'desc';
}

/**
 * 검색 파라미터
 */
export interface SearchParams extends PaginationParams {
  /** 검색어 */
  query?: string;
  /** 검색 필드 */
  fields?: string[];
}

// ========== 인증 관련 타입 ==========

/**
 * 로그인 요청
 */
export interface LoginRequest {
  /** 이메일 */
  email: string;
  /** 비밀번호 */
  password: string;
  /** 로그인 상태 유지 */
  rememberMe?: boolean;
}

/**
 * 회원가입 요청
 */
export interface RegisterRequest {
  /** 이메일 */
  email: string;
  /** 비밀번호 */
  password: string;
  /** 비밀번호 확인 */
  passwordConfirm: string;
  /** 사용자 이름 */
  name: string;
  /** 닉네임 */
  nickname?: string;
}

/**
 * 인증 응답 (토큰)
 */
export interface AuthResponse {
  /** 액세스 토큰 */
  accessToken: string;
  /** 리프레시 토큰 */
  refreshToken?: string;
  /** 토큰 타입 */
  tokenType: string;
  /** 만료 시간 (초) */
  expiresIn: number;
  /** 사용자 정보 */
  user: User;
}

/**
 * 비밀번호 재설정 요청
 */
export interface ForgotPasswordRequest {
  /** 이메일 */
  email: string;
}

/**
 * 비밀번호 재설정
 */
export interface ResetPasswordRequest {
  /** 재설정 토큰 */
  token: string;
  /** 새 비밀번호 */
  password: string;
  /** 비밀번호 확인 */
  passwordConfirm: string;
}

// ========== 사용자 관련 타입 ==========

/**
 * 사용자 역할
 */
export enum UserRole {
  /** 관리자 */
  ADMIN = 'admin',
  /** 편집자 */
  EDITOR = 'editor',
  /** 작성자 */
  AUTHOR = 'author',
  /** 일반 사용자 */
  USER = 'user',
}

/**
 * 사용자 정보
 */
export interface User {
  /** 사용자 ID */
  id: string | number;
  /** 이메일 */
  email: string;
  /** 사용자 이름 */
  name: string;
  /** 닉네임 */
  nickname?: string;
  /** 프로필 이미지 URL */
  avatar?: string;
  /** 역할 */
  role: UserRole;
  /** 계정 활성화 상태 */
  isActive: boolean;
  /** 이메일 인증 여부 */
  isEmailVerified: boolean;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
  /** 마지막 로그인 */
  lastLoginAt?: string;
  /** Supabase user metadata */
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

/**
 * 사용자 생성 요청
 */
export interface CreateUserRequest {
  /** 이메일 */
  email: string;
  /** 비밀번호 */
  password: string;
  /** 사용자 이름 */
  name: string;
  /** 닉네임 */
  nickname?: string;
  /** 역할 */
  role?: UserRole;
}

/**
 * 사용자 수정 요청
 */
export interface UpdateUserRequest {
  /** 사용자 이름 */
  name?: string;
  /** 닉네임 */
  nickname?: string;
  /** 프로필 이미지 URL */
  avatar?: string;
  /** 역할 */
  role?: UserRole;
  /** 계정 활성화 상태 */
  isActive?: boolean;
}

/**
 * 프로필 수정 요청
 */
export interface UpdateProfileRequest {
  /** 사용자 이름 */
  name?: string;
  /** 닉네임 */
  nickname?: string;
  /** 프로필 이미지 URL */
  avatar?: string;
}

/**
 * 비밀번호 변경 요청
 */
export interface ChangePasswordRequest {
  /** 현재 비밀번호 */
  currentPassword: string;
  /** 새 비밀번호 */
  newPassword: string;
  /** 새 비밀번호 확인 */
  newPasswordConfirm: string;
}

// ========== 게시글 관련 타입 ==========

/**
 * 게시글 상태
 */
export enum PostStatus {
  /** 임시저장 */
  DRAFT = 'draft',
  /** 발행됨 */
  PUBLISHED = 'published',
  /** 예약 발행 */
  SCHEDULED = 'scheduled',
  /** 비공개 */
  PRIVATE = 'private',
}

/**
 * 게시글
 */
export interface Post {
  /** 게시글 ID */
  id: string | number;
  /** 제목 */
  title: string;
  /** 내용 */
  content: string;
  /** 요약 */
  excerpt?: string;
  /** 썸네일 이미지 URL */
  thumbnail?: string;
  /** 상태 */
  status: PostStatus;
  /** 작성자 */
  author: User;
  /** 카테고리 */
  category?: Category;
  /** 태그 목록 */
  tags?: Tag[];
  /** 조회수 */
  viewCount: number;
  /** 좋아요 수 */
  likeCount: number;
  /** 댓글 수 */
  commentCount: number;
  /** 발행일 */
  publishedAt?: string;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * 게시글 생성 요청
 */
export interface CreatePostRequest {
  /** 제목 */
  title: string;
  /** 내용 */
  content: string;
  /** 요약 */
  excerpt?: string;
  /** 썸네일 이미지 URL */
  thumbnail?: string;
  /** 상태 */
  status?: PostStatus;
  /** 카테고리 ID */
  categoryId?: string | number;
  /** 태그 ID 목록 */
  tagIds?: (string | number)[];
  /** 발행일 (예약 발행시) */
  publishedAt?: string;
}

/**
 * 게시글 수정 요청
 */
export interface UpdatePostRequest {
  /** 제목 */
  title?: string;
  /** 내용 */
  content?: string;
  /** 요약 */
  excerpt?: string;
  /** 썸네일 이미지 URL */
  thumbnail?: string;
  /** 상태 */
  status?: PostStatus;
  /** 카테고리 ID */
  categoryId?: string | number;
  /** 태그 ID 목록 */
  tagIds?: (string | number)[];
  /** 발행일 (예약 발행시) */
  publishedAt?: string;
}

/**
 * 게시글 목록 조회 필터
 */
export interface PostListParams extends PaginationParams {
  /** 상태 필터 */
  status?: PostStatus;
  /** 카테고리 ID */
  categoryId?: string | number;
  /** 태그 ID */
  tagId?: string | number;
  /** 작성자 ID */
  authorId?: string | number;
  /** 검색어 */
  search?: string;
}

// ========== 카테고리 관련 타입 ==========

/**
 * 카테고리
 */
export interface Category {
  /** 카테고리 ID */
  id: string | number;
  /** 이름 */
  name: string;
  /** 슬러그 (URL용) */
  slug: string;
  /** 설명 */
  description?: string;
  /** 부모 카테고리 */
  parent?: Category;
  /** 게시글 수 */
  postCount: number;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * 카테고리 생성 요청
 */
export interface CreateCategoryRequest {
  /** 이름 */
  name: string;
  /** 슬러그 (URL용) */
  slug: string;
  /** 설명 */
  description?: string;
  /** 부모 카테고리 ID */
  parentId?: string | number;
}

/**
 * 카테고리 수정 요청
 */
export interface UpdateCategoryRequest {
  /** 이름 */
  name?: string;
  /** 슬러그 (URL용) */
  slug?: string;
  /** 설명 */
  description?: string;
  /** 부모 카테고리 ID */
  parentId?: string | number;
}

// ========== 태그 관련 타입 ==========

/**
 * 태그
 */
export interface Tag {
  /** 태그 ID */
  id: string | number;
  /** 이름 */
  name: string;
  /** 슬러그 (URL용) */
  slug: string;
  /** 게시글 수 */
  postCount: number;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * 태그 생성 요청
 */
export interface CreateTagRequest {
  /** 이름 */
  name: string;
  /** 슬러그 (URL용) */
  slug: string;
}

/**
 * 태그 수정 요청
 */
export interface UpdateTagRequest {
  /** 이름 */
  name?: string;
  /** 슬러그 (URL용) */
  slug?: string;
}

// ========== 댓글 관련 타입 ==========

/**
 * 댓글
 */
export interface Comment {
  /** 댓글 ID */
  id: string | number;
  /** 내용 */
  content: string;
  /** 작성자 */
  author: User;
  /** 게시글 ID */
  postId: string | number;
  /** 부모 댓글 ID (답글인 경우) */
  parentId?: string | number;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
}

/**
 * 댓글 생성 요청
 */
export interface CreateCommentRequest {
  /** 내용 */
  content: string;
  /** 부모 댓글 ID (답글인 경우) */
  parentId?: string | number;
}

/**
 * 댓글 수정 요청
 */
export interface UpdateCommentRequest {
  /** 내용 */
  content: string;
}

// ========== 파일 업로드 관련 타입 ==========

/**
 * 업로드된 파일 정보
 */
export interface UploadedFile {
  /** 파일 ID */
  id: string | number;
  /** 파일 이름 */
  filename: string;
  /** 원본 파일 이름 */
  originalName: string;
  /** MIME 타입 */
  mimeType: string;
  /** 파일 크기 (바이트) */
  size: number;
  /** 파일 URL */
  url: string;
  /** 썸네일 URL (이미지인 경우) */
  thumbnailUrl?: string;
  /** 업로드일 */
  uploadedAt: string;
}

/**
 * 파일 업로드 진행률 콜백
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * 파일 업로드 옵션
 */
export interface UploadOptions {
  /** 진행률 콜백 */
  onProgress?: UploadProgressCallback;
  /** 요청 취소 토큰 */
  signal?: AbortSignal;
}

// ========== 에러 관련 타입 ==========

/**
 * API 에러 응답
 */
export interface ApiError {
  /** 에러 메시지 */
  message: string;
  /** HTTP 상태 코드 */
  statusCode: number;
  /** 에러 코드 */
  errorCode?: string;
  /** 유효성 검사 에러 */
  errors?: ValidationError[];
}

/**
 * 유효성 검사 에러
 */
export interface ValidationError {
  /** 필드명 */
  field: string;
  /** 에러 메시지 */
  message: string;
}
