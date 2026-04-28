'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface LikeCTAProps {
  liked: boolean;
  count: number;
  disabled?: boolean;
  onToggle: () => void;
}

export function LikeCTA({ liked, count, disabled, onToggle }: LikeCTAProps) {
  const [pulse, setPulse] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setPulse(true);
    setTimeout(() => setPulse(false), 220);
    onToggle();
  };

  return (
    <div
      className="text-center mt-8 px-6 py-6 sm:px-8 sm:py-8"
      style={{
        background: 'var(--blog-card)',
        border: '1px solid var(--blog-border)',
        borderRadius: 12,
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={liked}
        aria-label={liked ? '좋아요 취소' : '좋아요'}
        className="inline-flex items-center justify-center transition-colors disabled:opacity-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full"
        style={{
          background: liked ? 'rgba(244,63,94,0.12)' : 'var(--blog-accent-soft)',
          border: `1px solid ${liked ? 'var(--blog-heart)' : 'var(--blog-accent)'}`,
          color: liked ? 'var(--blog-heart)' : 'var(--blog-accent)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span className={pulse ? 'blog-heart-pulse inline-flex' : 'inline-flex'}>
          <Heart className="w-5 h-5 sm:w-[22px] sm:h-[22px]" fill={liked ? 'currentColor' : 'none'} />
        </span>
      </button>
      <div className="text-xl sm:text-2xl font-bold mt-3" style={{ color: 'var(--blog-fg)' }}>{count}</div>
      <div className="text-[12px] sm:text-[13px] mt-1" style={{ color: 'var(--blog-fg-muted)' }}>이 글이 도움이 되셨나요?</div>
    </div>
  );
}
