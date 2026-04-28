'use client';

/**
 * Related Posts (DESIGN_RESPONSE_R4.md §1)
 *
 * 위치: About author 카드 아래, 이전·다음 카드 위
 * 노출 조건: 관련 글 3개 이상일 때만 (미만이면 unmount, 빈 상태 X)
 * 그리드: mobile 1-col / lg+ 3-col
 */

import { Link } from 'react-router-dom';
import type { Post } from '@/store/types';
import { calcReadMinutes, deriveCategory, formatBlogDate, getRelatedPosts } from '@/lib/blog';
import { routeHelpers } from '@/router/routes';

interface RelatedPostsProps {
  post: Post;
  allPosts: Post[];
  n?: number;
}

export function RelatedPosts({ post, allPosts, n = 3 }: RelatedPostsProps) {
  const related = getRelatedPosts(post, allPosts, n);

  // §1.4 — 3개 미만이면 섹션 자체 unmount
  if (related.length < 3) return null;

  return (
    <section className="mt-8">
      <div className="blog-uppercase-label mb-4">Related Posts</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        {related.map((p) => {
          const cat = deriveCategory(p);
          const date = formatBlogDate(p.publishedAt || p.published_at || p.createdAt || p.created_at);
          const read = calcReadMinutes(p.content);
          return (
            <Link
              key={p.id}
              to={routeHelpers.blogDetail(p.post_number)}
              className="blog-related-card flex flex-col p-[18px] lg:p-5 transition-all duration-150 ease-out"
              style={{
                background: 'var(--blog-card)',
                border: '1px solid var(--blog-border)',
                borderRadius: 8,
                minHeight: 140,
              }}
            >
              <span
                className="blog-mono text-[11px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: 'var(--blog-accent)' }}
              >
                {cat.label}
              </span>
              <h4
                className="text-[15px] lg:text-[16px] font-semibold mt-3 leading-[1.35] tracking-[-0.01em]"
                style={{
                  color: 'var(--blog-fg)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {p.title}
              </h4>
              <div className="flex-1" />
              <div className="blog-mono text-[11px] mt-3 inline-flex items-center gap-1.5" style={{ color: 'var(--blog-fg-subtle)' }}>
                <span>{date.slice(5)}</span>
                <span style={{ color: 'var(--blog-border)' }}>·</span>
                <span>{read}분</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
