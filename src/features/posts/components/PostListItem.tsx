'use client';

import { useNavigate } from 'react-router-dom';
import { Clock, Eye, Heart, MessageCircle } from 'lucide-react';
import type { Post } from '@/store/types';
import { routeHelpers } from '@/router/routes';
import { calcReadMinutes, deriveCategory, formatBlogDate, isNewPost } from '@/lib/blog';

interface PostListItemProps {
  post: Post;
}

export function PostListItem({ post }: PostListItemProps) {
  const navigate = useNavigate();
  const cat = deriveCategory(post);
  const readMin = calcReadMinutes(post.content);
  const dateRaw = post.publishedAt || post.published_at || post.createdAt || post.created_at;
  const isNew = isNewPost(dateRaw);

  const onClick = () => navigate(routeHelpers.blogDetail(post.post_number));

  return (
    <article
      onClick={onClick}
      className="blog-row group"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
    >
      {/* Category + new dot */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="blog-mono text-[11px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--blog-accent)' }}
        >
          {cat.label}
        </span>
        {isNew && (
          <span
            className="w-[5px] h-[5px] rounded-full"
            style={{ background: 'var(--blog-accent)', boxShadow: '0 0 8px var(--blog-accent)' }}
            aria-label="새 글"
          />
        )}
      </div>

      {/* Title */}
      <h2
        className="blog-row-title text-[20px] font-semibold tracking-tight leading-snug m-0"
        style={{ color: 'var(--blog-fg)' }}
      >
        {post.title}
      </h2>

      {/* Excerpt */}
      {post.excerpt && (
        <p
          className="text-[14px] leading-[1.65] mt-2.5 mb-3.5"
          style={{
            color: 'var(--blog-fg-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.excerpt}
        </p>
      )}

      {/* Meta */}
      <div className="blog-mono flex items-center flex-wrap gap-3 text-[12px] mb-3" style={{ color: 'var(--blog-fg-subtle)' }}>
        <span>{formatBlogDate(dateRaw)}</span>
        <span style={{ color: 'var(--blog-border)' }}>·</span>
        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {readMin}분</span>
        <span style={{ color: 'var(--blog-border)' }}>·</span>
        <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {(post.views_count ?? 0).toLocaleString()}</span>
        <span style={{ color: 'var(--blog-border)' }}>·</span>
        <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes_count ?? 0}</span>
        <span style={{ color: 'var(--blog-border)' }}>·</span>
        <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments_count ?? 0}</span>
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 5).map((t) => (
            <span key={t} className="blog-tag">#{t}</span>
          ))}
          {post.tags.length > 5 && (
            <span className="blog-mono text-[11px]" style={{ color: 'var(--blog-fg-subtle)' }}>+{post.tags.length - 5}</span>
          )}
        </div>
      )}
    </article>
  );
}
