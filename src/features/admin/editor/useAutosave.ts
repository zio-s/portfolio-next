'use client';

/**
 * 자동저장 훅 (DESIGN_RESPONSE_R4.md §2.2)
 *
 * - 입력 멈춘 후 1500ms debounce → save 호출
 * - status: idle | pending | saved | error
 * - savedAt timestamp 갱신
 * - 시계 표시는 useElapsedLabel로 10초 단위 갱신
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

interface AutosaveOptions<T> {
  data: T;
  /** save 함수 — Promise 반환 (실패 시 throw) */
  onSave: (data: T) => Promise<void>;
  /** debounce ms (기본 1500) */
  delay?: number;
  /** 활성화 여부 (mode === 'create' 등에서 false로 비활성) */
  enabled?: boolean;
  /** 변경 감지 키 (변경되지 않으면 저장 안 함) */
  dirtyKey: string;
}

export function useAutosave<T>({ data, onSave, delay = 1500, enabled = true, dirtyKey }: AutosaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const lastSavedKeyRef = useRef<string>(dirtyKey);
  const timerRef = useRef<number | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const performSave = useCallback(async (snapshot: T) => {
    setStatus('pending');
    try {
      await onSaveRef.current(snapshot);
      lastSavedKeyRef.current = dirtyKey;
      setSavedAt(new Date());
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, [dirtyKey]);

  // dirtyKey 변경 감지 → debounce save
  useEffect(() => {
    if (!enabled) return;
    if (lastSavedKeyRef.current === dirtyKey) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      performSave(data);
    }, delay);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // data는 매 렌더 새 객체일 수 있으므로 dirtyKey만 의존성으로
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirtyKey, enabled, delay, performSave]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    await performSave(data);
  }, [data, performSave]);

  const isDirty = lastSavedKeyRef.current !== dirtyKey;

  return { status, savedAt, saveNow, isDirty };
}

/**
 * "Ns 전 저장됨" 라벨 자동 갱신 (10초 단위)
 */
export function useElapsedLabel(savedAt: Date | null): string {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!savedAt) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 10_000);
    return () => window.clearInterval(id);
  }, [savedAt]);

  if (!savedAt) return '';
  const diff = Math.floor((Date.now() - savedAt.getTime()) / 1000);
  if (diff < 5) return '방금 저장됨';
  if (diff < 60) return `${diff}초 전 저장됨`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전 저장됨`;
  return `${Math.floor(diff / 3600)}시간 전 저장됨`;
}
