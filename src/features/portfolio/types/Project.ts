/**
 * Portfolio Project 타입 정의
 *
 * 포트폴리오 프로젝트 관련 모든 타입을 정의합니다.
 * - Project: 메인 프로젝트 엔티티
 * - ProjectFilters: 프로젝트 필터링 옵션
 * - CreateProjectDto: 프로젝트 생성 요청 데이터
 * - UpdateProjectDto: 프로젝트 수정 요청 데이터
 */

/**
 * 프로젝트 카테고리
 */
export type ProjectCategory = 'web' | 'mobile' | 'backend' | 'design' | 'fullstack';

/**
 * 프로젝트 상태
 */
export type ProjectStatus = 'public' | 'private' | 'draft';

/**
 * 프로젝트 통계
 */
export interface ProjectStats {
  views: number;
  likes: number;
  comments: number;
}

/**
 * 프로젝트 메인 엔티티
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown 형식
  thumbnail: string;
  images: string[];
  techStack: string[];
  category: ProjectCategory;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;

  // 프로젝트 상세 정보
  duration: string; // 개발 기간
  teamSize: number; // 팀 규모
  role: string; // 역할
  achievements?: string[]; // 성과
  challenges?: string[]; // 도전 과제
  solutions?: string[]; // 해결 방법

  status: ProjectStatus;
  featured: boolean; // 메인 페이지에 강조 표시
  stats: ProjectStats;
  sortOrder: number; // 정렬 순서
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

/**
 * 프로젝트 필터 옵션
 */
export interface ProjectFilters {
  category?: ProjectCategory;
  techStack?: string[];
  tags?: string[];
  status?: ProjectStatus;
  featured?: boolean;
  search?: string; // 제목, 설명 검색
  page?: number;
  limit?: number;
  sort?: 'default' | 'recent' | 'popular' | 'views' | 'likes';
}

/**
 * 프로젝트 목록 응답
 */
export interface ProjectsResponse {
  items: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 프로젝트 생성 DTO
 */
export interface CreateProjectDto {
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
  images?: string[];
  techStack: string[];
  category: ProjectCategory;
  tags?: string[];
  githubUrl?: string;
  liveUrl?: string;
  duration: string;
  teamSize: number;
  role: string;
  achievements?: string[];
  challenges?: string[];
  solutions?: string[];
  status: ProjectStatus;
  featured?: boolean;
}

/**
 * 프로젝트 수정 DTO
 */
export interface UpdateProjectDto {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  images?: string[];
  techStack?: string[];
  category?: ProjectCategory;
  tags?: string[];
  githubUrl?: string;
  liveUrl?: string;
  duration?: string;
  teamSize?: number;
  role?: string;
  achievements?: string[];
  challenges?: string[];
  solutions?: string[];
  status?: ProjectStatus;
  featured?: boolean;
}

/**
 * 프로젝트 카드에 표시할 요약 정보
 */
export interface ProjectSummary {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  techStack: string[];
  category: ProjectCategory;
  stats: ProjectStats;
  featured: boolean;
  createdAt: string;
}
