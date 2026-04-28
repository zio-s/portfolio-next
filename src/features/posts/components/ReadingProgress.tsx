'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * 페이지 상단 fixed 2px 진행률 바.
 *
 * articleRef를 넘기면 해당 element의 가시 영역을 기준으로 진행률 계산
 *  → 댓글/푸터까지 포함된 전체 페이지 스크롤 대비 정확. (DESIGN_RESPONSE §4.4)
 * articleRef가 없으면 fallback으로 document scroll 기준.
 */
interface ReadingProgressProps {
  articleRef?: RefObject<HTMLElement | null>;
}

export function ReadingProgress({ articleRef }: ReadingProgressProps = {}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const article = articleRef?.current;
      if (article) {
        const rect = article.getBoundingClientRect();
        const articleTop = rect.top + window.scrollY;
        // article 본문이 viewport 하단에 닿기 시작 ~ article 끝이 viewport 상단에 도달까지를 0~1로
        const start = articleTop;
        const end = articleTop + rect.height - window.innerHeight;
        const span = end - start;
        if (span <= 0) {
          setProgress(window.scrollY >= articleTop ? 1 : 0);
          return;
        }
        const ratio = Math.min(1, Math.max(0, (window.scrollY - start) / span));
        setProgress(ratio);
        return;
      }
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollHeight)) : 0;
      setProgress(ratio);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [articleRef]);

  return (
    <div className="blog-progress" role="progressbar" aria-label="읽기 진행률" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="blog-progress-fill" style={{ transform: `scaleX(${progress})`, width: '100%' }} />
    </div>
  );
}
