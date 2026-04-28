'use client';

/**
 * 본문 markdown의 h2/h3 자동 추출 + 슬러그 id 부여 → 목차
 *
 * variant (DESIGN_RESPONSE_R3.md §2 — 3-tier 브레이크포인트):
 *  - 'inline' : 본문 위 details accordion. mobile/tablet/desktop(<1280px)에서 노출 (xl:hidden)
 *  - 'floating': 우측 sticky 목차. desktop-wide(≥1280px)에서만 노출 (hidden xl:block)
 *
 * 두 변형을 모두 마운트해도 OK — Tailwind responsive로 동시에 보이는 일 없음.
 *
 * 3개 미만이면 미표시 (작은 글에는 노이즈).
 *
 * IntersectionObserver로 현재 섹션 active.
 */

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  containerSelector?: string;
  variant?: 'floating' | 'inline';
  /** 미표시 임계값 (기본 3) */
  minItems?: number;
  /** 본문이 다시 렌더될 때 TOC 재수집 트리거 (보통 post.id) */
  contentKey?: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);

export function TableOfContents({
  containerSelector = '.blog-article',
  variant = 'floating',
  minItems = 3,
  contentKey,
}: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const root = document.querySelector(containerSelector);
    if (!root) return;
    const headings = Array.from(root.querySelectorAll('h2, h3')) as HTMLHeadingElement[];
    const list: TocItem[] = headings.map((el, i) => {
      const text = el.textContent ?? '';
      let id = el.id;
      if (!id) {
        id = `${slugify(text) || 'section'}-${i}`;
        el.id = id;
      }
      return { id, text, level: el.tagName === 'H2' ? 2 : 3 };
    });
    setItems(list);

    if (list.length === 0) return;

    // scroll-margin-top과 동일한 offset (헤더 60 + 여유 24)
    const HEADER_OFFSET = 84;

    /**
     * Active 결정: 헤더 라인(viewport top + HEADER_OFFSET) 위로 올라간 마지막 heading.
     * 즉 "현재 화면에 보이는 가장 최근 섹션의 heading".
     * IntersectionObserver는 heading 자체의 visibility만 보므로
     * 1번 heading 클릭 후 즉시 viewport에 들어오는 2번 heading을 잘못 잡을 수 있음.
     */
    let raf = 0;
    const update = () => {
      const threshold = HEADER_OFFSET + 1;
      let current = list[0]?.id ?? '';
      for (const it of list) {
        const el = document.getElementById(it.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= threshold) {
          current = it.id;
        } else {
          break;
        }
      }
      setActiveId(current);
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
  }, [containerSelector, contentKey]);

  if (items.length < minItems) return null;

  // 앵커 클릭 → smooth scroll. scroll-margin-top 84px가 자동 적용됨.
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // URL hash 갱신 (history에는 안 쌓이게 replace)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`);
    }
    setActiveId(id);
  };

  if (variant === 'inline') {
    return (
      <details
        className="xl:hidden mt-4 px-3.5"
        style={{ background: 'var(--blog-card)', border: '1px solid var(--blog-border)', borderRadius: 8 }}
      >
        <summary
          className="flex items-center justify-between cursor-pointer select-none h-11"
          style={{ listStyle: 'none' }}
        >
          <span className="blog-uppercase-label text-[10px]">On this page</span>
          <span className="blog-mono text-[12px]" style={{ color: 'var(--blog-fg-muted)' }}>▾ {items.length}</span>
        </summary>
        <div className="pb-2.5 flex flex-col gap-1.5 text-[12px]">
          {items.map((it) => {
            const active = activeId === it.id;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                onClick={(e) => handleAnchorClick(e, it.id)}
                className="block py-0.5"
                style={{
                  color: active ? 'var(--blog-accent)' : 'var(--blog-fg-muted)',
                  borderLeft: active ? '2px solid var(--blog-accent)' : '2px solid transparent',
                  paddingLeft: it.level === 2 ? 10 : 22,
                }}
              >
                {it.text}
              </a>
            );
          })}
        </div>
      </details>
    );
  }

  // floating
  return (
    <nav className="hidden xl:block sticky top-24 w-[200px] shrink-0 self-start ml-8" aria-label="목차">
      <div className="blog-uppercase-label mb-3">On this page</div>
      <ul className="flex flex-col gap-1.5 text-[12px]">
        {items.map((it) => {
          const active = activeId === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={(e) => handleAnchorClick(e, it.id)}
                className="block py-0.5 transition-colors"
                style={{
                  color: active ? 'var(--blog-accent)' : 'var(--blog-fg-muted)',
                  borderLeft: active ? '2px solid var(--blog-accent)' : '2px solid transparent',
                  paddingLeft: it.level === 2 ? 10 : 22,
                }}
              >
                {it.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
