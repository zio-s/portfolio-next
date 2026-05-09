'use client';

/**
 * Global Navigation Progress Bar (Linear/Vercel 톤)
 *
 * 라우팅 진행 상태를 화면 상단 2px 막대로 표시.
 *
 * 동작:
 * - document level 클릭 감지 → 내부 a[href] 또는 [data-nav] 클릭 시 progress 시작
 * - pathname/search 변화 감지 → 100% 후 200ms fade-out
 * - 진행 중에는 천천히 차오름 (80%까지, 마지막 20%는 navigation 완료 후)
 * - 동일 페이지로 navigation 한 경우 1.5s timeout으로 자동 종료
 *
 * 사용: MainLayout / AdminLayout에 한 번만 마운트하면 자동 작동.
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0); // 0 ~ 100
  const [active, setActive] = useState(false);
  const tickRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // 1) 클릭 감지 → progress 시작
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // modifier 키(새 탭 등) 무시
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('a[href], [data-nav]');
      if (!target) return;

      // a 태그면 href 검사
      if (target.tagName === 'A') {
        const a = target as HTMLAnchorElement;
        const href = a.getAttribute('href');
        if (!href) return;
        // 외부, hash, mailto, tel, javascript 무시
        if (/^(https?:|mailto:|tel:|javascript:|#)/i.test(href)) return;
        // target=_blank 무시
        if (a.target === '_blank') return;
      }

      startProgress();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startProgress = () => {
    // 이미 진행 중이면 다시 시작
    cleanupTick();
    cleanupTimeout();
    setActive(true);
    setProgress(15);
    // 천천히 80%까지 차오름
    tickRef.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 80) return p;
        // 남은 거리의 일부를 매 200ms 추가 (느려지는 곡선)
        const step = Math.max(1, (80 - p) * 0.12);
        return p + step;
      });
    }, 180);
    // 안전 timeout — 동일 페이지 navigation 등으로 pathname 안 바뀌는 경우
    timeoutRef.current = window.setTimeout(() => finishProgress(), 1500);
  };

  const finishProgress = () => {
    cleanupTick();
    cleanupTimeout();
    setProgress(100);
    window.setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 220);
  };

  const cleanupTick = () => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };
  const cleanupTimeout = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // 2) pathname / searchParams 변화 → 100% 후 사라짐
  useEffect(() => {
    if (active) finishProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // unmount cleanup
  useEffect(() => () => { cleanupTick(); cleanupTimeout(); }, []);

  if (!active) return null;

  return (
    <div
      className="nav-progress"
      style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      role="progressbar"
      aria-label="페이지 이동 중"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
