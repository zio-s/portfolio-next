/**
 * 관리자 전용 쓰기 요청
 *
 * posts / projects 쓰기는 DB RLS가 관리자만 허용하므로 브라우저(anon 키)에서 직접 보내지 않고
 * /api/admin/write 라우트를 거친다. 라우트가 HttpOnly 쿠키의 관리자 토큰을 붙여 대신 실행한다.
 * 반환 형태는 supabaseBaseQuery와 같아서 RTK Query 쪽 호출부는 그대로 쓸 수 있다.
 */

export const ADMIN_WRITE_TABLES = ['posts', 'projects'] as const;
export type AdminWriteTable = (typeof ADMIN_WRITE_TABLES)[number];

export interface AdminWriteArgs {
  table: AdminWriteTable;
  method: 'INSERT' | 'UPDATE' | 'DELETE';
  id?: string;
  data?: unknown;
}

export interface AdminWriteError {
  status: number;
  data: { message: string; hint?: string; details?: string };
}

export type AdminWriteResult<T = unknown> = { data: T; error?: undefined } | { data?: undefined; error: AdminWriteError };

export function isAdminWriteTable(table: string): table is AdminWriteTable {
  return (ADMIN_WRITE_TABLES as readonly string[]).includes(table);
}

export async function adminWrite<T = unknown>(args: AdminWriteArgs): Promise<AdminWriteResult<T>> {
  try {
    const response = await fetch('/api/admin/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(args),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok || !body || body.error) {
      return {
        error: body?.error ?? {
          status: response.status,
          data: { message: '요청에 실패했습니다.' },
        },
      };
    }

    return { data: body.data as T };
  } catch (error: unknown) {
    return {
      error: {
        status: 500,
        data: { message: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.' },
      },
    };
  }
}
