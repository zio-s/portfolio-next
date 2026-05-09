'use client';

/**
 * Blog Detail Sub-Nav (sticky 36px, 헤더 아래)
 *
 * - sub-nav 본체: 스크롤 ↓ 시 자동 숨김 (translateY -100%), 스크롤 ↑ 시 등장
 * - 진행률 1px 막대: 별도 sticky로 항상 노출 (sub-nav와 독립)
 * - 본문 침범 최소화하면서 ← 목록 / 카테고리 / % 정보는 필요할 때 항상 접근
 *
 * 데스크톱/모바일 동일 패턴.
 */

import { useEffect, useRef, useState, type RefObject } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BlogDetailSubNavProps {
  backHref?: string;
  backLabel?: string;
  categoryLabel?: string;
  /** 본문 영역 ref — 진행률 계산 기준 */
  articleRef?: RefObject<HTMLElement | null>;
}

export function BlogDetailSubNav({
  backHref = '/blog',
  backLabel = '목록으로',
  categoryLabel,
  articleRef,
}: BlogDetailSubNavProps) {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastYRef = useRef(0);

  useEffect(() => {
    const update = () => {
      // 진행률 계산
      const article = articleRef?.current;
      let p = 0;
      if (article) {
        const rect = article.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const span = rect.height - window.innerHeight;
        if (span > 0) {
          p = Math.min(1, Math.max(0, (window.scrollY - top) / span));
        } else {
          p = window.scrollY >= top ? 1 : 0;
        }
      } else {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      }
      setProgress(p);

      // 스크롤 방향 감지 — 8px 임계로 깜빡임 방지
      const y = window.scrollY;
      if (y < 120) {
        // 최상단 부근에선 항상 노출
        setHidden(false);
      } else if (y > lastYRef.current + 8) {
        setHidden(true);  // 다운
      } else if (y < lastYRef.current - 8) {
        setHidden(false); // 업
      }
      lastYRef.current = y;
    };
    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [articleRef]);

  const pct = Math.round(progress * 100);

  return (
    <>
      {/* Sub-nav (36px) — 스크롤 방향에 따라 슬라이드 */}
      <div
        className="sticky z-30"
        style={{
          top: 'var(--blog-header-h, 60px)',
          transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        <div
          className="flex items-center h-9 px-4 lg:px-8 gap-3"
          style={{
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--blog-border)',
          }}
        >
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[12.5px] transition-colors hover:text-[var(--blog-fg)]"
            style={{ color: 'var(--blog-fg-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>

          {categoryLabel && (
            <>
              <span
                aria-hidden
                className="inline-block w-px h-3"
                style={{ background: 'var(--blog-border)' }}
              />
              <span
                className="blog-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] truncate"
                style={{ color: 'var(--blog-accent)' }}
              >
                {categoryLabel}
              </span>
            </>
          )}

          <div className="flex-1" />

          <span
            className="blog-mono text-[11px] tabular-nums shrink-0"
            style={{ color: 'var(--blog-fg-subtle)' }}
            aria-label={`읽기 진행률 ${pct}%`}
          >
            {pct}%
          </span>
        </div>
      </div>

      {/* 진행률 1px 막대 — sub-nav와 독립적으로 항상 노출 */}
      <div
        className="sticky z-30 pointer-events-none"
        style={{
          top: `calc(var(--blog-header-h, 60px))`,
          height: 1,
          marginBottom: -1,
        }}
        aria-hidden
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--blog-accent)',
            boxShadow: '0 0 6px var(--blog-accent)',
            transition: 'width 80ms linear',
          }}
        />
      </div>
    </>
  );
}
