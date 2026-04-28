'use client';

/**
 * Preview — 실제 글과 동일한 .blog-article 클래스로 렌더 (DESIGN_RESPONSE_R4.md §2.6)
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PreviewProps {
  title: string;
  content: string;
}

export function Preview({ title, content }: PreviewProps) {
  return (
    <div
      className="overflow-auto"
      style={{ background: 'var(--blog-bg)', borderLeft: '1px solid var(--blog-border)' }}
    >
      <div className="max-w-[720px] mx-auto p-5 lg:p-8">
        <h1 className="text-[28px] lg:text-[32px] font-bold leading-[1.2] tracking-[-0.025em]" style={{ color: 'var(--blog-fg)' }}>
          {title || '제목 없음'}
        </h1>
        <div className="blog-article max-w-none mt-6">
          {content.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !className;
                  return isInline ? (
                    <code className={className} {...props}>{children}</code>
                  ) : (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match ? match[1] : 'text'}
                      customStyle={{ margin: '1.5rem 0', borderRadius: '0.5rem', fontSize: '0.875rem', lineHeight: '1.6' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="blog-mono text-[12px]" style={{ color: 'var(--blog-fg-subtle)' }}>본문이 비어있습니다…</p>
          )}
        </div>
      </div>
    </div>
  );
}
