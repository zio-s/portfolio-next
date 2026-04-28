-- ============================================================================
-- Migration 001: posts.category 컬럼 추가
-- ----------------------------------------------------------------------------
-- 작성: 2026-04-28
-- 참조: blog-n/handoff/DESIGN_RESPONSE.md §3.1 (A안 채택, 6개 카테고리 확정)
--
-- 실행 환경: Supabase SQL Editor
-- 트랜잭션 안전: 각 단계가 idempotent하도록 작성. 두 번 실행해도 안전.
-- 롤백: 파일 하단 ROLLBACK 섹션 참조 (주석 처리됨)
-- ============================================================================

-- 1) 컬럼 추가 (없을 때만). default 'daily'로 기존 행 자동 백필.
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'daily';

-- 2) CHECK 제약: 6개 slug만 허용
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'posts_category_check'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_category_check
      CHECK (category IN ('frontend', 'react', 'typescript', 'design', 'tools', 'daily'));
  END IF;
END$$;

-- 3) 인덱스 (사이드바 카테고리별 카운트, /blog?cat= 필터에 사용)
CREATE INDEX IF NOT EXISTS posts_category_idx ON public.posts (category);

-- 4) 기존 글 백필 — tags[0]이 6개 slug 중 하나면 해당 값으로 설정
--    소문자로 비교하여 'React' / 'react' 모두 매치
UPDATE public.posts
SET category = lower(tags[1])
WHERE
  array_length(tags, 1) >= 1
  AND lower(tags[1]) IN ('frontend', 'react', 'typescript', 'design', 'tools', 'daily')
  AND category = 'daily';  -- DEFAULT 'daily' 행만 갱신, 이미 다른 값이면 보존

-- 5) post_stats 뷰 갱신 — category 컬럼이 select * 로 자동 노출되도록 재생성
--    (post_stats 정의를 모르면 우선 SELECT 결과만 확인하고 실제 정의에 맞게 추가 필요)
--
-- 만약 post_stats가 'SELECT p.*, ...' 형태면 별도 작업 불필요.
-- 'SELECT p.id, p.title, ...' 처럼 컬럼을 명시했다면 다음과 같이 재생성:
--
-- CREATE OR REPLACE VIEW public.post_stats AS
-- SELECT
--   p.id, p.post_number, p.title, p.content, p.excerpt, p.status,
--   p.category,                  -- 신규
--   p.tags, p.created_at, p.updated_at, p.published_at, p.author_id,
--   COALESCE(l.likes_count, 0)   AS likes_count,
--   COALESCE(v.views_count, 0)   AS views_count,
--   COALESCE(c.comments_count, 0) AS comments_count
-- FROM public.posts p
-- LEFT JOIN (...) l ON ...
-- LEFT JOIN (...) v ON ...
-- LEFT JOIN (...) c ON ...;

-- ============================================================================
-- 검증 쿼리 (실행 후 결과 확인)
-- ============================================================================
-- 카테고리 분포 확인
SELECT category, COUNT(*) AS post_count
FROM public.posts
GROUP BY category
ORDER BY post_count DESC;

-- 6개 외 값이 있는지 확인 (없어야 정상)
SELECT id, title, category
FROM public.posts
WHERE category NOT IN ('frontend', 'react', 'typescript', 'design', 'tools', 'daily');

-- ============================================================================
-- ROLLBACK (필요 시 — 위 단계를 모두 되돌림)
-- ============================================================================
-- ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_category_check;
-- DROP INDEX IF EXISTS public.posts_category_idx;
-- ALTER TABLE public.posts DROP COLUMN IF EXISTS category;
