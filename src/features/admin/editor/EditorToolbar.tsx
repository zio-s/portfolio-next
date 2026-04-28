'use client';

/**
 * 56px 상단 툴바 (DESIGN_RESPONSE_R4.md §2.1 / §2.2 / §2.5)
 */

import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SaveStatus } from './useAutosave';
import { useElapsedLabel } from './useAutosave';

interface EditorToolbarProps {
  title: string;
  status: 'draft' | 'published';
  saveStatus: SaveStatus;
  savedAt: Date | null;
  /** save error 시 재시도 */
  onRetrySave?: () => void;
  /** "발행" 또는 "수정 사항 발행" */
  onPublish: () => void;
  publishing?: boolean;
  backHref?: string;
}

export function EditorToolbar({
  title, status, saveStatus, savedAt, onRetrySave, onPublish, publishing, backHref = '/blog',
}: EditorToolbarProps) {
  const elapsed = useElapsedLabel(savedAt);
  const publishLabel = status === 'published' ? '수정 사항 발행' : '발행';

  return (
    <header
      className="h-14 flex items-center gap-3 px-3 lg:px-5"
      style={{
        background: 'var(--blog-bg)',
        borderBottom: '1px solid var(--blog-border)',
        flexShrink: 0,
      }}
    >
      <Link to={backHref} className="inline-flex items-center gap-1 text-[13px] hover:text-[var(--blog-accent)] transition-colors" style={{ color: 'var(--blog-fg-muted)' }}>
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">글 목록</span>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] truncate" style={{ color: 'var(--blog-fg)' }}>
          {title || 'Untitled'}
        </div>
        <div className="blog-mono text-[10.5px] uppercase tracking-[0.08em]" style={{ color: 'var(--blog-fg-subtle)' }}>
          {status === 'draft' ? 'draft' : 'published'}
        </div>
      </div>

      {/* Save status */}
      <SaveLabel status={saveStatus} elapsed={elapsed} onRetry={onRetrySave} />

      <button
        type="button"
        onClick={onPublish}
        disabled={publishing}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-md px-4 py-2 disabled:opacity-50"
        style={{
          background: 'var(--blog-accent)',
          color: '#fff',
          border: 'none',
        }}
      >
        {publishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span>{publishLabel}</span>
      </button>
    </header>
  );
}

function SaveLabel({ status, elapsed, onRetry }: { status: SaveStatus; elapsed: string; onRetry?: () => void }) {
  if (status === 'idle') {
    return (
      <span className="hidden sm:inline blog-mono text-[12px]" style={{ color: 'var(--blog-fg-subtle)' }}>
        변경사항 없음
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 blog-mono text-[12px]" style={{ color: 'var(--blog-fg-muted)' }}>
        <Loader2 className="w-3 h-3 animate-spin" />
        저장 중…
      </span>
    );
  }
  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="blog-mono text-[12px] underline"
        style={{ color: 'var(--blog-heart)' }}
      >
        ⚠ 저장 실패 · 재시도
      </button>
    );
  }
  // saved
  return (
    <span className="hidden sm:inline blog-mono text-[12px]" style={{ color: 'var(--blog-fg-muted)' }}>
      {elapsed || '저장됨'}
    </span>
  );
}
