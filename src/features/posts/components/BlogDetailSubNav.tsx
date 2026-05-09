'use client';

/**
 * Blog Detail Sub-Nav (sticky 36px, 헤더 아래)
 *
 * 좌:  ← 목록으로 (mono fg-muted, hover fg)
 *      ·
 *      카테고리 (mono accent uppercase)
 * 우:  진행률 % (mono fg-subtle)
 * 하단: 1px progress fill (왼→오 채워짐, accent)
 *
 * 기존 ReadingProgress + article 안 inline 백 링크를 한 곳에 통합.
 * 데스크톱/모바일 동일 패턴.
 */

import { useEffect, useRef, useState, type RefObject } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BlogDetailSubNavProps {
  backHref?: string;
  backLabel?: string;
  categoryLabel?: string;
  /** 본문 영역 ref — 진행률 계산 기준. 없으면 document scroll 기준 */
  articleRef?: RefObject<HTMLElement | null>;
}

export function BlogDetailSubNav({
  backHref = '/blog',
  backLabel = '목록으로',
  categoryLabel,
  articleRef,
}: BlogDetailSubNavProps) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const article = articleRef?.current;
      if (article) {
        const rect = article.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const start = top;
        const end = top + rect.height - window.innerHeight;
        const span = end - start;
        if (span <= 0) {
          setProgress(window.scrollY >= top ? 1 : 0);
          return;
        }
        setProgress(Math.min(1, Math.max(0, (window.scrollY - start) / span)));
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
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
    <div
      className="sticky z-30"
      style={{
        top: 'var(--blog-header-h, 60px)',
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

      {/* 하단 1px progress fill — border와 같은 위치에 깔리지 않고, 그 아래 1px */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: -1,
          height: 1,
          background: 'transparent',
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
    </div>
  );
}
