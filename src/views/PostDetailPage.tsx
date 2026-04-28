'use client';

/**
 * 블로그 상세 페이지 (리디자인)
 *
 * blog-n/SPEC.md §5.2:
 * - 단일 컬럼 720px 센터, 진행률 바(top fixed 2px)
 * - 우측 floating TOC (xl 이상)
 * - 좋아요 CTA(54px 원형), 이전/다음 글(2컬럼), 댓글
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { routeHelpers } from '../router/routes';
import {
  useAppSelector,
  selectUser,
  useGetPostByNumberQuery,
  useGetPostsQuery,
  useDeletePostMutation,
  useToggleLikeMutation,
  useIncrementViewMutation,
} from '../store';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PostCommentList } from '@/features/post-comments/components/PostCommentList';
import { PostCommentForm } from '@/features/post-comments/components/PostCommentForm';
import { useAlertModal, useConfirmModal } from '@/components/modal/hooks';
import { ReadingProgress } from '@/features/posts/components/ReadingProgress';
import { TableOfContents } from '@/features/posts/components/TableOfContents';
import { LikeCTA } from '@/features/posts/components/LikeCTA';
import { calcReadMinutes, deriveCategory, formatBlogDate } from '@/lib/blog';
import { PROFILE } from '@/config/profile';
import type { Post } from '@/store/types';

interface PostDetailPageProps {
  initialPost?: Post;
}

const PostDetailPage = ({ initialPost }: PostDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  const user = useAppSelector(selectUser);
  const isAdmin = !!user;
  const backPath = '/blog';

  const postNumber = initialPost?.post_number ?? (id ? Number(id) : NaN);

  const { data: clientPost, isLoading: loading, error } = useGetPostByNumberQuery(postNumber, {
    skip: isNaN(postNumber),
  });
  const post = clientPost ?? initialPost;

  // 이전/다음 + ⌘K palette용 전체 목록
  const { data: allData } = useGetPostsQuery({ status: 'published', page: 1, limit: 200 });
  const allPosts = allData?.posts ?? [];

  const { prevPost, nextPost } = useMemo(() => {
    if (!post || allPosts.length === 0) return { prevPost: undefined, nextPost: undefined };
    const sorted = [...allPosts].sort((a, b) => (a.post_number ?? 0) - (b.post_number ?? 0));
    const idx = sorted.findIndex((p) => p.id === post.id);
    return {
      prevPost: idx > 0 ? sorted[idx - 1] : undefined,
      nextPost: idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : undefined,
    };
  }, [post, allPosts]);

  const [deletePostMutation] = useDeletePostMutation();
  const [toggleLike, { isLoading: isLikeLoading }] = useToggleLikeMutation();
  const [incrementView] = useIncrementViewMutation();
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (post?.id) incrementView(post.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const handleDelete = () => {
    if (!post) return;
    showConfirm({
      title: '삭제 확인',
      message: `"${post.title}" 게시글을 정말 삭제하시겠습니까?`,
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await deletePostMutation(post.id).unwrap();
          showAlert({ title: '완료', message: '게시글이 삭제되었습니다', type: 'success', onConfirm: () => navigate(backPath) });
        } catch {
          showAlert({ title: '오류', message: '게시글 삭제에 실패했습니다', type: 'error' });
        }
      },
    });
  };

  const handleLike = async () => {
    if (!post?.id || isLikeLoading || isLikeProcessing) return;
    setIsLikeProcessing(true);
    try {
      await toggleLike(post.id).unwrap();
    } catch {
      console.error('좋아요 처리 실패');
    } finally {
      setTimeout(() => setIsLikeProcessing(false), 500);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'draft': return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
      case 'archived': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };
  const getStatusText = (status: string) => ({ published: '발행됨', draft: '임시저장', archived: '보관됨' } as const)[status as 'published' | 'draft' | 'archived'] ?? status;

  if (loading && !post) {
    return (
      <MainLayout>
        <div className="max-w-[720px] mx-auto py-20 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--blog-accent)] mb-3" />
          <p className="text-[var(--blog-fg-muted)] text-sm">게시글을 불러오는 중…</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-[720px] mx-auto py-20 px-4">
          <div className="p-6 rounded-xl border" style={{ background: 'rgba(244,63,94,.06)', borderColor: 'rgba(244,63,94,.3)' }}>
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="font-medium text-rose-400 text-center">오류가 발생했습니다</p>
            <p className="text-sm text-[var(--blog-fg-muted)] text-center mt-1">
              {'data' in error ? (error.data as any)?.message : '게시글을 불러올 수 없습니다'}
            </p>
          </div>
          <Link to={backPath}>
            <Button variant="outline" className="w-full mt-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="max-w-[720px] mx-auto py-20 text-center">
          <div className="w-20 h-20 rounded-full grid place-items-center mx-auto mb-5" style={{ background: 'var(--blog-accent-soft)' }}>
            <AlertCircle className="w-10 h-10" style={{ color: 'var(--blog-accent)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-[var(--blog-fg-muted)] mb-6">삭제되었거나 존재하지 않는 게시글입니다</p>
          <Link to={backPath}>
            <Button><ArrowLeft className="w-4 h-4 mr-2" />목록으로</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const cat = deriveCategory(post);
  const readMin = calcReadMinutes(post.content);
  const dateRaw = post.publishedAt || post.published_at || post.createdAt || post.created_at;

  return (
    <MainLayout>
      <ReadingProgress articleRef={articleRef} />

      <div className="max-w-[1280px] mx-auto px-4 xl:flex xl:items-start xl:justify-center">
        <article ref={articleRef} className="w-full max-w-[720px] mx-auto pt-8 pb-20">
          {/* Back */}
          <Link to={backPath}>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[13px] mb-8 hover:text-[var(--blog-accent)] transition-colors"
              style={{ color: 'var(--blog-fg-muted)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 목록으로
            </button>
          </Link>

          {/* Header */}
          <header>
            <div className="flex items-center gap-3 mb-4">
              <span className="blog-mono text-[11.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--blog-accent)' }}>
                {cat.label}
              </span>
              {isAdmin && (
                <Badge variant="outline" className={`${getStatusStyle(post.status)} px-2 py-0.5 text-[11px] border`}>
                  {getStatusText(post.status)}
                </Badge>
              )}
            </div>
            <h1 className="text-[32px] sm:text-[40px] md:text-[44px] font-bold leading-[1.15] tracking-[-0.025em] m-0">
              {post.title}
            </h1>
            <div
              className="blog-mono flex items-center flex-wrap gap-3 text-[12px] mt-6 pb-6"
              style={{ color: 'var(--blog-fg-muted)', borderBottom: '1px solid var(--blog-border)' }}
            >
              <span>{formatBlogDate(dateRaw)}</span>
              <span style={{ color: 'var(--blog-border)' }}>·</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {readMin}분 읽기</span>
              <span style={{ color: 'var(--blog-border)' }}>·</span>
              <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {(post.views_count ?? 0).toLocaleString()}</span>
              <span style={{ color: 'var(--blog-border)' }}>·</span>
              <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments_count ?? 0}</span>
            </div>
          </header>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-8 text-[16px] leading-[1.7]" style={{ color: 'var(--blog-fg-muted)' }}>
              {post.excerpt}
            </p>
          )}

          {/* Body */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="blog-article max-w-none mt-10"
          >
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
                      showLineNumbers
                      wrapLongLines
                      customStyle={{ margin: '1.5rem 0', borderRadius: '0.5rem', fontSize: '0.875rem', lineHeight: '1.6' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </motion.div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--blog-border)' }}>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`}>
                    <span className="blog-tag">#{t}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Like CTA */}
          <LikeCTA
            liked={!!post.is_liked}
            count={post.likes_count ?? 0}
            disabled={isLikeLoading || isLikeProcessing}
            onToggle={handleLike}
          />

          {/* About author */}
          <div
            className="mt-6 flex items-start gap-4 p-5"
            style={{ background: 'var(--blog-card)', border: '1px solid var(--blog-border)', borderRadius: 12 }}
          >
            <div
              className="w-12 h-12 rounded-full grid place-items-center font-bold text-[16px] text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
            >
              {PROFILE.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-semibold" style={{ color: 'var(--blog-fg)' }}>{PROFILE.name}</span>
                <span className="blog-mono text-[11px]" style={{ color: 'var(--blog-fg-subtle)' }}>· {PROFILE.role}</span>
              </div>
              <p className="text-[13px] mt-1.5 leading-[1.6]" style={{ color: 'var(--blog-fg-muted)' }}>
                {PROFILE.bio}
              </p>
              <div className="mt-2.5 flex items-center gap-3 blog-mono text-[11.5px]">
                {PROFILE.github && (
                  <a href={PROFILE.github} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--blog-fg-muted)' }}>
                    GitHub →
                  </a>
                )}
                {PROFILE.email && (
                  <a href={`mailto:${PROFILE.email}`} style={{ color: 'var(--blog-fg-muted)' }}>
                    Email →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Prev/Next */}
          {(prevPost || nextPost) && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prevPost ? (
                <Link to={routeHelpers.blogDetail(prevPost.post_number)}>
                  <div
                    className="p-5 transition-colors hover:border-[var(--blog-accent)]"
                    style={{ border: '1px solid var(--blog-border)', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <div className="blog-mono text-[11px] inline-flex items-center gap-1.5" style={{ color: 'var(--blog-fg-subtle)' }}>
                      <ChevronLeft className="w-3 h-3" /> 이전
                    </div>
                    <div className="text-[14px] font-medium mt-2 truncate" style={{ color: 'var(--blog-fg)' }}>
                      {prevPost.title}
                    </div>
                  </div>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link to={routeHelpers.blogDetail(nextPost.post_number)}>
                  <div
                    className="p-5 transition-colors hover:border-[var(--blog-accent)] text-right"
                    style={{ border: '1px solid var(--blog-border)', borderRadius: 8, cursor: 'pointer' }}
                  >
                    <div className="blog-mono text-[11px] inline-flex items-center gap-1.5 justify-end w-full" style={{ color: 'var(--blog-fg-subtle)' }}>
                      다음 <ChevronRight className="w-3 h-3" />
                    </div>
                    <div className="text-[14px] font-medium mt-2 truncate" style={{ color: 'var(--blog-fg)' }}>
                      {nextPost.title}
                    </div>
                  </div>
                </Link>
              ) : <div />}
            </div>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex gap-2 mt-8 pt-6" style={{ borderTop: '1px solid var(--blog-border)' }}>
              <Link to={routeHelpers.blogEdit(post.id)} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" /> 수정
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" /> 삭제
              </Button>
            </div>
          )}

          {/* Comments */}
          <section className="mt-12 pt-8" style={{ borderTop: '1px solid var(--blog-border)' }}>
            <h3 className="text-[18px] font-semibold flex items-center gap-2 mb-4">
              댓글<span className="blog-mono text-[13px] font-normal" style={{ color: 'var(--blog-fg-muted)' }}>{post.comments_count ?? 0}</span>
            </h3>
            <div className="mb-6">
              <PostCommentForm postId={post.id} onSuccess={() => {}} placeholder="댓글을 남겨주세요…" />
            </div>
            <PostCommentList postId={post.id} />
          </section>
        </article>

        {/* Floating TOC (xl 이상) */}
        <TableOfContents />
      </div>

    </MainLayout>
  );
};

export default PostDetailPage;
