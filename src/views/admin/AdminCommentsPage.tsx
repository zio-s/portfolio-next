/**
 * Admin Comments Page - Modern Tailwind v4 Version
 *
 * 댓글 관리 페이지 (관리자 전용)
 * 프로젝트 + 블로그 댓글 통합 관리, 답글 기능 포함
 */

import { useState, Fragment } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useAlertModal } from '@/components/modal/hooks/use-alert-modal';
import { useConfirmModal } from '@/components/modal/hooks/use-confirm-modal';
import { useGetAllCommentsQuery, useDeleteCommentMutation, useAddCommentMutation } from '../../features/comments/api/commentsApi';
import { useCreatePostCommentMutation } from '../../store/api/postCommentsApi';
import { Loader2, Trash2, Heart, MessageCircle, Reply, Send, X } from 'lucide-react';
import { useAppSelector } from '../../store';
import { selectUser } from '../../store/slices/authSlice';
import type { Comment } from '../../features/comments/types/Comment';

/**
 * 인라인 답글 폼
 */
const AdminReplyForm = ({
  comment,
  onSubmit,
  onCancel,
  isLoading,
  adminName,
}: {
  comment: Comment;
  onSubmit: (content: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  adminName: string;
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
  };

  return (
    <tr>
      <td colSpan={6} className="px-6 py-3 bg-accent/5">
        <form onSubmit={handleSubmit} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
            {adminName[0]}
          </div>
          <div className="flex-1 space-y-2">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-accent">{adminName}</span>으로 <span className="font-medium">{comment.authorName}</span>에게 답글
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="답글을 작성하세요..."
              rows={2}
              autoFocus
              disabled={isLoading}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none disabled:opacity-50"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-3 h-3" />
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                답글 작성
              </button>
            </div>
          </div>
        </form>
      </td>
    </tr>
  );
};

export const AdminCommentsPage = () => {
  const { data, isLoading: loading, error, refetch } = useGetAllCommentsQuery();
  const [deleteComment] = useDeleteCommentMutation();
  const [addProjectComment, { isLoading: isAddingProjectComment }] = useAddCommentMutation();
  const [addBlogComment, { isLoading: isAddingBlogComment }] = useCreatePostCommentMutation();
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();
  const currentUser = useAppSelector(selectUser);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const comments = data?.items || [];
  const isReplying = isAddingProjectComment || isAddingBlogComment;

  const handleReply = async (comment: Comment, content: string) => {
    try {
      if (comment.sourceType === 'blog') {
        await addBlogComment({
          post_id: comment.projectId,
          content,
          author_name: currentUser?.name || 'admin',
          author_email: currentUser?.email || 'admin@admin.com',
          parent_id: comment.id,
        }).unwrap();
      } else {
        await addProjectComment({
          projectId: comment.projectId,
          content,
          authorName: currentUser?.name || 'admin',
          parentId: comment.id,
        }).unwrap();
      }

      setReplyingTo(null);
      refetch();
      showAlert({
        title: '답글 작성 완료',
        message: '답글이 작성되었습니다.',
        type: 'success',
      });
    } catch {
      showAlert({
        title: '답글 작성 실패',
        message: '답글 작성에 실패했습니다.',
        type: 'error',
      });
    }
  };

  const handleDelete = async (id: string, content: string, sourceType?: string) => {
    const preview = content.length > 30 ? content.substring(0, 30) + '...' : content;

    showConfirm({
      title: '댓글 삭제',
      message: `"${preview}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          if (sourceType === 'blog') {
            // 블로그 댓글은 post_comments 테이블에서 삭제
            const { deletePostComment } = await import('../../store/api/postCommentsApi').then(m => ({
              deletePostComment: m.postCommentsApi.endpoints.deletePostComment.initiate,
            }));
            // RTK Query를 직접 호출할 수 없으므로 supabase 직접 사용
            const { supabase } = await import('../../lib/supabase');
            await (supabase as any).from('post_comments').delete().eq('id', id);
          } else {
            await deleteComment(id).unwrap();
          }
          refetch();
          showAlert({
            title: '삭제 완료',
            message: '댓글이 삭제되었습니다.',
            type: 'success',
          });
        } catch {
          showAlert({
            title: '삭제 실패',
            message: '댓글 삭제에 실패했습니다.',
            type: 'error',
          });
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">댓글</h1>
          <p className="text-sm text-muted-foreground mt-1">
            프로젝트 및 블로그에 달린 댓글을 관리합니다
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              댓글을 불러올 수 없습니다. 다시 시도해주세요.
            </p>
          </div>
        )}

        {/* Comments Table - Desktop */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    출처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    작성자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    내용
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    좋아요
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comments.map((comment) => (
                  <Fragment key={comment.id}>
                    <tr className="hover:bg-muted/30 transition-colors">
                      {/* Source */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                          comment.sourceType === 'blog'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-accent/10 text-accent border-accent/20'
                        }`}>
                          <span>{comment.sourceType === 'blog' ? '블로그' : '프로젝트'}</span>
                          <span className="truncate max-w-[150px]">{comment.sourceTitle || comment.projectId}</span>
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {comment.authorAvatar ? (
                            <img
                              src={comment.authorAvatar}
                              alt={comment.authorName}
                              className="w-10 h-10 rounded-full border-2 border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm">
                              {comment.authorName[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">
                              {comment.authorName}
                            </div>
                            {comment.authorEmail && (
                              <div className="text-xs text-muted-foreground truncate">
                                {comment.authorEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Content */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap max-w-md">
                            {comment.content}
                          </div>
                          {comment.parentId && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageCircle className="w-3 h-3" />
                              <span>답글</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Likes */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <Heart className="w-4 h-4" />
                          {comment.likes}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(comment.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {!comment.parentId && (
                            <button
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className={`p-2 rounded-md transition-colors cursor-pointer ${
                                replyingTo === comment.id
                                  ? 'bg-accent/10 text-accent'
                                  : 'hover:bg-accent/10 text-muted-foreground hover:text-accent'
                              }`}
                              title="답글"
                            >
                              <Reply className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(comment.id, comment.content, comment.sourceType)}
                            className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {replyingTo === comment.id && (
                      <AdminReplyForm
                        key={`reply-${comment.id}`}
                        comment={comment}
                        onSubmit={(content) => handleReply(comment, content)}
                        onCancel={() => setReplyingTo(null)}
                        isLoading={isReplying}
                        adminName={currentUser?.name || 'admin'}
                      />
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comments Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-lg border border-border bg-card space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {comment.authorAvatar ? (
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-10 h-10 rounded-full border-2 border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {comment.authorName[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">
                      {comment.authorName}
                    </div>
                    {comment.authorEmail && (
                      <div className="text-xs text-muted-foreground truncate">
                        {comment.authorEmail}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-sm text-foreground whitespace-pre-wrap">
                {comment.content}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                  comment.sourceType === 'blog'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-accent/10 text-accent border-accent/20'
                }`}>
                  {comment.sourceType === 'blog' ? '블로그' : '프로젝트'} {comment.sourceTitle}
                </span>
                {comment.parentId && (
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    답글
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {comment.likes}
                </span>
                <span>{formatDate(comment.createdAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                {!comment.parentId && (
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-accent/10 transition-colors text-accent cursor-pointer text-sm font-medium"
                  >
                    <Reply className="w-4 h-4" />
                    답글
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id, comment.content, comment.sourceType)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive cursor-pointer text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              </div>

              {/* Mobile Reply Form */}
              {replyingTo === comment.id && (
                <div className="pt-3 border-t border-border">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const textarea = form.querySelector('textarea');
                      if (textarea?.value.trim()) {
                        handleReply(comment, textarea.value.trim());
                      }
                    }}
                    className="space-y-2"
                  >
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-accent">{currentUser?.name || 'admin'}</span>으로 답글 작성
                    </div>
                    <textarea
                      placeholder="답글을 작성하세요..."
                      rows={2}
                      autoFocus
                      disabled={isReplying}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none disabled:opacity-50"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg"
                      >
                        <X className="w-3 h-3" />
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={isReplying}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent/90 rounded-lg disabled:opacity-50"
                      >
                        {isReplying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        답글
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total Count */}
        <div className="text-sm text-muted-foreground">
          전체 <span className="font-semibold text-foreground">{comments.length}</span>개의
          댓글
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCommentsPage;
