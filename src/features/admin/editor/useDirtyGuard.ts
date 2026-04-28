'use client';

/**
 * 페이지 이탈 시 confirm — beforeunload + history navigation
 * (DESIGN_RESPONSE_R4.md §2.6)
 */

import { useEffect } from 'react';

export function useDirtyGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
