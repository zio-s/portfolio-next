'use client';

/**
 * MarkdownEditor — textarea 기반 (DESIGN_RESPONSE_R4.md §2.6)
 *
 * CodeMirror 도입은 향후. 현재는 mono textarea + Tab indent 핸들링으로 충분.
 */

import { useRef } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder = '본문을 입력하세요…' }: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Tab으로 indent 2-space 삽입 (form submit 방지)
  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = `${value.slice(0, start)}  ${value.slice(end)}`;
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      spellCheck={false}
      className="w-full h-full resize-none outline-none p-5 lg:p-6"
      style={{
        background: 'var(--blog-bg)',
        color: 'var(--blog-fg)',
        fontFamily: 'var(--blog-font-mono)',
        fontSize: 14,
        lineHeight: 1.7,
        border: 'none',
        caretColor: 'var(--blog-accent)',
      }}
    />
  );
}
