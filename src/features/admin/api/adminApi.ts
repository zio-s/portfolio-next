/**
 * Admin API - Supabase Version
 * Phase 8-3: Admin Stats API 교체
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { supabaseBaseQuery } from '../../../services/supabaseBaseQuery';
import { supabase } from '../../../lib/supabase';

interface AdminStats {
  totalProjects: number;
  totalComments: number;
  totalViews: number;
  totalLikes: number;
}

const TAG_TYPES = { ADMIN_STATS: 'AdminStats' } as const;

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: supabaseBaseQuery(),
  tagTypes: [TAG_TYPES.ADMIN_STATS],

  endpoints: (builder) => ({
    /**
     * 관리자 대시보드 통계 조회
     * admin_stats view에서 데이터 가져옴
     */
    getAdminStats: builder.query<AdminStats, void>({
      async queryFn() {
        try {
          const { data, error } = await supabase
            .from('admin_stats')
            .select('*')
            .single();

          if (error) {
            return {
              error: {
                status: 400,
                data: { message: error.message },
              },
            };
          }

          // snake_case → camelCase 변환 (null -> 0)
          return {
            data: {
              totalProjects: data.total_projects ?? 0,
              totalComments: data.total_comments ?? 0,
              totalViews: data.total_views ?? 0,
              totalLikes: data.total_likes ?? 0,
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
      providesTags: [TAG_TYPES.ADMIN_STATS],
    }),
  }),
});

export const { useGetAdminStatsQuery } = adminApi;
