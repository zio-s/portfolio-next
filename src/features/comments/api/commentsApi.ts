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
     * 전체 댓글 조회 (관리자용) - 프로젝트 + 블로그 댓글 통합
     */
    getAllComments: builder.query<CommentsResponse, void>({
      async queryFn() {
        // 1. 프로젝트 댓글 (프로젝트 제목 join)
        const { data: projectComments, error: pcError } = await supabase
          .from('comments')
          .select('*, projects(title)')
          .order('created_at', { ascending: false });

        if (pcError) {
          return { error: { status: 400, data: { message: pcError.message } } };
        }

        const transformedProjectComments = (projectComments || []).map((row) => ({
          ...transformComment(row),
          sourceType: 'project' as const,
          sourceTitle: (row as unknown as { projects: { title: string } | null }).projects?.title || '알 수 없는 프로젝트',
        }));

        // 2. 블로그 댓글 (게시글 제목 join) - post_comments는 database.types에 없으므로 any 사용
        const { data: blogComments, error: bcError } = await (supabase as any)
          .from('post_comments')
          .select('*, posts(title)')
          .order('created_at', { ascending: false });

        if (bcError) {
          return { error: { status: 400, data: { message: bcError.message } } };
        }

        const transformedBlogComments = ((blogComments || []) as any[]).map((row) => ({
          id: row.id,
          projectId: row.post_id,
          parentId: row.parent_id ?? undefined,
          authorName: row.author_name,
          authorEmail: row.author_email ?? undefined,
          authorAvatar: undefined,
          content: row.content,
          likes: row.likes ?? 0,
          createdAt: row.created_at ?? new Date().toISOString(),
          updatedAt: row.updated_at ?? new Date().toISOString(),
          sourceType: 'blog' as const,
          sourceTitle: row.posts?.title || '알 수 없는 게시글',
        } as Comment));

        // 3. 합치고 날짜순 정렬
        const allComments = [...transformedProjectComments, ...transformedBlogComments]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { data: { items: allComments, total: allComments.length } };
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

    likeComment: builder.mutation<null, string>({
      async queryFn(id) {
        const { error } = await supabase.rpc('increment_comment_likes', { comment_uuid: id });
        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }
        return { data: null };
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

    unlikeComment: builder.mutation<null, string>({
      async queryFn(id) {
        const { error } = await supabase.rpc('decrement_comment_likes', { comment_uuid: id });
        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }
        return { data: null };
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
