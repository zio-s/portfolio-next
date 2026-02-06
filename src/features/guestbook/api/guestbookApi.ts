/**
 * Guestbook API - Supabase Version
 *
 * 방문록 API 엔드포인트
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { supabaseBaseQuery } from '../../../services/supabaseBaseQuery';
import { supabase } from '../../../lib/supabase';
import type {
  Guestbook,
  GuestbookDB,
  GuestbookListResponse,
  GuestbookFormData,
  GuestbookAdminReplyData,
  GuestbookUpdateData,
  GetGuestbookParams,
} from '../types/Guestbook';
import { transformGuestbookFromDB } from '../types/Guestbook';

const TAG_TYPES = { GUESTBOOK: 'Guestbook', VISITOR_COUNT: 'VisitorCount' } as const;

export const guestbookApi = createApi({
  reducerPath: 'guestbookApi',
  baseQuery: supabaseBaseQuery(),
  tagTypes: [TAG_TYPES.GUESTBOOK, TAG_TYPES.VISITOR_COUNT],

  endpoints: (builder) => ({
    /**
     * 공개 방문록 조회 (승인된 항목만) - Cursor 기반 페이지네이션
     */
    getGuestbook: builder.query<GuestbookListResponse, GetGuestbookParams | void>({
      async queryFn(params) {
        const { limit = 10, cursor, approvedOnly = true } = params || {};

        // Get total count
        let countQuery = supabase
          .from('guestbook')
          .select('*', { count: 'exact', head: true });

        if (approvedOnly) {
          countQuery = countQuery.eq('is_approved', true);
        }

        const { count } = await countQuery;

        // Build single query with proper ordering
        let query = supabase
          .from('guestbook')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit + 1); // Fetch one extra to check if there are more

        if (approvedOnly) {
          query = query.eq('is_approved', true);
        }

        // Apply cursor for pagination (skip to cursor position)
        if (cursor) {
          query = query.lt('created_at', cursor).eq('is_pinned', false);
        }

        const { data, error } = await query;

        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }

        // Check if there are more items (actual data length > limit)
        const hasMore = (data || []).length > limit;
        const items = (data || []).slice(0, limit);

        // Get next cursor from last NON-PINNED item only if there are more items
        let nextCursor: string | undefined = undefined;
        if (hasMore) {
          const nonPinnedItems = items.filter((item: GuestbookDB) => !item.is_pinned);
          const lastNonPinnedItem = nonPinnedItems[nonPinnedItems.length - 1];
          if (lastNonPinnedItem) {
            nextCursor = lastNonPinnedItem.created_at ?? undefined;
          }
        }

        const transformedItems = items.map((item: GuestbookDB) => transformGuestbookFromDB(item));

        return {
          data: {
            items: transformedItems,
            total: count || 0,
            limit,
            nextCursor,
            hasMore,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG_TYPES.GUESTBOOK, id } as const)),
              { type: TAG_TYPES.GUESTBOOK, id: 'LIST' as const } as const,
            ]
          : [{ type: TAG_TYPES.GUESTBOOK, id: 'LIST' as const } as const],
    }),

    /**
     * 관리자용 전체 방문록 조회 (미승인 포함)
     */
    getAllGuestbook: builder.query<GuestbookListResponse, GetGuestbookParams | void>({
      async queryFn(params) {
        const { limit = 50, offset = 0 } = params || {};

        const { data, error, count } = await supabase
          .from('guestbook')
          .select('*', { count: 'exact' })
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }

        const items = (data || []).map((item: GuestbookDB) => transformGuestbookFromDB(item));
        const hasMore = (count || 0) > offset + limit;

        return {
          data: {
            items,
            total: count || 0,
            limit,
            hasMore,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: TAG_TYPES.GUESTBOOK, id } as const)),
              { type: TAG_TYPES.GUESTBOOK, id: 'ALL' as const } as const,
            ]
          : [{ type: TAG_TYPES.GUESTBOOK, id: 'ALL' as const } as const],
    }),

    /**
     * 방문록 항목 생성 (공개 API)
     */
    createGuestbookEntry: builder.mutation<Guestbook, GuestbookFormData>({
      async queryFn(data) {
        const { data: result, error } = await supabase
          .from('guestbook')
          .insert({
            author_name: data.authorName,
            author_email: data.authorEmail || null,
            content: data.content,
            is_approved: true, // Auto-approve by default
          })
          .select()
          .single();

        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }

        return { data: transformGuestbookFromDB(result as GuestbookDB) };
      },
      invalidatesTags: [{ type: TAG_TYPES.GUESTBOOK, id: 'LIST' }],
    }),

    /**
     * 관리자 답글 작성
     */
    addAdminReply: builder.mutation<Guestbook, GuestbookAdminReplyData>({
      async queryFn({ id, adminReply }) {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return { error: { status: 401, data: { message: 'Unauthorized' } } };
        }

        const { data, error } = await supabase
          .from('guestbook')
          .update({
            admin_reply: adminReply,
            admin_replied_at: new Date().toISOString(),
            admin_user_id: user.id,
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }

        return { data: transformGuestbookFromDB(data as GuestbookDB) };
      },
      invalidatesTags: (result, error, { id }) => [{ type: TAG_TYPES.GUESTBOOK, id }],
    }),

    /**
     * 방문록 항목 업데이트 (관리자)
     */
    updateGuestbookEntry: builder.mutation<Guestbook, GuestbookUpdateData>({
      async queryFn({ id, ...updates }) {
        const dbUpdates: Partial<GuestbookDB> = {};

        if (updates.isApproved !== undefined) {
          dbUpdates.is_approved = updates.isApproved;
        }
        if (updates.isPinned !== undefined) {
          dbUpdates.is_pinned = updates.isPinned;
        }
        if (updates.adminReply !== undefined) {
          dbUpdates.admin_reply = updates.adminReply;
          dbUpdates.admin_replied_at = new Date().toISOString();

          // Get current user for admin reply
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            dbUpdates.admin_user_id = user.id;
          }
        }

        const { data, error } = await supabase
          .from('guestbook')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }

        return { data: transformGuestbookFromDB(data as GuestbookDB) };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: TAG_TYPES.GUESTBOOK, id },
        { type: TAG_TYPES.GUESTBOOK, id: 'LIST' },
        { type: TAG_TYPES.GUESTBOOK, id: 'ALL' },
      ],
    }),

    /**
     * 방문록 항목 삭제 (관리자)
     */
    deleteGuestbookEntry: builder.mutation<void, string>({
      async queryFn(id) {
        const { error } = await supabase.from('guestbook').delete().eq('id', id);

        if (error) {
          return { error: { status: 400, data: { message: error.message } } };
        }

        return { data: undefined };
      },
      invalidatesTags: (result, error, id) => [
        { type: TAG_TYPES.GUESTBOOK, id },
        { type: TAG_TYPES.GUESTBOOK, id: 'LIST' },
        { type: TAG_TYPES.GUESTBOOK, id: 'ALL' },
      ],
    }),

    /**
     * 오늘 방문자 수 조회
     */
    getTodayVisitorCount: builder.query<number, void>({
      async queryFn() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const { data, error } = await supabase
          .from('guestbook_visitors')
          .select('visitor_count')
          .eq('visit_date', today)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          return { error: { status: 400, data: { message: error.message } } };
        }

        return { data: data?.visitor_count || 0 };
      },
      providesTags: [TAG_TYPES.VISITOR_COUNT],
      keepUnusedDataFor: 3600, // 1 hour cache
    }),

    /**
     * 방문자 카운트 증가
     */
    incrementVisitorCount: builder.mutation<number, void>({
      async queryFn() {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Check if record exists for today
        const { data: existing, error: selectError } = await supabase
          .from('guestbook_visitors')
          .select('id, visitor_count')
          .eq('visit_date', today)
          .maybeSingle();

        // Ignore "no rows" error
        if (selectError && selectError.code !== 'PGRST116') {
          return { error: { status: 400, data: { message: selectError.message } } };
        }

        if (existing) {
          // Update existing record and return new count
          const newCount = existing.visitor_count + 1;
          const { error } = await supabase
            .from('guestbook_visitors')
            .update({ visitor_count: newCount })
            .eq('id', existing.id);

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: newCount };
        } else {
          // Create new record
          const { error } = await supabase
            .from('guestbook_visitors')
            .insert({ visit_date: today, visitor_count: 1 });

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: 1 };
        }
      },
      invalidatesTags: [TAG_TYPES.VISITOR_COUNT],
    }),
  }),
});

export const {
  useGetGuestbookQuery,
  useGetAllGuestbookQuery,
  useCreateGuestbookEntryMutation,
  useAddAdminReplyMutation,
  useUpdateGuestbookEntryMutation,
  useDeleteGuestbookEntryMutation,
  useGetTodayVisitorCountQuery,
  useIncrementVisitorCountMutation,
} = guestbookApi;
