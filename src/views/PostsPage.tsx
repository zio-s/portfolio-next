/**
 * 게시글 목록 페이지
 *
 * Tistory 스타일 UI + 페이지네이션
 * - 사이드바: 카테고리, 최근 글, 인기 글, 태그
 * - 메인: 게시글 목록 + 페이지네이션
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES, routeHelpers } from '../router/routes';
import {
  useAppSelector,
  selectUser,
  useGetPostsQuery,
  useDeletePostMutation,
  useToggleLikeMutation,
} from '../store';
import { MainLayout } from '@/components/layout/MainLayout';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/common/SEO';
import { CollectionPageJsonLd, BreadcrumbJsonLd } from '@/components/common/JsonLd';
import { useAlertModal, useConfirmModal } from '@/components/modal/hooks';
import {
  PenSquare,
  Loader2,
  AlertCircle,
  Calendar,
  Edit,
  Trash2,
  Heart,
  MessageCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Tag,
  Clock,
  TrendingUp,
} from 'lucide-react';

const POSTS_PER_PAGE = 5;

const PostsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppSelector(selectUser);
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();
  const contentRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef<number>(1);

  // URL에서 페이지 번호 가져오기
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // 어드민 권한 확인: 로그인한 사용자
  const isAdmin = !!user;

  // RTK Query hooks - 로그인하면 모든 상태, 비로그인은 published만
  const { data, isLoading: loading, error } = useGetPostsQuery({
    status: isAdmin ? undefined : 'published',
    page: currentPage,
    limit: POSTS_PER_PAGE,
  });

  // 사이드바용 전체 데이터 (페이지네이션 없이)
  const { data: allPostsData } = useGetPostsQuery({
    status: isAdmin ? undefined : 'published',
    page: 1,
    limit: 100, // 충분히 큰 값으로 전체 조회
  });

  const posts = data?.posts || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;
  const allPosts = allPostsData?.posts || [];

  const [deletePostMutation] = useDeletePostMutation();
  const [toggleLike, { isLoading: isLikeLoading }] = useToggleLikeMutation();

  // 좋아요 처리 중 플래그 (추가 보호)
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  // 페이지 변경 시 스크롤 위치 유지 (맨 위로 이동하지 않음)
  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage;
      // 페이지네이션 클릭 시 스크롤 위치 유지
    }
  }, [currentPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setSearchParams({ page: page.toString() });
  };

  // 게시글 삭제 핸들러
  const handleDelete = async (id: string, title: string) => {
    showConfirm({
      title: '삭제 확인',
      message: `"${title}" 게시글을 정말 삭제하시겠습니까?`,
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await deletePostMutation(id).unwrap();
          showAlert({
            title: '완료',
            message: '게시글이 삭제되었습니다',
            type: 'success',
          });
        } catch {
          showAlert({
            title: '오류',
            message: '게시글 삭제에 실패했습니다',
            type: 'error',
          });
        }
      },
    });
  };

  // 좋아요 토글 핸들러
  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (isLikeLoading || isLikeProcessing) return;

    setIsLikeProcessing(true);
    try {
      await toggleLike(postId).unwrap();
    } catch {
      console.error('좋아요 처리 실패');
    } finally {
      // 500ms 후 다시 클릭 가능
      setTimeout(() => {
        setIsLikeProcessing(false);
      }, 500);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 상대 시간 포맷팅
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return formatDate(dateString);
  };

  // 상태 뱃지 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'draft':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
      case 'archived':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  // 상태 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '발행됨';
      case 'draft':
        return '임시저장';
      case 'archived':
        return '보관됨';
      default:
        return status;
    }
  };

  // 사이드바 데이터 계산 (전체 게시글 기반)
  const { recentPosts, popularPosts, sidebarTags, tagCounts } = useMemo(() => {
    if (allPosts.length === 0) {
      return { recentPosts: [], popularPosts: [], sidebarTags: [], tagCounts: {} };
    }

    // 최근 글 (최신 5개)
    const recent = [...allPosts]
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
      .slice(0, 5);

    // 인기 글 (조회수 기준 5개)
    const popular = [...allPosts]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 5);

    // 태그 집계
    const tags: Record<string, number> = {};
    allPosts.forEach((post) => {
      post.tags?.forEach((tag: string) => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });

    const sortedTags = Object.entries(tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    return {
      recentPosts: recent,
      popularPosts: popular,
      sidebarTags: sortedTags.map(([tag]) => tag),
      tagCounts: tags,
    };
  }, [allPosts]);

  // 페이지네이션 번호 생성
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
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

      {/* JSON-LD 구조화 데이터 */}
      <CollectionPageJsonLd
        url="https://semincode.com/blog"
        title="블로그 | 변세민 | 프론트엔드 개발자"
        description="프론트엔드 개발자 변세민의 기술 블로그입니다. React, TypeScript, 웹 개발 관련 글을 공유합니다."
      />

      <BreadcrumbJsonLd
        items={[
          { name: '홈', url: '/' },
          { name: '블로그', url: '/blog' },
        ]}
      />

      {/* Header */}
      <Section className="py-12 md:py-16 bg-gradient-to-b from-accent/5 to-transparent dark:from-accent/10">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                Blog
              </h1>
              <p className="text-muted-foreground">
                전체 <span className="font-semibold text-accent">{totalCount}</span>개의 게시글
              </p>
            </motion.div>

            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link to={ROUTES.BLOG_CREATE}>
                  <Button className="shadow-md hover:shadow-lg transition-all group">
                    <PenSquare className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    새 글 작성
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </Container>
      </Section>

      {/* Main Content with Sidebar */}
      <Section className="py-8">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8" ref={contentRef}>
            {/* Sidebar - 데스크톱에서만 표시 */}
            <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
              {/* 최근 글 */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm flex items-center gap-2 pb-3 mb-3 border-b border-border">
                  <Clock className="w-4 h-4 text-accent" />
                  최근 글
                </h3>
                <ul className="space-y-2">
                  {recentPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        to={routeHelpers.blogDetail(post.id)}
                        className="text-sm text-muted-foreground hover:text-accent transition-colors line-clamp-1 block py-1"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 인기 글 */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm flex items-center gap-2 pb-3 mb-3 border-b border-border">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  인기 글
                </h3>
                <ul className="space-y-2">
                  {popularPosts.map((post, index) => (
                    <li key={post.id} className="flex items-start gap-2">
                      <span className="text-xs font-bold text-accent bg-accent/10 rounded px-1.5 py-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <Link
                        to={routeHelpers.blogDetail(post.id)}
                        className="text-sm text-muted-foreground hover:text-accent transition-colors line-clamp-1"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 태그 */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm flex items-center gap-2 pb-3 mb-3 border-b border-border">
                  <Tag className="w-4 h-4 text-accent" />
                  태그
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {sidebarTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-muted/50 hover:bg-accent/10 hover:text-accent rounded-md transition-colors cursor-pointer"
                    >
                      #{tag}
                      <span className="ml-1 text-muted-foreground">({tagCounts[tag]})</span>
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
                  <p className="text-muted-foreground text-sm">게시글을 불러오는 중...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl bg-destructive/10 border border-destructive/30 text-center max-w-md mx-auto"
                >
                  <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                  <p className="font-medium text-destructive mb-1">오류가 발생했습니다</p>
                  <p className="text-sm text-muted-foreground">
                    {'data' in error ? (error.data as any)?.message : '게시글을 불러올 수 없습니다'}
                  </p>
                </motion.div>
              )}

              {/* Empty State */}
              {!loading && !error && posts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PenSquare className="w-10 h-10 text-accent" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">게시글이 없습니다</h2>
                  <p className="text-muted-foreground mb-6 text-sm">
                    {isAdmin ? '첫 번째 게시글을 작성해보세요!' : '아직 작성된 게시글이 없습니다'}
                  </p>
                  {isAdmin && (
                    <Link to={ROUTES.BLOG_CREATE}>
                      <Button variant="outline">
                        <PenSquare className="w-4 h-4 mr-2" />
                        첫 게시글 작성하기
                      </Button>
                    </Link>
                  )}
                </motion.div>
              )}

              {/* Posts List */}
              {!loading && !error && posts.length > 0 && (
                <>
                  <div className="space-y-4">
                    {posts.map((post, index) => {
                      const postDate = new Date(post.publishedAt || post.createdAt);
                      const daysDiff = Math.floor((Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24));
                      const isNew = daysDiff >= 0 && daysDiff <= 3;

                      return (
                        <motion.article
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          onClick={() => navigate(routeHelpers.blogDetail(post.id))}
                          className="group bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-200 hover:shadow-md cursor-pointer"
                        >
                          {/* Header: Title & Status */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                                {post.title}
                              </h2>
                              {isNew && (
                                <span className="relative flex h-2 w-2 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-600"></span>
                                </span>
                              )}
                            </div>
                            {isAdmin && (
                              <Badge
                                variant="outline"
                                className={`${getStatusStyle(post.status)} px-2 py-0.5 text-xs font-medium border shrink-0`}
                              >
                                {getStatusText(post.status)}
                              </Badge>
                            )}
                          </div>

                          {/* Excerpt */}
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>

                          {/* Tags */}
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {post.tags.slice(0, 4).map((tag: string, tagIndex: number) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 4 && (
                                <span className="text-xs text-muted-foreground">
                                  +{post.tags.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer: Stats, Date & Actions */}
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            {/* Stats */}
                            <div className="flex items-center gap-4">
                              {/* Like Button */}
                              <button
                                onClick={(e) => handleLike(e, post.id)}
                                disabled={isLikeLoading || isLikeProcessing}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  post.is_liked
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-muted-foreground hover:text-red-500'
                                } ${(isLikeLoading || isLikeProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${post.is_liked ? 'fill-current' : ''}`}
                                />
                                <span>{post.likes_count || 0}</span>
                              </button>

                              {/* Comments */}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{post.comments_count || 0}</span>
                              </div>

                              {/* Views */}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{post.views_count || 0}</span>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {formatRelativeDate(
                                  post.publishedAt || post.published_at || post.createdAt || post.created_at || ''
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Admin Actions */}
                          {isAdmin && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                              <Link to={routeHelpers.blogEdit(post.id)} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                  <Edit className="w-3 h-3 mr-1" />
                                  수정
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(post.id, post.title)}
                                className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                삭제
                              </Button>
                            </div>
                          )}
                        </motion.article>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="flex items-center justify-center gap-1 mt-8 pt-6 border-t border-border">
                      {/* Previous */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="이전 페이지"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                          typeof page === 'number' ? (
                            <button
                              key={index}
                              onClick={() => handlePageChange(page)}
                              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-accent text-white'
                                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {page}
                            </button>
                          ) : (
                            <span key={index} className="px-2 text-muted-foreground">
                              {page}
                            </span>
                          )
                        ))}
                      </div>

                      {/* Next */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="다음 페이지"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  )}
                </>
              )}
            </main>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
};

export default PostsPage;
