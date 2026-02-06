/**
 * 게시글 서비스
 *
 * 게시글 CRUD(생성, 조회, 수정, 삭제) 및 발행 관리 API를 제공합니다.
 */

import { get, post, put, del } from './api';
import { POST_ENDPOINTS } from './endpoints';
import type {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostListParams,
  PaginatedResponse,
  ApiResponse,
} from './types';

/**
 * 게시글 목록 조회 (페이지네이션)
 *
 * 필터, 정렬, 페이지네이션을 지원하는 게시글 목록을 가져옵니다.
 *
 * @param params - 조회 파라미터 (페이지, 필터, 정렬 등)
 * @returns 페이지네이션된 게시글 목록
 *
 * @example
 * ```ts
 * const result = await postsService.getPosts({
 *   page: 1,
 *   limit: 20,
 *   status: PostStatus.PUBLISHED,
 *   sortBy: 'createdAt',
 *   order: 'desc'
 * });
 * console.log(result.items, result.meta);
 * ```
 */
export async function getPosts(
  params?: PostListParams
): Promise<PaginatedResponse<Post>> {
  const response = await get<ApiResponse<PaginatedResponse<Post>>>(
    POST_ENDPOINTS.LIST,
    { params }
  );
  return response.data;
}

/**
 * 게시글 상세 조회
 *
 * 특정 게시글의 전체 정보를 가져옵니다.
 *
 * @param id - 게시글 ID
 * @returns 게시글 상세 정보
 *
 * @example
 * ```ts
 * const post = await postsService.getPost('123');
 * console.log(post.title, post.content);
 * ```
 */
export async function getPost(id: string | number): Promise<Post> {
  const response = await get<ApiResponse<Post>>(POST_ENDPOINTS.DETAIL(id));
  return response.data;
}

/**
 * 게시글 생성
 *
 * 새로운 게시글을 작성합니다.
 *
 * @param postData - 게시글 작성 정보
 * @returns 생성된 게시글
 *
 * @example
 * ```ts
 * const newPost = await postsService.createPost({
 *   title: '새 글 제목',
 *   content: '게시글 내용...',
 *   excerpt: '요약',
 *   status: PostStatus.DRAFT,
 *   categoryId: '1',
 *   tagIds: ['tag1', 'tag2']
 * });
 * ```
 */
export async function createPost(postData: CreatePostRequest): Promise<Post> {
  const response = await post<ApiResponse<Post>>(POST_ENDPOINTS.CREATE, postData);
  return response.data;
}

/**
 * 게시글 수정
 *
 * 기존 게시글의 정보를 수정합니다.
 *
 * @param id - 게시글 ID
 * @param postData - 수정할 게시글 정보
 * @returns 수정된 게시글
 *
 * @example
 * ```ts
 * const updated = await postsService.updatePost('123', {
 *   title: '수정된 제목',
 *   content: '수정된 내용'
 * });
 * ```
 */
export async function updatePost(
  id: string | number,
  postData: UpdatePostRequest
): Promise<Post> {
  const response = await put<ApiResponse<Post>>(
    POST_ENDPOINTS.UPDATE(id),
    postData
  );
  return response.data;
}

/**
 * 게시글 삭제
 *
 * 게시글을 영구적으로 삭제합니다.
 *
 * @param id - 게시글 ID
 *
 * @example
 * ```ts
 * await postsService.deletePost('123');
 * ```
 */
export async function deletePost(id: string | number): Promise<void> {
  await del<ApiResponse<void>>(POST_ENDPOINTS.DELETE(id));
}

/**
 * 게시글 발행
 *
 * 임시저장 상태의 게시글을 발행합니다.
 *
 * @param id - 게시글 ID
 * @returns 발행된 게시글
 *
 * @example
 * ```ts
 * const published = await postsService.publishPost('123');
 * console.log(published.status); // 'published'
 * ```
 */
export async function publishPost(id: string | number): Promise<Post> {
  const response = await post<ApiResponse<Post>>(POST_ENDPOINTS.PUBLISH(id));
  return response.data;
}

/**
 * 게시글 비공개
 *
 * 발행된 게시글을 비공개 상태로 변경합니다.
 *
 * @param id - 게시글 ID
 * @returns 비공개 처리된 게시글
 *
 * @example
 * ```ts
 * const unpublished = await postsService.unpublishPost('123');
 * console.log(unpublished.status); // 'draft' or 'private'
 * ```
 */
export async function unpublishPost(id: string | number): Promise<Post> {
  const response = await post<ApiResponse<Post>>(POST_ENDPOINTS.UNPUBLISH(id));
  return response.data;
}

/**
 * 게시글 검색
 *
 * 키워드로 게시글을 검색합니다.
 *
 * @param query - 검색어
 * @param params - 추가 검색 파라미터
 * @returns 검색 결과
 *
 * @example
 * ```ts
 * const results = await postsService.searchPosts('React 튜토리얼', {
 *   page: 1,
 *   limit: 10
 * });
 * ```
 */
export async function searchPosts(
  query: string,
  params?: Omit<PostListParams, 'search'>
): Promise<PaginatedResponse<Post>> {
  const response = await get<ApiResponse<PaginatedResponse<Post>>>(
    POST_ENDPOINTS.SEARCH,
    {
      params: {
        ...params,
        q: query,
      },
    }
  );
  return response.data;
}

/**
 * 카테고리별 게시글 조회
 *
 * 특정 카테고리에 속한 게시글 목록을 가져옵니다.
 *
 * @param category - 카테고리 슬러그 또는 ID
 * @param params - 페이지네이션 파라미터
 * @returns 게시글 목록
 *
 * @example
 * ```ts
 * const posts = await postsService.getPostsByCategory('tech', {
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export async function getPostsByCategory(
  category: string,
  params?: PostListParams
): Promise<PaginatedResponse<Post>> {
  const response = await get<ApiResponse<PaginatedResponse<Post>>>(
    POST_ENDPOINTS.BY_CATEGORY(category),
    { params }
  );
  return response.data;
}

/**
 * 태그별 게시글 조회
 *
 * 특정 태그가 지정된 게시글 목록을 가져옵니다.
 *
 * @param tag - 태그 슬러그 또는 ID
 * @param params - 페이지네이션 파라미터
 * @returns 게시글 목록
 *
 * @example
 * ```ts
 * const posts = await postsService.getPostsByTag('javascript', {
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export async function getPostsByTag(
  tag: string,
  params?: PostListParams
): Promise<PaginatedResponse<Post>> {
  const response = await get<ApiResponse<PaginatedResponse<Post>>>(
    POST_ENDPOINTS.BY_TAG(tag),
    { params }
  );
  return response.data;
}

/**
 * 게시글 서비스 객체
 */
const postsService = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
  searchPosts,
  getPostsByCategory,
  getPostsByTag,
};

export default postsService;
