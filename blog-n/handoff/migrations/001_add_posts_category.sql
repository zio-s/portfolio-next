-- ============================================================================
-- Migration 001: posts.category 컬럼 추가
-- ----------------------------------------------------------------------------
-- 작성: 2026-04-28
-- 적용: 2026-04-28 (Supabase project: smgwzotugeqzahcxicsa)
-- 마이그레이션 ID: 20260428071756_add_posts_category
-- 참조: blog-n/handoff/DESIGN_RESPONSE.md §3.1 (A안, 6개 카테고리 확정)
--
-- 백필 결과 (production):
--   daily:      12 (default)
--   react:       7 (tags 배열 매칭)
--   frontend:    2
--   typescript:  1
--   total:      22
--
-- 실행 환경: Supabase SQL Editor (또는 supabase db push)
-- 트랜잭션 안전: idempotent — 두 번 실행해도 안전
-- 롤백: 파일 하단 ROLLBACK 섹션 참조 (주석 처리됨)
-- ============================================================================

-- 1. 컬럼 추가 (없을 때만). default 'daily'로 기존 행 자동 백필
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'daily';

-- 2. CHECK 제약: 6개 slug만 허용
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

-- 3. 인덱스 (사이드바 카테고리별 카운트, /blog?cat= 필터에 사용)
CREATE INDEX IF NOT EXISTS posts_category_idx ON public.posts (category);

-- 4. 백필 — tags 배열에서 우선순위 매칭 (frontend > react > typescript > design > tools)
--    이미 다른 값이면 건드리지 않음 (default 'daily' 행만 갱신)
UPDATE public.posts
SET category = matched.cat
FROM (
  SELECT
    p.id,
    COALESCE(
      (SELECT lower(t) FROM unnest(p.tags) t WHERE lower(t) = 'frontend' LIMIT 1),
      (SELECT lower(t) FROM unnest(p.tags) t WHERE lower(t) = 'react' LIMIT 1),
      (SELECT lower(t) FROM unnest(p.tags) t WHERE lower(t) = 'typescript' LIMIT 1),
      (SELECT lower(t) FROM unnest(p.tags) t WHERE lower(t) = 'design' LIMIT 1),
      (SELECT lower(t) FROM unnest(p.tags) t WHERE lower(t) = 'tools' LIMIT 1)
    ) AS cat
  FROM public.posts p
) matched
WHERE public.posts.id = matched.id
  AND matched.cat IS NOT NULL
  AND public.posts.category = 'daily';

-- 5. post_stats 뷰 재생성 — DROP + CREATE
--    (CREATE OR REPLACE는 컬럼 위치 변경 불가하므로 DROP + CREATE)
--    RPC 함수(get_post_with_user_data, get_post_by_number_with_user_data)는
--    row_to_json(ps.*)로 뷰 사용 → 뷰 재생성 후 자동으로 category 반영됨
DROP VIEW IF EXISTS public.post_stats;
CREATE VIEW public.post_stats AS
SELECT
  p.id,
  p.post_number,
  p.title,
  p.content,
  p.excerpt,
  p.status,
  p.author_id,
  p.category,
  p.tags,
  p.published_at,
  p.created_at,
  p.updated_at,
  COALESCE(count(DISTINCT pl.id), 0::bigint)::integer AS likes_count,
  COALESCE(count(DISTINCT pv.id), 0::bigint)::integer AS views_count,
  COALESCE(count(DISTINCT
    CASE WHEN pc.status = 'approved'::text THEN pc.id ELSE NULL::uuid END
  ), 0::bigint)::integer AS comments_count
FROM public.posts p
LEFT JOIN public.post_likes pl ON p.id = pl.post_id
LEFT JOIN public.post_views pv ON p.id = pv.post_id
LEFT JOIN public.post_comments pc ON p.id = pc.post_id
GROUP BY p.id, p.post_number, p.title, p.content, p.excerpt, p.status, p.author_id, p.category, p.tags, p.published_at, p.created_at, p.updated_at
ORDER BY p.published_at DESC NULLS LAST;

-- ============================================================================
-- 검증 쿼리 (실행 후 결과 확인)
-- ============================================================================
-- 카테고리 분포
-- SELECT category, COUNT(*) AS post_count FROM public.posts GROUP BY category ORDER BY post_count DESC;

-- 6개 외 값 (CHECK가 막아 0이어야 정상)
-- SELECT count(*) AS invalid_count FROM public.posts
--   WHERE category NOT IN ('frontend', 'react', 'typescript', 'design', 'tools', 'daily');

-- post_stats에 category 컬럼 노출 확인
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='post_stats' ORDER BY ordinal_position;

-- RPC 함수가 category 반환하는지
-- SELECT (get_post_by_number_with_user_data(1, 'test')::json->>'category') AS rpc_category;

-- 인덱스 / CHECK 제약
-- SELECT indexname FROM pg_indexes WHERE tablename='posts' AND indexname='posts_category_idx';
-- SELECT conname FROM pg_constraint WHERE conname='posts_category_check';

-- ============================================================================
-- ROLLBACK (필요 시 — 위 단계를 모두 되돌림)
-- ----------------------------------------------------------------------------
-- 주의: 뷰 정의가 마이그레이션 전 정의로 되돌아가야 함 (category 컬럼 제거)
-- ============================================================================
-- DROP VIEW IF EXISTS public.post_stats;
-- CREATE VIEW public.post_stats AS  -- (원본 정의로 복구)
--   SELECT p.id, p.post_number, p.title, p.content, p.excerpt, p.status,
--          p.author_id, p.tags, p.published_at, p.created_at, p.updated_at,
--          COALESCE(count(DISTINCT pl.id), 0::bigint)::integer AS likes_count,
--          COALESCE(count(DISTINCT pv.id), 0::bigint)::integer AS views_count,
--          COALESCE(count(DISTINCT CASE WHEN pc.status='approved' THEN pc.id ELSE NULL END), 0)::integer AS comments_count
--   FROM posts p
--   LEFT JOIN post_likes pl ON p.id = pl.post_id
--   LEFT JOIN post_views pv ON p.id = pv.post_id
--   LEFT JOIN post_comments pc ON p.id = pc.post_id
--   GROUP BY p.id, p.post_number, p.title, p.content, p.excerpt, p.status, p.author_id, p.tags, p.published_at, p.created_at, p.updated_at
--   ORDER BY p.published_at DESC NULLS LAST;
-- ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_category_check;
-- DROP INDEX IF EXISTS public.posts_category_idx;
-- ALTER TABLE public.posts DROP COLUMN IF EXISTS category;
