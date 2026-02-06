/**
 * Comment 타입 정의
 *
 * 프로젝트 댓글 시스템 관련 타입
 * - Nested comments (대댓글) 지원
 * - 로그인/비로그인 사용자 모두 댓글 작성 가능
 */

/**
 * 댓글 엔티티
 */
export interface Comment {
  id: string;
  projectId: string;
  userId?: string; // 로그인 사용자 (optional)
  authorName: string; // 비로그인 사용자도 댓글 가능
  authorEmail?: string; // 비로그인 사용자 이메일 (optional)
  authorAvatar?: string; // 프로필 이미지
  content: string;
  parentId?: string; // 대댓글인 경우 부모 댓글 ID
  likes: number;
  replies?: Comment[]; // 자식 댓글 (프론트엔드에서 트리 구조로 변환)
  createdAt: string;
  updatedAt: string;
}

/**
 * 댓글 생성 DTO
 */
export interface CreateCommentDto {
  projectId: string;
  content: string;
  parentId?: string; // 대댓글인 경우
  // 로그인 사용자인 경우 userId는 서버에서 자동 추출
  // 비로그인 사용자인 경우 아래 필드 필요
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
}

/**
 * 댓글 수정 DTO
 */
export interface UpdateCommentDto {
  id: string;
  content: string;
}

/**
 * 댓글 목록 응답
 */
export interface CommentsResponse {
  items: Comment[];
  total: number;
}

/**
 * 댓글 트리 아이템 (프론트엔드 렌더링용)
 */
export interface CommentTreeItem extends Comment {
  depth: number; // 댓글 깊이 (0: 최상위, 1: 대댓글, 2: 대대댓글...)
  replies: CommentTreeItem[];
}
