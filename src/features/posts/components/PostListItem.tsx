'use client';

import { useNavigate } from 'react-router-dom';
import { Clock, Edit, Eye, Heart, MessageCircle, Trash2 } from 'lucide-react';
import type { Post } from '@/store/types';
import { routeHelpers } from '@/router/routes';
import { calcReadMinutes, deriveCategory, formatBlogDate, isNewPost } from '@/lib/blog';

interface PostListItemProps {
  post: Post;
  /** 관리자: status 뱃지 + 우측 상단 수정/삭제 아이콘 노출 */
  isAdmin?: boolean;
  onDelete?: (post: Post) => void;
}

export function PostListItem({ post, isAdmin = false, onDelete }: PostListItemProps) {
  const navigate = useNavigate();
  const cat = deriveCategory(post);
  const readMin = calcReadMinutes(post.content);
  const dateRaw = post.publishedAt || post.published_at || post.createdAt || post.created_at;
  const isNew = isNewPost(dateRaw);

  const onClick = () => navigate(routeHelpers.blogDetail(post.post_number));

  return (
    <article
      onClick={onClick}
      className="blog-row group relative"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
    >
      {/* Category + new dot + status badge (admin) + admin actions */}
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
        {isAdmin && post.status !== 'published' && (
          <span
            className="blog-mono text-[10px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
            style={{
              background: post.status === 'draft' ? 'rgba(148,163,184,0.12)' : 'rgba(244,63,94,0.12)',
              color: post.status === 'draft' ? 'var(--blog-fg-muted)' : 'var(--blog-heart)',
              border: `1px solid ${post.status === 'draft' ? 'var(--blog-border)' : 'rgba(244,63,94,0.3)'}`,
            }}
          >
            {post.status === 'draft' ? '초안' : post.status === 'archived' ? '보관' : post.status}
          </span>
        )}

        {/* Admin actions — 항상 노출, 미니멀 (수정 / 삭제) */}
        {isAdmin && (
          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(routeHelpers.blogEdit(post.id));
              }}
              aria-label="수정"
              title="수정"
              className="inline-flex items-center justify-center w-7 h-7 rounded transition-colors hover:bg-white/5"
              style={{ color: 'var(--blog-fg-subtle)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--blog-accent)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--blog-fg-subtle)'; }}
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(post);
              }}
              aria-label="삭제"
              title="삭제"
              className="inline-flex items-center justify-center w-7 h-7 rounded transition-colors hover:bg-white/5"
              style={{ color: 'var(--blog-fg-subtle)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--blog-heart)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--blog-fg-subtle)'; }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
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
