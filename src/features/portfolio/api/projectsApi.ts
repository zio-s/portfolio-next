/**
 * Projects API - Supabase Version
 *
 * Phase 8-3: MSW → Supabase로 교체
 * RTK Query + Supabase 클라이언트 통합
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { supabaseBaseQuery, buildSupabaseQuery } from '../../../services/supabaseBaseQuery';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import type {
  Project,
  ProjectFilters,
  ProjectsResponse,
  CreateProjectDto,
  UpdateProjectDto,
} from '../types/Project';

/**
 * Supabase Row → Frontend Project 변환
 * snake_case → camelCase
 */
const transformProject = (row: Database['public']['Tables']['projects']['Row']): Project => ({
  id: row.id,
  title: row.title,
  description: row.description,
  content: row.content || row.description, // content 필드 사용, 없으면 description 대체
  thumbnail: row.thumbnail,
  category: row.category as Project['category'],
  tags: row.tags ?? [],
  techStack: row.tech_stack ?? [],
  githubUrl: row.github_url ?? undefined,
  liveUrl: row.demo_url ?? undefined,
  status: 'public' as const,
  featured: row.featured ?? false,
  duration: row.duration,
  teamSize: row.team_size,
  role: row.role,
  achievements: row.achievements ?? [],
  challenges: row.challenges ?? [],
  solutions: row.solutions ?? [],
  stats: {
    views: row.views ?? 0,
    likes: row.likes ?? 0,
    comments: 0,
  },
  images: row.images ?? [],
  createdAt: row.created_at ?? new Date().toISOString(),
  updatedAt: row.updated_at ?? new Date().toISOString(),
  authorId: 'system',
  sortOrder: row.sort_order ?? 0,
});

const TAG_TYPES = {
  PROJECT: 'Project',
  COMMENT: 'Comment',
  REACTION: 'Reaction',
} as const;

/**
 * Projects API with Supabase
 */
