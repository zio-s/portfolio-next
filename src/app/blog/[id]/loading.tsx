/**
 * Blog Detail Loading Fallback
 *
 * Next.js App Router가 server fetch (getPostByNumber) 동안 자동 표시.
 * 미니멀 다크 톤 + accent 스피너 + 본문 컬럼 폭 placeholder.
 */

export default function BlogDetailLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 xl:flex xl:items-start xl:justify-center">
      <article className="w-full max-w-[720px] mx-auto pt-8 pb-20 animate-pulse">
        {/* Back link placeholder */}
        <div className="h-4 w-20 mb-8 rounded" style={{ background: 'var(--blog-border)' }} />

        {/* Category label */}
        <div className="h-3 w-24 mb-4 rounded" style={{ background: 'var(--blog-accent-soft)' }} />

        {/* Title — 2 lines */}
        <div className="space-y-3">
          <div className="h-10 w-full rounded" style={{ background: 'var(--blog-card)' }} />
          <div className="h-10 w-3/4 rounded" style={{ background: 'var(--blog-card)' }} />
        </div>

        {/* Meta */}
        <div className="flex gap-3 mt-6 pb-6" style={{ borderBottom: '1px solid var(--blog-border)' }}>
          <div className="h-3 w-16 rounded" style={{ background: 'var(--blog-border)' }} />
          <div className="h-3 w-12 rounded" style={{ background: 'var(--blog-border)' }} />
          <div className="h-3 w-12 rounded" style={{ background: 'var(--blog-border)' }} />
        </div>

        {/* Body placeholder — 6 lines */}
        <div className="mt-10 space-y-3">
          {[100, 95, 88, 92, 70, 85].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded"
              style={{ background: 'var(--blog-card)', width: `${w}%` }}
            />
          ))}
        </div>

        {/* Center spinner — 진짜 진행 표시 */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 py-8">
          <div className="blog-spinner" aria-label="불러오는 중" />
          <div className="blog-mono text-[11px]" style={{ color: 'var(--blog-fg-subtle)' }}>
            LOADING
          </div>
        </div>
      </article>
    </div>
  );
}
