/**
 * Posts API - Supabase RTK Query
 *
 * Supabase 기반 블로그 게시글 CRUD 및 좋아요/조회수 관리
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { supabaseBaseQuery, buildSupabaseQuery } from '../../services/supabaseBaseQuery';
import type { Post } from '../types';

// API 버전 - API 구조 변경 시 버전 증가하면 캐시 자동 초기화
const API_VERSION = '2';
const API_VERSION_KEY = 'posts_api_version';
const USER_IDENTIFIER_KEY = 'user_identifier';

// 캐시 버전 체크 및 초기화 (클라이언트 전용)
const checkAndClearCache = () => {
  if (typeof window === 'undefined') return;

  const storedVersion = localStorage.getItem(API_VERSION_KEY);
  if (storedVersion !== API_VERSION) {
    // 버전이 다르면 관련 캐시 초기화
    localStorage.removeItem(USER_IDENTIFIER_KEY);
    localStorage.setItem(API_VERSION_KEY, API_VERSION);
    console.log(`[PostsAPI] Cache cleared. Version updated: ${storedVersion} → ${API_VERSION}`);
  }
};

// 앱 시작 시 캐시 버전 체크 (클라이언트에서만 실행)
if (typeof window !== 'undefined') {
  checkAndClearCache();
}

// 사용자 식별자 생성 (IP 대신 브라우저 fingerprint 사용)
const getUserIdentifier = (): string => {
  if (typeof window === 'undefined') {
    return 'server_' + Date.now();
  }

  let identifier = localStorage.getItem(USER_IDENTIFIER_KEY);
  if (!identifier) {
    identifier = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem(USER_IDENTIFIER_KEY, identifier);
  }
  return identifier;
};

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: supabaseBaseQuery(),
  tagTypes: ['Post', 'PostStats'],
  endpoints: (builder) => ({
    // ========================================
    // 게시글 CRUD
    // ========================================

    /**
     * 게시글 목록 조회 (통계 포함, 페이지네이션 지원)
     */
    getPosts: builder.query<
      { posts: Post[]; totalCount: number; totalPages: number },
      { status?: string; page?: number; limit?: number }
    >({
      async queryFn({ status, page = 1, limit = 10 }, _api, _extraOptions, baseQuery) {
        try {
          // post_stats 뷰에서 조회
          const { data, error } = await baseQuery(
            buildSupabaseQuery.select('post_stats', {
              select: '*',
              filters: status ? { status } : undefined,
            })
          );

          if (error) throw error;

          // items 배열 추출
          let posts = (data as any)?.items || [];
          const totalCount = posts.length;
          const totalPages = Math.ceil(totalCount / limit);

          // 페이지네이션 적용 (클라이언트 사이드)
          const startIndex = (page - 1) * limit;
          posts = posts.slice(startIndex, startIndex + limit);

          if (posts.length === 0) {
            return { data: { posts: [], totalCount, totalPages } };
          }

          // 사용자별 좋아요 상태 확인 - 한 번의 쿼리로 모든 게시글의 좋아요 상태 조회
          const userIdentifier = getUserIdentifier();

          // IN 쿼리로 모든 좋아요 데이터 한 번에 가져오기
          const { data: likeData } = await baseQuery(
            buildSupabaseQuery.select('post_likes', {
              filters: { user_identifier: userIdentifier },
            })
          );

          const likes = (likeData as any)?.items || [];
          const likedPostIds = new Set(likes.map((like: any) => like.post_id));

          // 좋아요 상태 매핑
          const postsWithLikeStatus = posts.map((post: any) => ({
            ...post,
            is_liked: likedPostIds.has(post.id),
            createdAt: post.created_at || post.createdAt,
            updatedAt: post.updated_at || post.updatedAt,
            publishedAt: post.published_at || post.publishedAt,
          }));

          return { data: { posts: postsWithLikeStatus, totalCount, totalPages } };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    /**
     * ID로 게시글 조회 (통계 포함) - 최적화: 1번의 RPC 호출
     */
    getPostById: builder.query<Post, string>({
      async queryFn(id, _api, _extraOptions, baseQuery) {
        try {
          const userIdentifier = getUserIdentifier();

          // RPC 함수로 게시글 정보 + 좋아요 여부를 1번에 조회
          const { data, error } = await baseQuery(
            buildSupabaseQuery.rpc('get_post_with_user_data', {
              p_post_id: id,
              p_user_identifier: userIdentifier,
            })
          );

          if (error) throw error;

          const post = data as any;

          if (!post) {
            return { error: { status: 404, data: { message: '게시글을 찾을 수 없습니다' } } };
          }

          return {
            data: {
              ...post,
              createdAt: post.created_at || post.createdAt,
              updatedAt: post.updated_at || post.updatedAt,
              publishedAt: post.published_at || post.publishedAt,
            },
          };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    /**
     * post_number로 게시글 조회
     */
    getPostByNumber: builder.query<Post, number>({
      async queryFn(postNumber, _api, _extraOptions, baseQuery) {
        try {
          const userIdentifier = getUserIdentifier();

          const { data, error } = await baseQuery(
            buildSupabaseQuery.rpc('get_post_by_number_with_user_data', {
              p_post_number: postNumber,
              p_user_identifier: userIdentifier,
            })
          );

          if (error) throw error;

          const post = data as any;

          if (!post) {
            return { error: { status: 404, data: { message: '게시글을 찾을 수 없습니다' } } };
          }

          return {
            data: {
              ...post,
              createdAt: post.created_at || post.createdAt,
              updatedAt: post.updated_at || post.updatedAt,
              publishedAt: post.published_at || post.publishedAt,
            },
          };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: (result) => result ? [{ type: 'Post', id: result.id }] : [],
    }),

    /**
     * 게시글 생성
     */
    createPost: builder.mutation<Post, Partial<Post>>({
      query: (post) => buildSupabaseQuery.insert('posts', {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        status: post.status || 'draft',
        tags: post.tags || [],
        published_at: post.status === 'published' ? new Date().toISOString() : null,
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    /**
     * 게시글 수정
     */
    updatePost: builder.mutation<Post, { id: string; updates: Partial<Post> }>({
      query: ({ id, updates }) => buildSupabaseQuery.update('posts', id, {
        ...(updates.title && { title: updates.title }),
        ...(updates.content && { content: updates.content }),
        ...(updates.excerpt && { excerpt: updates.excerpt }),
        ...(updates.status && { status: updates.status }),
        ...(updates.tags && { tags: updates.tags }),
        ...(updates.status === 'published' && !updates.publishedAt && {
          published_at: new Date().toISOString()
        }),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    /**
     * 게시글 삭제
     */
    deletePost: builder.mutation<void, string>({
      query: (id) => buildSupabaseQuery.delete('posts', id),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    // ========================================
    // 좋아요 관리
    // ========================================

    /**
     * 좋아요 토글
     */
    toggleLike: builder.mutation<{ liked: boolean; likes_count: number }, string>({
      async queryFn(postId, _api, _extraOptions, baseQuery) {
        try {
          const userIdentifier = getUserIdentifier();

          // Supabase RPC 함수 호출
          const { data, error } = await baseQuery(
            buildSupabaseQuery.rpc('toggle_post_like', {
              p_post_id: postId,
              p_user_identifier: userIdentifier,
            })
          );

          if (error) throw error;

          return { data: data as { liked: boolean; likes_count: number } };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      invalidatesTags: (_result, _error, postId) => [
        { type: 'Post', id: postId },
        { type: 'PostStats', id: postId },
      ],
    }),

    // ========================================
    // 조회수 관리
    // ========================================

    /**
     * 조회수 증가
     */
    incrementView: builder.mutation<number, string>({
      async queryFn(postId, _api, _extraOptions, baseQuery) {
        try {
          const userIdentifier = getUserIdentifier();

          // Supabase RPC 함수 호출
          const { data, error } = await baseQuery(
            buildSupabaseQuery.rpc('increment_post_view', {
              p_post_id: postId,
              p_user_identifier: userIdentifier,
            })
          );

          if (error) throw error;

          return { data: data as number };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      // 조회수는 백그라운드 업데이트이므로 캐시 무효화 불필요
      // 캐시 무효화 시 게시글 재조회로 불필요한 API 호출 발생
      // invalidatesTags 제거로 성능 최적화
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetPostByNumberQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikeMutation,
  useIncrementViewMutation,
} = postsApi;
