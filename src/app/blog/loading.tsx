/**
 * Blog List Loading Fallback
 *
 * /blog는 force-dynamic이라 서버 fetch가 끝나야 응답이 온다.
 * 그동안 Next.js가 이 스켈레톤을 즉시 보여줘, 메뉴 클릭 직후
 * 화면이 멈춘 것처럼 보이지 않게 한다. (blog/[id]/loading.tsx와 같은 톤)
 */

export default function BlogListLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 pt-8 pb-20 animate-pulse">
      {/* 정렬 탭 placeholder */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-4 w-24 rounded" style={{ background: 'var(--blog-border)' }} />
        <div className="flex gap-2">
          {[48, 40, 56].map((w, i) => (
            <div key={i} className="h-7 rounded-full" style={{ background: 'var(--blog-card)', width: w }} />
          ))}
        </div>
      </div>

      {/* 글 목록 placeholder — 4개 행 */}
      <div className="space-y-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="pb-6" style={{ borderBottom: '1px solid var(--blog-border)' }}>
            <div className="h-3 w-16 mb-3 rounded" style={{ background: 'var(--blog-accent-soft)' }} />
            <div className="h-6 w-3/4 mb-3 rounded" style={{ background: 'var(--blog-card)' }} />
            <div className="h-3 w-full mb-2 rounded" style={{ background: 'var(--blog-card)' }} />
            <div className="h-3 w-2/3 rounded" style={{ background: 'var(--blog-card)' }} />
            <div className="flex gap-3 mt-4">
              <div className="h-3 w-14 rounded" style={{ background: 'var(--blog-border)' }} />
              <div className="h-3 w-10 rounded" style={{ background: 'var(--blog-border)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* 진행 표시 스피너 */}
      <div className="mt-12 flex flex-col items-center justify-center gap-3 py-8">
        <div className="blog-spinner" aria-label="불러오는 중" />
        <div className="blog-mono text-[11px]" style={{ color: 'var(--blog-fg-subtle)' }}>
          LOADING
        </div>
      </div>
    </div>
  );
}
