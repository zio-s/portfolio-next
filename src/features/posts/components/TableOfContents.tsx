'use client';

/**
 * 본문 markdown의 h2/h3 자동 추출 + 슬러그 id 부여 → 목차
 *
 * variant:
 *  - 'floating' (기본): xl(1280px)+에서만 보이는 우측 sticky 목차
 *  - 'inline': lg 미만에서 본문 위 details accordion (mobile.jsx 참조)
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
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [containerSelector, contentKey]);

  if (items.length < minItems) return null;

  if (variant === 'inline') {
    return (
      <details
        className="lg:hidden mt-4 px-3.5 py-2.5"
        style={{ background: 'var(--blog-card)', border: '1px solid var(--blog-border)', borderRadius: 8 }}
      >
        <summary
          className="flex items-center justify-between cursor-pointer select-none"
          style={{ listStyle: 'none' }}
        >
          <span className="blog-uppercase-label text-[10px]">On this page</span>
          <span className="blog-mono text-[12px]" style={{ color: 'var(--blog-fg-muted)' }}>▾ {items.length}</span>
        </summary>
        <div className="mt-2.5 flex flex-col gap-1.5 text-[12px]">
          {items.map((it) => {
            const active = activeId === it.id;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
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
