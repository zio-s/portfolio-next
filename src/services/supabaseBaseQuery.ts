/**
 * Supabase Base Query for RTK Query
 *
 * RTK Query의 baseQuery를 Supabase 클라이언트로 교체합니다.
 * axios 대신 Supabase SDK를 사용하여 데이터를 가져옵니다.
 */

import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { supabase } from '../lib/supabase';

interface SupabaseQueryArgs {
  table: string;
  method: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'RPC';
  id?: string;
  data?: unknown;
  filters?: Record<string, unknown>;
  select?: string;
  single?: boolean;
  rpcName?: string;
  rpcParams?: unknown;
}

interface SupabaseQueryError {
  status: number;
  data: {
    message: string;
    hint?: string;
    details?: string;
  };
}

/**
 * Supabase Base Query
 *
 * RTK Query와 Supabase를 연결하는 커스텀 baseQuery
 */
export const supabaseBaseQuery = (): BaseQueryFn<
  SupabaseQueryArgs,
  unknown,
  SupabaseQueryError
> => {
  return async ({ table, method, id, data, filters, select = '*', single = false, rpcName, rpcParams }) => {
    try {
      // RPC (Remote Procedure Call) - Supabase Functions
      if (method === 'RPC' && rpcName) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: rpcData, error } = await supabase.rpc(rpcName as any, rpcParams);

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

        return { data: rpcData };
      }

      // SELECT
      if (method === 'SELECT') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query = supabase.from(table as any).select(select);

        // Apply filters
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value);
            }
          });
        }

        // Apply ID filter
        if (id) {
          query = query.eq('id', id);
        }

        // Single or multiple
        if (single || id) {
          const { data: result, error } = await query.single();

          if (error) {
            return {
              error: {
                status: error.code === 'PGRST116' ? 404 : 400,
                data: {
                  message: error.message,
                  hint: error.hint,
                  details: error.details,
                },
              },
            };
          }

          return { data: result };
        } else {
          const { data: result, error, count } = await query;

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
              items: result || [],
              total: count || result?.length || 0,
              page: 1,
              limit: result?.length || 10,
            },
          };
        }
      }

      // INSERT
      if (method === 'INSERT') {

        const { data: result, error } = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from(table as any)
          .insert(data)
          .select()
          .single();

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

        return { data: result };
      }

      // UPDATE
      if (method === 'UPDATE' && id) {

        const { data: result, error } = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from(table as any)
          .update(data)
          .eq('id', id)
          .select()
          .single();

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

        return { data: result };
      }

      // DELETE
      if (method === 'DELETE' && id) {

        const { error } = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from(table as any)
          .delete()
          .eq('id', id);

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

        return { data: null };
      }

      // Invalid method
      return {
        error: {
          status: 400,
          data: {
            message: 'Invalid method or missing required parameters',
          },
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return {
        error: {
          status: 500,
          data: {
            message: errorMessage,
          },
        },
      };
    }
  };
};

/**
 * Helper: Build Supabase query args
 */
export const buildSupabaseQuery = {
  /**
   * SELECT query
   */
  select: (
    table: string,
    options?: {
      id?: string;
      filters?: Record<string, unknown>;
      select?: string;
      single?: boolean;
    }
  ): SupabaseQueryArgs => ({
    table,
    method: 'SELECT',
    ...options,
  }),

  /**
   * INSERT query
   */
  insert: (table: string, data: unknown): SupabaseQueryArgs => ({
    table,
    method: 'INSERT',
    data,
  }),

  /**
   * UPDATE query
   */
  update: (table: string, id: string, data: unknown): SupabaseQueryArgs => ({
    table,
    method: 'UPDATE',
    id,
    data,
  }),

  /**
   * DELETE query
   */
  delete: (table: string, id: string): SupabaseQueryArgs => ({
    table,
    method: 'DELETE',
    id,
  }),

  /**
   * RPC (Remote Procedure Call)
   */
  rpc: (rpcName: string, rpcParams?: unknown): SupabaseQueryArgs => ({
    table: '',
    method: 'RPC',
    rpcName,
    rpcParams,
  }),
};
