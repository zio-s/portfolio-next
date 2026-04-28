'use client';

/**
 * MetaPanel — 좌측 메타데이터 (DESIGN_RESPONSE_R4.md §2.1)
 *
 * 입력: 카테고리 / 태그 / 발췌 / 썸네일 미리보기
 * lg+: 280px 좌측 컬럼 / mobile: tab 한 패널 풀폭
 */

import { BLOG_CATEGORIES, type BlogCategorySlug } from '@/config/categories';
import { TagInput } from './TagInput';
import { ThumbnailPicker } from './ThumbnailPicker';

interface MetaPanelProps {
  category: BlogCategorySlug;
  onCategoryChange: (slug: BlogCategorySlug) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  excerpt: string;
  onExcerptChange: (s: string) => void;
  status: 'draft' | 'published';
  onStatusChange: (s: 'draft' | 'published') => void;
  /** 자동완성용 — 전체 글의 태그 */
  tagSuggestions?: string[];
  /** 본문 markdown — 썸네일 자동 추출용 */
  content: string;
}

export function MetaPanel({
  category, onCategoryChange,
  tags, onTagsChange,
  excerpt, onExcerptChange,
  status, onStatusChange,
  tagSuggestions = [],
  content,
}: MetaPanelProps) {
  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6 lg:w-[280px] lg:shrink-0 lg:overflow-auto"
         style={{ borderRight: '1px solid var(--blog-border)' }}>
      {/* Status */}
      <Field label="Status">
        <div className="flex gap-1.5">
          {(['draft', 'published'] as const).map((s) => {
            const active = s === status;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                className="flex-1 text-[12px] py-1.5 rounded-md transition-colors"
                style={{
                  background: active ? 'var(--blog-accent-soft)' : 'var(--blog-card)',
                  color: active ? 'var(--blog-accent)' : 'var(--blog-fg-muted)',
                  border: `1px solid ${active ? 'var(--blog-accent)' : 'var(--blog-border)'}`,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {s === 'draft' ? '초안' : '발행'}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Category */}
      <Field label="Category">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as BlogCategorySlug)}
          className="w-full px-3 py-2 text-[13px] rounded-md outline-none focus:border-[var(--blog-accent)]"
          style={{
            background: 'var(--blog-card)',
            border: '1px solid var(--blog-border)',
            color: 'var(--blog-fg)',
            fontFamily: 'var(--blog-font-sans)',
          }}
        >
          {BLOG_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>
      </Field>

      {/* Tags */}
      <Field label="Tags">
        <TagInput
          value={tags}
          onChange={onTagsChange}
          suggestions={tagSuggestions}
          placeholder="태그 추가 (Enter)"
        />
      </Field>

      {/* Thumbnail */}
      <Field label="Thumbnail">
        <ThumbnailPicker content={content} />
      </Field>

      {/* Excerpt */}
      <Field label="Excerpt">
        <textarea
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          rows={4}
          placeholder="발췌 (미입력 시 본문 앞 150자 자동 사용)"
          className="w-full px-3 py-2 text-[13px] rounded-md outline-none focus:border-[var(--blog-accent)] resize-y"
          style={{
            background: 'var(--blog-card)',
            border: '1px solid var(--blog-border)',
            color: 'var(--blog-fg)',
            fontFamily: 'var(--blog-font-sans)',
            minHeight: 80,
          }}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="blog-uppercase-label text-[10px] mb-2">{label}</div>
      {children}
    </div>
  );
}
