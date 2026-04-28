'use client';

/**
 * 전역 ⌘K 마운트 wrapper
 *
 * DESIGN_RESPONSE.md §3.4 — MainLayout에 마운트, lazy fetch.
 *
 * 동작:
 * - ⌘K / Ctrl+K 단축키 + 커스텀 이벤트 'open-command-palette' 두 가지로 열림
 * - 모달이 처음 열린 시점에만 RTK Query 발동 (skip 해제), 이후 캐시 활용
 * - 사이드바의 검색 trigger 버튼은 `openCommandPalette()`를 호출하면 됨
 */

import { useCallback, useEffect, useState } from 'react';
import { useGetPostsQuery } from '@/store';
import { CommandPalette, useCommandPaletteShortcut } from './CommandPalette';

const OPEN_EVENT = 'open-command-palette';

/** 어디서든 호출하면 글로벌 ⌘K 모달이 열림 */
export function openCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_EVENT));
  }
}

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  // 한 번이라도 open된 적 있으면 fetch 유지 (이후 캐시 hit)
  const [hasOpened, setHasOpened] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setHasOpened(true);
  }, []);

  // ⌘K / Ctrl+K
  useCommandPaletteShortcut(open, () => (open ? setOpen(false) : handleOpen()));

  // 커스텀 이벤트 (사이드바 검색 trigger 등에서 dispatch)
  useEffect(() => {
    const onOpen = () => handleOpen();
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [handleOpen]);

  // lazy fetch — open된 적 없으면 skip
  const { data } = useGetPostsQuery(
    { status: 'published', page: 1, limit: 200 },
    { skip: !hasOpened }
  );
  const posts = data?.posts ?? [];

  return <CommandPalette open={open} onClose={() => setOpen(false)} posts={posts} />;
}
