/**
 * Admin Comments Page - Modern Tailwind v4 Version
 *
 * 댓글 관리 페이지 (관리자 전용)
 * h-creations.com 스타일의 미니멀한 디자인
 */

import { AdminLayout } from '../../components/layout/AdminLayout';
import { useAlertModal } from '@/components/modal/hooks/use-alert-modal';
import { useConfirmModal } from '@/components/modal/hooks/use-confirm-modal';
import { useGetAllCommentsQuery, useDeleteCommentMutation } from '../../features/comments/api/commentsApi';
import { Loader2, Trash2, Heart, MessageCircle } from 'lucide-react';

export const AdminCommentsPage = () => {
  const { data, isLoading: loading, error } = useGetAllCommentsQuery();
  const [deleteComment] = useDeleteCommentMutation();
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  const comments = data?.items || [];

  const handleDelete = async (id: string, content: string) => {
    const preview = content.length > 30 ? content.substring(0, 30) + '...' : content;

    showConfirm({
      title: '댓글 삭제',
      message: `"${preview}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await deleteComment(id).unwrap();
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
            프로젝트에 달린 댓글을 관리합니다
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
                    프로젝트
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
                  <tr key={comment.id} className="hover:bg-muted/30 transition-colors">
                    {/* Project */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                        Project #{comment.projectId}
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
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDelete(comment.id, comment.content)}
                          className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20">
                  Project #{comment.projectId}
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
              <div className="pt-3 border-t border-border">
                <button
                  onClick={() => handleDelete(comment.id, comment.content)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-destructive/10 transition-colors text-destructive cursor-pointer text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
              </div>
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
