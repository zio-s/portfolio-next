/**
 * Post Comments API - Supabase RTK Query
 *
 * Supabase 기반 블로그 게시글 댓글 CRUD
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { supabaseBaseQuery, buildSupabaseQuery } from '../../services/supabaseBaseQuery';
import type { PostComment } from '../types';

export const postCommentsApi = createApi({
  reducerPath: 'postCommentsApi',
  baseQuery: supabaseBaseQuery(),
  tagTypes: ['PostComment'],
  endpoints: (builder) => ({
    // ========================================
    // 댓글 조회
    // ========================================

    /**
     * 특정 게시글의 댓글 목록 조회 (모든 댓글)
     */
    getPostComments: builder.query<PostComment[], string>({
      async queryFn(postId, _api, _extraOptions, baseQuery) {
        try {
          const { data, error } = await baseQuery(
            buildSupabaseQuery.select('post_comments', {
              filters: { post_id: postId },
              select: '*',
            })
          );

          if (error) throw error;

          const comments = (data as any)?.items || [];

          // 댓글을 계층 구조로 변환 (부모-자식 관계)
          const commentsMap = new Map<string, PostComment>();
          const rootComments: PostComment[] = [];

          // 먼저 모든 댓글을 맵에 저장
          comments.forEach((comment: any) => {
            commentsMap.set(comment.id, {
              ...comment,
              postId: comment.post_id,
              authorName: comment.author_name,
              authorEmail: comment.author_email,
              parentId: comment.parent_id,
              createdAt: comment.created_at,
              updatedAt: comment.updated_at,
              replies: [],
            });
          });

          // 부모-자식 관계 구성
          commentsMap.forEach((comment) => {
            if (comment.parent_id) {
              const parent = commentsMap.get(comment.parent_id);
              if (parent) {
                parent.replies = parent.replies || [];
                parent.replies.push(comment);
              }
            } else {
              rootComments.push(comment);
            }
          });

          // 생성일 기준 정렬
          rootComments.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return { data: rootComments };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: (result, _error, postId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PostComment' as const, id })),
              { type: 'PostComment', id: `POST_${postId}` },
            ]
          : [{ type: 'PostComment', id: `POST_${postId}` }],
    }),

    /**
     * 모든 댓글 조회 (관리자용 - 모든 상태 포함)
     */
    getAllPostComments: builder.query<PostComment[], { postId?: string; status?: string }>({
      async queryFn({ postId, status }, _api, _extraOptions, baseQuery) {
        try {
          const filters: Record<string, unknown> = {};
          if (postId) filters.post_id = postId;
          if (status) filters.status = status;

          const { data, error } = await baseQuery(
            buildSupabaseQuery.select('post_comments', {
              filters: Object.keys(filters).length > 0 ? filters : undefined,
              select: '*',
            })
          );

          if (error) throw error;

          const comments = ((data as any)?.items || []).map((comment: any) => ({
            ...comment,
            postId: comment.post_id,
            authorName: comment.author_name,
            authorEmail: comment.author_email,
            parentId: comment.parent_id,
            createdAt: comment.created_at,
            updatedAt: comment.updated_at,
          }));

          return { data: comments };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PostComment' as const, id })),
              { type: 'PostComment', id: 'LIST' },
            ]
          : [{ type: 'PostComment', id: 'LIST' }],
    }),

    // ========================================
    // 댓글 생성
    // ========================================

    /**
     * 댓글 생성 (자동으로 approved 상태로 생성)
     */
    createPostComment: builder.mutation<PostComment, Partial<PostComment>>({
      query: (comment) => buildSupabaseQuery.insert('post_comments', {
        post_id: comment.post_id || comment.postId,
        author_name: comment.author_name || comment.authorName,
        author_email: comment.author_email || comment.authorEmail,
        content: comment.content,
        parent_id: comment.parent_id || comment.parentId || null,
        status: 'approved', // 모든 댓글 자동 승인
      }),
      invalidatesTags: (_result, _error, comment) => [
        { type: 'PostComment', id: `POST_${comment.post_id || comment.postId}` },
        { type: 'PostComment', id: 'LIST' },
      ],
    }),

    // ========================================
    // 댓글 수정 (관리자용)
    // ========================================

    /**
     * 댓글 상태 변경 (관리자용)
     */
    updateCommentStatus: builder.mutation<PostComment, { id: string; status: 'pending' | 'approved' | 'rejected' }>({
      query: ({ id, status }) => buildSupabaseQuery.update('post_comments', id, {
        status,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PostComment', id },
        { type: 'PostComment', id: 'LIST' },
      ],
    }),

    /**
     * 댓글 수정 (관리자용)
     */
    updatePostComment: builder.mutation<PostComment, { id: string; updates: Partial<PostComment> }>({
      query: ({ id, updates }) => buildSupabaseQuery.update('post_comments', id, {
        ...(updates.content && { content: updates.content }),
        ...(updates.status && { status: updates.status }),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PostComment', id },
        { type: 'PostComment', id: 'LIST' },
      ],
    }),

    // ========================================
    // 댓글 삭제
    // ========================================

    /**
     * 댓글 삭제
     */
    deletePostComment: builder.mutation<void, string>({
      query: (id) => buildSupabaseQuery.delete('post_comments', id),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PostComment', id },
        { type: 'PostComment', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetPostCommentsQuery,
  useGetAllPostCommentsQuery,
  useCreatePostCommentMutation,
  useUpdateCommentStatusMutation,
  useUpdatePostCommentMutation,
  useDeletePostCommentMutation,
} = postCommentsApi;
