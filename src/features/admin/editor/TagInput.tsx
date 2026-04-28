'use client';

/**
 * Tag chip input (DESIGN_RESPONSE_R4.md §2.3)
 *
 * - Enter / "," → 칩 추가
 * - 빈 input + Backspace → 마지막 칩 삭제
 * - 자동완성: suggestions 중 contains 검색, top 5
 * - Esc → 자동완성 닫기
 * - 최대 8개
 */

import { useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';

const MAX_TAGS = 8;

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  /** 자동완성 후보 (전체 글의 모든 태그) */
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({ value, onChange, suggestions = [], placeholder = '태그 추가', disabled }: TagInputProps) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_TAGS - value.length;
  const isMax = remaining <= 0;

  const filteredSuggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return suggestions
      .filter((s) => s.toLowerCase().includes(q) && !value.includes(s))
      .slice(0, 5);
  }, [input, suggestions, value]);

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,/g, '').toLowerCase();
    if (!tag) return;
    if (value.includes(tag)) { setInput(''); return; }
    if (isMax) return;
    onChange([...value, tag]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      e.preventDefault();
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 cursor-text"
        style={{
          background: 'var(--blog-card)',
          border: '1px solid var(--blog-border)',
          borderRadius: 6,
          minHeight: 36,
        }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="group inline-flex items-center gap-1 blog-mono text-[11px] rounded px-2 py-0.5"
            style={{ background: 'var(--blog-accent-soft)', color: 'var(--blog-accent)' }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="opacity-60 hover:opacity-100"
              aria-label={`${tag} 제거`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={isMax ? `최대 ${MAX_TAGS}개` : placeholder}
          disabled={disabled || isMax}
          className="flex-1 min-w-[80px] bg-transparent border-0 outline-none text-[13px]"
          style={{ color: 'var(--blog-fg)', fontFamily: 'var(--blog-font-sans)' }}
        />
      </div>

      {/* 자동완성 */}
      {focused && filteredSuggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-1 z-[1100] py-1 overflow-hidden"
          style={{
            background: 'var(--blog-card)',
            border: '1px solid var(--blog-border)',
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,.4)',
          }}
        >
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
              className="w-full text-left blog-mono text-[12px] px-3 py-1.5 hover:bg-[var(--blog-accent-soft)] transition-colors"
              style={{ color: 'var(--blog-fg)' }}
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