export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: supabaseBaseQuery(),
  tagTypes: [TAG_TYPES.PROJECT, TAG_TYPES.COMMENT, TAG_TYPES.REACTION],

  endpoints: (builder) => ({
    /**
     * 프로젝트 목록 조회
     */
    getProjects: builder.query<ProjectsResponse, ProjectFilters | void>({
      async queryFn(filters) {
        try {
          const actualFilters = filters || {};
          let query = supabase.from('projects').select('*', { count: 'exact' });

          // Apply filters
          if (actualFilters.category) {
            query = query.eq('category', actualFilters.category);
          }
          if (actualFilters.featured !== undefined) {
            query = query.eq('featured', actualFilters.featured);
          }
          if (actualFilters.tags && actualFilters.tags.length > 0) {
            query = query.contains('tags', actualFilters.tags);
          }

          // Sorting - map sort preset to database columns
          const sortOption = actualFilters.sort || 'default';
          let sortBy: string;
          let ascending: boolean;

          switch (sortOption) {
            case 'default':
              sortBy = 'sort_order';
              ascending = true;
              break;
            case 'recent':
              sortBy = 'start_date';
              ascending = false;
              break;
            case 'popular':
              sortBy = 'views';
              ascending = false;
              break;
            case 'views':
              sortBy = 'views';
              ascending = false;
              break;
            case 'likes':
              sortBy = 'likes';
              ascending = false;
              break;
            default:
              sortBy = 'sort_order';
              ascending = true;
          }

          query = query.order(sortBy, { ascending });

          // Pagination
          const page = actualFilters.page || 1;
          const limit = actualFilters.limit || 10;
          const offset = (page - 1) * limit;
          query = query.range(offset, offset + limit - 1);

          const { data, error, count } = await query;

          if (error) {
            return {
              error: {
                status: 400,
                data: {
                  message: error.message,
                  hint: error.hint,
                  details: error.details,
                },
              },
            };
          }

          return {
            data: {
              items: (data || []).map(transformProject),
              pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
              },
            },
          };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG_TYPES.PROJECT, id } as const)),
              { type: TAG_TYPES.PROJECT, id: 'LIST' } as const,
            ]
          : [{ type: TAG_TYPES.PROJECT, id: 'LIST' } as const],
    }),

    /**
     * 단일 프로젝트 조회
     */
    getProject: builder.query<Project, string>({
      async queryFn(id) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            return {
              error: {
                status: error.code === 'PGRST116' ? 404 : 400,
                data: { message: error.message },
              },
            };
          }

          return { data: transformProject(data) };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      providesTags: (result, error, id) => [{ type: TAG_TYPES.PROJECT, id }],
    }),

    /**
     * 프로젝트 생성 (Admin)
     */
    createProject: builder.mutation<Project, CreateProjectDto>({
      async queryFn(data) {
        try {
          // camelCase → snake_case 변환
          const insertData = {
            title: data.title,
            description: data.description,
            content: data.content || data.description, // content 없으면 description 사용
            thumbnail: data.thumbnail || '',
            category: data.category,
            featured: data.featured ?? false,
            tags: data.tags ?? [],
            tech_stack: data.techStack ?? [],
            github_url: data.githubUrl || null,
            demo_url: data.liveUrl || null,
            // Supabase 스키마에 필요한 필드들 (기본값)
            duration: '1개월',
            team_size: 1,
            role: '개발자',
            achievements: [],
            challenges: [],
            solutions: [],
            images: data.images ?? [],
          };

          const { data: result, error } = await supabase
            .from('projects')
            .insert(insertData)
            .select()
            .single();

          if (error) {
            return {
              error: {
                status: 400,
                data: { message: error.message },
              },
            };
          }

          return { data: transformProject(result) };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      invalidatesTags: [{ type: TAG_TYPES.PROJECT, id: 'LIST' }],
    }),

    /**
     * 프로젝트 수정 (Admin)
     */
    updateProject: builder.mutation<Project, UpdateProjectDto>({
      async queryFn({ id, ...data }) {
        try {
          // camelCase → snake_case 변환 (undefined 필드 제외)
          const updateData: Partial<Database['public']['Tables']['projects']['Update']> = {};
          if (data.title !== undefined) updateData.title = data.title;
          if (data.description !== undefined) updateData.description = data.description;
          if (data.content !== undefined) updateData.content = data.content;
          if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
          if (data.category !== undefined) updateData.category = data.category;
          if (data.featured !== undefined) updateData.featured = data.featured;
          if (data.tags !== undefined) updateData.tags = data.tags;
          if (data.techStack !== undefined) updateData.tech_stack = data.techStack;
          if (data.githubUrl !== undefined) updateData.github_url = data.githubUrl;
          if (data.liveUrl !== undefined) updateData.demo_url = data.liveUrl;
          if (data.images !== undefined) updateData.images = data.images;

          const { data: result, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            return {
              error: {
                status: 400,
                data: { message: error.message },
              },
            };
          }

          return { data: transformProject(result) };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: TAG_TYPES.PROJECT, id },
        { type: TAG_TYPES.PROJECT, id: 'LIST' },
      ],
    }),

    /**
     * 프로젝트 삭제 (Admin)
     */
    deleteProject: builder.mutation<void, string>({
      query: (id) => buildSupabaseQuery.delete('projects', id),
      invalidatesTags: (result, error, id) => [
        { type: TAG_TYPES.PROJECT, id },
        { type: TAG_TYPES.PROJECT, id: 'LIST' },
      ],
    }),

    /**
     * 프로젝트 조회수 증가
     */
    incrementViews: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          // Call Supabase RPC function
          const { error } = await supabase.rpc('increment_project_views', {
            project_uuid: id,
          });

          if (error) {
            return {
              error: {
                status: 400,
                data: { message: error.message },
              },
            };
          }

          return { data: undefined };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      // Invalidate cache to fetch fresh data from DB
      invalidatesTags: (result, error, id) => [
        { type: TAG_TYPES.PROJECT, id },
        { type: TAG_TYPES.PROJECT, id: 'LIST' },
      ],
    }),

    /**
     * 프로젝트 좋아요
     */
    likeProject: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          // Call Supabase RPC function
          const { error } = await supabase.rpc('increment_project_likes', {
            project_uuid: id,
          });

          if (error) {
            return {
              error: {
                status: 400,
                data: { message: error.message },
              },
            };
          }

          return { data: undefined };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      // Optimistic update: 단일 프로젝트 + 프로젝트 목록 모두 업데이트
      async onQueryStarted(projectId, { dispatch, queryFulfilled, getState }) {
        const patchResults: Array<{ undo: () => void }> = [];

        // 1. 단일 프로젝트 캐시 업데이트 (상세 페이지)
        const detailPatch = dispatch(
          projectsApi.util.updateQueryData('getProject', projectId, (draft) => {
            draft.stats.likes += 1;
          })
        );
        patchResults.push(detailPatch);

        // 2. 프로젝트 목록 캐시 업데이트 (목록 페이지)
        const state = getState() as { projectsApi?: { queries?: Record<string, { originalArgs?: ProjectFilters | void }> } };
        const apiState = state.projectsApi;

        if (apiState?.queries) {
          Object.keys(apiState.queries).forEach((key) => {
            if (key.startsWith('getProjects')) {
              const queryArgs = apiState.queries?.[key]?.originalArgs;
              const listPatch = dispatch(
                projectsApi.util.updateQueryData('getProjects', queryArgs, (draft) => {
                  const project = draft.items.find((p) => p.id === projectId);
                  if (project) {
                    project.stats.likes += 1;
                  }
                })
              );
              patchResults.push(listPatch);
            }
          });
        }

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),

    /**
     * 프로젝트 좋아요 취소
     */
    unlikeProject: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          // Call Supabase RPC function
          const { error } = await supabase.rpc('decrement_project_likes', {
            project_uuid: id,
          });

          if (error) {
            return {
              error: {
                status: 400,
                data: { message: error.message },
              },
            };
          }

          return { data: undefined };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      // Optimistic update: 단일 프로젝트 + 프로젝트 목록 모두 업데이트
      async onQueryStarted(projectId, { dispatch, queryFulfilled, getState }) {
        const patchResults: Array<{ undo: () => void }> = [];

        // 1. 단일 프로젝트 캐시 업데이트 (상세 페이지)
        const detailPatch = dispatch(
          projectsApi.util.updateQueryData('getProject', projectId, (draft) => {
            draft.stats.likes = Math.max(0, draft.stats.likes - 1);
          })
        );
        patchResults.push(detailPatch);

        // 2. 프로젝트 목록 캐시 업데이트 (목록 페이지)
        const state = getState() as { projectsApi?: { queries?: Record<string, { originalArgs?: ProjectFilters | void }> } };
        const apiState = state.projectsApi;

        if (apiState?.queries) {
          Object.keys(apiState.queries).forEach((key) => {
            if (key.startsWith('getProjects')) {
              const queryArgs = apiState.queries?.[key]?.originalArgs;
              const listPatch = dispatch(
                projectsApi.util.updateQueryData('getProjects', queryArgs, (draft) => {
                  const project = draft.items.find((p) => p.id === projectId);
                  if (project) {
                    project.stats.likes = Math.max(0, project.stats.likes - 1);
                  }
                })
              );
              patchResults.push(listPatch);
            }
          });
        }

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),

    /**
     * 댓글 목록 조회 (최적화: 1번의 쿼리로 모든 댓글 가져오기)
     */
    getComments: builder.query<
      { comments: Array<Database['public']['Tables']['comments']['Row'] & { replies: Database['public']['Tables']['comments']['Row'][] }>; total: number },
      { projectId: string; page?: number; limit?: number }
    >({
      async queryFn({ projectId, page = 1, limit = 10 }) {
        try {
          const offset = (page - 1) * limit;

          // 1. Get root comments count
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .is('parent_id', null);

          // 2. Get root comments with pagination
          const { data: rootComments, error: rootError } = await supabase
            .from('comments')
            .select('*')
            .eq('project_id', projectId)
            .is('parent_id', null)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (rootError) {
            return {
              error: {
                status: 400,
                data: { message: rootError.message },
              },
            };
          }

          if (!rootComments || rootComments.length === 0) {
            return {
              data: {
                comments: [],
                total: count || 0,
              },
            };
          }

          // 3. Get all replies for these root comments in ONE query
          const rootCommentIds = rootComments.map((c) => c.id);
          const { data: allReplies, error: repliesError } = await supabase
            .from('comments')
            .select('*')
            .in('parent_id', rootCommentIds)
            .order('created_at', { ascending: true });

          if (repliesError) {
            return {
              error: {
                status: 400,
                data: { message: repliesError.message },
              },
            };
          }

          // 4. Group replies by parent_id
          const repliesByParent: Record<string, Database['public']['Tables']['comments']['Row'][]> = {};
          (allReplies || []).forEach((reply) => {
            // Skip replies without parent_id (shouldn't happen for replies, but be safe)
            if (!reply.parent_id) return;

            if (!repliesByParent[reply.parent_id]) {
              repliesByParent[reply.parent_id] = [];
            }
            repliesByParent[reply.parent_id].push(reply);
          });

          // 5. Attach replies to root comments
          const commentsWithReplies = rootComments.map((comment) => ({
            ...comment,
            replies: repliesByParent[comment.id] || [],
          }));

          return {
            data: {
              comments: commentsWithReplies,
              total: count || 0,
            },
          };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      providesTags: (result, error, { projectId }) => [
        { type: TAG_TYPES.COMMENT, id: projectId },
      ],
    }),

    /**
     * 댓글 작성 (필요한 컬럼만 반환)
     */
    createComment: builder.mutation<
      Pick<Database['public']['Tables']['comments']['Row'], 'id' | 'project_id' | 'parent_id' | 'author_name' | 'content' | 'created_at'>,
      { projectId: string; author: string; content: string; parentId?: string }
    >({
      async queryFn({ projectId, author, content, parentId }) {
        try {
          const columns = 'id,project_id,parent_id,author_name,content,created_at';
          const { data, error } = await supabase
            .from('comments')
            .insert({
              project_id: projectId,
              author_name: author, // 실제 컬럼명은 author_name
              content,
              parent_id: parentId || null,
            })
            .select(columns)
            .single();

          if (error) {
            return {
              error: {
                status: 400,
                data: { message: error.message },
              },
            };
          }

          return { data };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      invalidatesTags: (result, error, { projectId }) => [
        { type: TAG_TYPES.COMMENT, id: projectId },
        { type: TAG_TYPES.PROJECT, id: projectId },
      ],
    }),

    /**
     * 프로젝트 정렬 순서 업데이트 (Admin)
     */
    updateProjectsOrder: builder.mutation<void, { id: string; sortOrder: number }[]>({
      async queryFn(updates) {
        try {
          // 각 프로젝트의 sort_order를 업데이트
          for (const { id, sortOrder } of updates) {
            const { error } = await supabase
              .from('projects')
              .update({ sort_order: sortOrder })
              .eq('id', id);

            if (error) {
              return {
                error: {
                  status: 400,
                  data: { message: error.message },
                },
              };
            }
          }

          return { data: undefined };
        } catch (error: unknown) {
          const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Unknown error occurred';
          return {
            error: {
              status: 500,
              data: { message: errorMessage },
            },
          };
        }
      },
      invalidatesTags: [{ type: TAG_TYPES.PROJECT, id: 'LIST' }],
    }),
  }),
});

/**
 * Auto-generated hooks
 */
export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useIncrementViewsMutation,
  useLikeProjectMutation,
  useUnlikeProjectMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateProjectsOrderMutation,
} = projectsApi;
