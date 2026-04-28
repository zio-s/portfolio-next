'use client';

/**
 * 블로그 목록 페이지 (리디자인)
 *
 * blog-n/SPEC.md A안: 좌측 280px 사이드바 + 우측 max 720px 메인
 * - 정렬 탭(latest/popular/comments)
 * - 카테고리/태그 필터 (URL params: cat, tag, sort, page)
 * - 행(row) 리스트, border-bottom으로만 구분
 */

import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../router/routes';
import {
  useAppSelector,
  selectUser,
  useGetPostsQuery,
  useDeletePostMutation,
} from '../store';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/common/SEO';
import { CollectionPageJsonLd, BreadcrumbJsonLd } from '@/components/common/JsonLd';
import { useAlertModal, useConfirmModal } from '@/components/modal/hooks';
import type { Post } from '@/store/types';
import { PenSquare, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogSidebar } from '@/features/posts/components/BlogSidebar';
import { PostListItem } from '@/features/posts/components/PostListItem';
import { openCommandPalette } from '@/features/posts/components/GlobalCommandPalette';
import { CategoryChips } from '@/features/posts/components/CategoryChips';
import { deriveCategory, sortPosts, type SortKey } from '@/lib/blog';

const POSTS_PER_PAGE = 8;

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '최신' },
  { key: 'popular', label: '인기' },
  { key: 'comments', label: '댓글많은' },
];

const PostsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppSelector(selectUser);
  const isAdmin = !!user;
  const [deletePost] = useDeletePostMutation();
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  const handleDelete = (post: Post) => {
    showConfirm({
      title: '삭제 확인',
      message: `"${post.title}" 게시글을 삭제하시겠습니까?`,
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await deletePost(post.id).unwrap();
          showAlert({ title: '완료', message: '게시글이 삭제되었습니다', type: 'success' });
        } catch {
          showAlert({ title: '오류', message: '삭제에 실패했습니다', type: 'error' });
        }
      },
    });
  };

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const cat = searchParams.get('cat') ?? 'all';
  const tag = searchParams.get('tag') ?? '';
  const sort = (searchParams.get('sort') as SortKey) ?? 'latest';

  // 전체 데이터 조회 (필터/정렬은 클라이언트에서 처리, 사이드바도 동일 데이터 사용)
  const { data, isLoading: loading, error } = useGetPostsQuery({
    status: isAdmin ? undefined : 'published',
    page: 1,
    limit: 200,
  });

  const allPosts = data?.posts ?? [];

  // 필터링
  const filtered = useMemo(() => {
    return allPosts.filter((p) => {
      if (cat !== 'all') {
        const c = deriveCategory(p);
        if (c.slug !== cat) return false;
      }
      if (tag && !(p.tags ?? []).includes(tag)) return false;
      return true;
    });
  }, [allPosts, cat, tag]);

  const sorted = useMemo(() => sortPosts(filtered, sort), [filtered, sort]);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));
  const pagePosts = sorted.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const setSort = (key: SortKey) => {
    const next = new URLSearchParams(searchParams);
    if (key === 'latest') next.delete('sort'); else next.set('sort', key);
    next.delete('page');
    setSearchParams(next);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const max = 5;
    if (totalPages <= max) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('…', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '…');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages);
    }
    return pages;
  };

  return (
    <MainLayout>
      <SEO
        title="블로그 | 변세민 | 프론트엔드 개발자"
        description="프론트엔드 개발자 변세민의 기술 블로그입니다. React, TypeScript, 웹 개발 관련 글을 공유합니다."
        url="https://semincode.com/blog"
      />
      <CollectionPageJsonLd
        url="https://semincode.com/blog"
        title="블로그 | 변세민 | 프론트엔드 개발자"
        description="프론트엔드 개발자 변세민의 기술 블로그입니다. React, TypeScript, 웹 개발 관련 글을 공유합니다."
      />
      <BreadcrumbJsonLd items={[{ name: '홈', url: '/' }, { name: '블로그', url: '/blog' }]} />

      <div className="max-w-[1280px] mx-auto px-4 lg:px-0 lg:flex lg:items-start">
        {/* Sidebar (lg 이상만 노출, 모바일은 MobileDrawer + CategoryChips로 대체) */}
        {/* sticky: 헤더(60px) 아래 고정 / overflow + scrollbar-hide + 하단 fade mask */}
        <div className="hidden lg:block lg:sticky lg:top-[60px] lg:self-start lg:max-h-[calc(100vh-60px)] lg:overflow-y-auto blog-scrollbar-hide blog-sidebar-fade">
          <BlogSidebar posts={allPosts} onOpenSearch={openCommandPalette} />
        </div>

        {/* Main */}
        <main className="flex-1 min-w-0 px-0 lg:px-12 py-6 lg:py-8 max-w-[820px]">
          {/* Mobile-only category chips (lg 미만) */}
          <div className="lg:hidden mb-4">
            <CategoryChips posts={allPosts} />
          </div>

          {/* Page header */}
          <div className="flex items-end justify-between pb-6 border-b border-[var(--blog-border)] mb-2">
            <div>
              <h1 className="text-[32px] font-bold tracking-[-0.025em] m-0">글</h1>
              <div className="blog-mono text-[12px] text-[var(--blog-fg-muted)] mt-1.5">
                {cat !== 'all' || tag ? '필터' : '전체'} {totalCount}개
                {(cat !== 'all' || tag) && (
                  <button
                    onClick={() => { const n = new URLSearchParams(); setSearchParams(n); }}
                    className="ml-2 underline hover:text-[var(--blog-accent)]"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>
            {isAdmin && (
              <Link to={ROUTES.BLOG_CREATE}>
                <Button
                  variant="outline"
                  className="gap-1.5 text-[13px] h-9 px-3.5"
                  style={{ background: 'transparent', border: '1px solid var(--blog-border)', color: 'var(--blog-fg)' }}
                >
                  <PenSquare className="w-3 h-3" /> 새 글
                </Button>
              </Link>
            )}
          </div>

          {/* Sort tabs */}
          <div className="flex gap-7 pt-5 pb-2">
            {SORTS.map((s) => {
              const active = s.key === sort;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSort(s.key)}
                  className="text-[13px] pb-2 -mb-px"
                  style={{
                    color: active ? 'var(--blog-fg)' : 'var(--blog-fg-muted)',
                    fontWeight: active ? 600 : 400,
                    borderBottom: active ? '2px solid var(--blog-accent)' : '2px solid transparent',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* States */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--blog-accent)] mb-3" />
              <p className="text-[var(--blog-fg-muted)] text-sm">불러오는 중…</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-5 rounded-lg border" style={{ background: 'rgba(244,63,94,.06)', borderColor: 'rgba(244,63,94,.3)' }}>
              <AlertCircle className="w-7 h-7 text-rose-400 mb-2" />
              <p className="font-medium text-rose-400">오류가 발생했습니다</p>
              <p className="text-sm text-[var(--blog-fg-muted)] mt-1">{'data' in error ? (error.data as any)?.message : '게시글을 불러올 수 없습니다'}</p>
            </div>
          )}

          {!loading && !error && pagePosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-5" style={{ background: 'var(--blog-accent-soft)' }}>
                <PenSquare className="w-7 h-7" style={{ color: 'var(--blog-accent)' }} />
              </div>
              <h2 className="text-lg font-semibold mb-1">게시글이 없습니다</h2>
              <p className="text-[var(--blog-fg-muted)] text-sm">
                {cat !== 'all' || tag ? '선택한 필터에 해당하는 글이 없습니다' : '아직 작성된 게시글이 없습니다'}
              </p>
            </motion.div>
          )}

          {!loading && !error && pagePosts.length > 0 && (
            <div>
              {pagePosts.map((p) => (
                <PostListItem key={p.id} post={p} isAdmin={isAdmin} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <nav className="blog-mono flex justify-center items-center gap-1 pt-8 text-[13px]" aria-label="페이지네이션">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 disabled:opacity-30"
                style={{ color: 'var(--blog-fg-muted)' }}
                aria-label="이전 페이지"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map((p, i) => (typeof p === 'number' ? (
                <button
                  key={i}
                  onClick={() => handlePageChange(p)}
                  className="px-3 py-1.5"
                  style={{
                    color: currentPage === p ? 'var(--blog-accent)' : 'var(--blog-fg-muted)',
                    fontWeight: currentPage === p ? 600 : 400,
                    borderBottom: currentPage === p ? '2px solid var(--blog-accent)' : 'none',
                  }}
                >{p}</button>
              ) : (
                <span key={i} className="px-2 text-[var(--blog-fg-subtle)]">{p}</span>
              )))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 disabled:opacity-30"
                style={{ color: 'var(--blog-fg)' }}
                aria-label="다음 페이지"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}
        </main>
      </div>

    </MainLayout>
  );
};

export default PostsPage;
