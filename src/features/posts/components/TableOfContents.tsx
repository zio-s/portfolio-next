'use client';

import { useEffect, useState } from 'react';

/**
 * 본문 markdown의 h2/h3를 자동 추출 → floating TOC
 * @media (min-width: 1280px)에서만 표시
 *
 * `containerSelector`로 본문 컨테이너를 지정 (기본 .blog-article).
 * IntersectionObserver로 현재 섹션 active 표시.
 */

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);

export function TableOfContents({ containerSelector = '.blog-article' }: { containerSelector?: string }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // 본문에서 heading 수집 + id 부여
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
          // 가장 위쪽에 있는 visible heading을 active로
          visible.sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [containerSelector]);

  if (items.length === 0) return null;

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
