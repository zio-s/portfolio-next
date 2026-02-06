/**
 * Comments API - Supabase Version
 * Phase 8-3: MSW → Supabase 교체
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { supabaseBaseQuery, buildSupabaseQuery } from '../../../services/supabaseBaseQuery';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import type { Comment, CommentsResponse, CreateCommentDto, UpdateCommentDto } from '../types/Comment';

/**
 * Supabase Row → Frontend Comment 변환
 * snake_case → camelCase
 */
const transformComment = (row: Database['public']['Tables']['comments']['Row']): Comment => ({
  id: row.id,
  projectId: row.project_id,
  parentId: row.parent_id ?? undefined,
  authorName: row.author_name,
  authorEmail: row.author_email ?? undefined,
  authorAvatar: row.author_avatar ?? undefined,
  content: row.content,
  likes: row.likes ?? 0,
  createdAt: row.created_at ?? new Date().toISOString(),
  updatedAt: row.updated_at ?? new Date().toISOString(),
});

const TAG_TYPES = { COMMENT: 'Comment' } as const;

export const commentsApi = createApi({
  reducerPath: 'commentsApi',
  baseQuery: supabaseBaseQuery(),
  tagTypes: [TAG_TYPES.COMMENT],

  endpoints: (builder) => ({
    /**
     * 프로젝트별 댓글 조회
     */
    getComments: builder.query<CommentsResponse, string>({
      async queryFn(projectId) {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }

        return { data: { items: (data || []).map(transformComment), total: data?.length || 0 } };
      },
      providesTags: (result, error, projectId) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG_TYPES.COMMENT, id } as const)),
              { type: TAG_TYPES.COMMENT, id: `PROJECT_${projectId}` as const } as const,
            ]
          : [{ type: TAG_TYPES.COMMENT, id: `PROJECT_${projectId}` as const } as const],
    }),

    /**
     * 전체 댓글 조회 (관리자용)
     */
    getAllComments: builder.query<CommentsResponse, void>({
      async queryFn() {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }

        return { data: { items: (data || []).map(transformComment), total: data?.length || 0 } };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG_TYPES.COMMENT, id } as const)),
              { type: TAG_TYPES.COMMENT, id: 'ALL' as const } as const,
            ]
          : [{ type: TAG_TYPES.COMMENT, id: 'ALL' as const } as const],
    }),

    addComment: builder.mutation<Comment, CreateCommentDto>({
      async queryFn(data) {
        const { data: result, error } = await supabase
          .from('comments')
          .insert({
            project_id: data.projectId,
            parent_id: data.parentId || null,
            author_name: data.authorName || 'Anonymous',
            author_email: data.authorEmail || null,
            author_avatar: data.authorAvatar || null,
            content: data.content,
          })
          .select()
          .single();

        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }

        return { data: transformComment(result) };
      },
      invalidatesTags: (result, error, { projectId }) => [
        { type: TAG_TYPES.COMMENT, id: `PROJECT_${projectId}` },
      ],
    }),

    updateComment: builder.mutation<Comment, UpdateCommentDto>({
      query: ({ id, ...data }) => buildSupabaseQuery.update('comments', id, data),
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.COMMENT, id }],
    }),

    deleteComment: builder.mutation<void, string>({
      query: (id) => buildSupabaseQuery.delete('comments', id),
      invalidatesTags: (result, error, id) => [{ type: TAG_TYPES.COMMENT, id }],
    }),

    likeComment: builder.mutation<void, string>({
      async queryFn(id) {
        const { error } = await supabase.rpc('increment_comment_likes', { comment_uuid: id });
        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }
        return { data: undefined };
      },
      // Optimistic update: 댓글 목록의 likes 즉시 증가
      async onQueryStarted(commentId, { dispatch, queryFulfilled, getState }) {
        // 모든 프로젝트의 댓글 캐시를 찾아서 업데이트
        const state = getState() as { commentsApi?: { queries?: Record<string, { originalArgs?: string }> } };
        const apiState = state.commentsApi;

        const patchResults: Array<{ undo: () => void }> = [];

        // 모든 getComments 쿼리 캐시 업데이트
        if (apiState?.queries) {
          Object.keys(apiState.queries).forEach((key) => {
          if (key.startsWith('getComments')) {
            const projectId = apiState.queries?.[key]?.originalArgs;
            if (projectId) {
              const patchResult = dispatch(
                commentsApi.util.updateQueryData('getComments', projectId, (draft) => {
                  const comment = draft.items.find((c) => c.id === commentId);
                  if (comment) {
                    comment.likes += 1;
                  }
                })
              );
              patchResults.push(patchResult);
            }
          }
          });
        }

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patchResult) => patchResult.undo());
        }
      },
    }),

    unlikeComment: builder.mutation<void, string>({
      async queryFn(id) {
        const { error } = await supabase.rpc('decrement_comment_likes', { comment_uuid: id });
        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }
        return { data: undefined };
      },
      // Optimistic update: 댓글 목록의 likes 즉시 감소
      async onQueryStarted(commentId, { dispatch, queryFulfilled, getState }) {
        const state = getState() as { commentsApi?: { queries?: Record<string, { originalArgs?: string }> } };
        const apiState = state.commentsApi;

        const patchResults: Array<{ undo: () => void }> = [];

        if (apiState?.queries) {
          Object.keys(apiState.queries).forEach((key) => {
          if (key.startsWith('getComments')) {
            const projectId = apiState.queries?.[key]?.originalArgs;
            if (projectId) {
              const patchResult = dispatch(
                commentsApi.util.updateQueryData('getComments', projectId, (draft) => {
                  const comment = draft.items.find((c) => c.id === commentId);
                  if (comment) {
                    comment.likes = Math.max(0, comment.likes - 1);
                  }
                })
              );
              patchResults.push(patchResult);
            }
          }
          });
        }

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patchResult) => patchResult.undo());
        }
      },
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useGetAllCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} = commentsApi;
