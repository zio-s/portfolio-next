/**
 * Admin Guestbook Page - Modern Tailwind v4 Version
 *
 * 방문록 관리 페이지 (관리자 전용)
 * h-creations.com 스타일의 미니멀한 디자인
 */

import * as React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { useAlertModal } from '@/components/modal/hooks/use-alert-modal';
import { useConfirmModal } from '@/components/modal/hooks/use-confirm-modal';
import {
  useGetAllGuestbookQuery,
  useDeleteGuestbookEntryMutation,
  useUpdateGuestbookEntryMutation,
  useAddAdminReplyMutation,
} from '../../features/guestbook/api/guestbookApi';
import { Loader2, Pin, Trash2, MessageSquare, Edit2 } from 'lucide-react';

export const AdminGuestbookPage = () => {
  const { data, isLoading: loading, error } = useGetAllGuestbookQuery();
  const [deleteEntry] = useDeleteGuestbookEntryMutation();
  const [updateEntry] = useUpdateGuestbookEntryMutation();
  const [addReply] = useAddAdminReplyMutation();
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');

  const entries = data?.items || [];

  const handleDelete = async (id: string, authorName: string) => {
    showConfirm({
      title: '방문록 삭제',
      message: `"${authorName}"님의 방문록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await deleteEntry(id).unwrap();
          showAlert({
            title: '삭제 완료',
            message: '방문록이 삭제되었습니다.',
            type: 'success',
          });
        } catch {
          showAlert({
            title: '삭제 실패',
            message: '방문록 삭제에 실패했습니다.',
            type: 'error',
          });
        }
      },
    });
  };

  const togglePinned = async (id: string, currentPinned: boolean, authorName: string) => {
    try {
      await updateEntry({ id, isPinned: !currentPinned }).unwrap();

      showAlert({
        title: currentPinned ? '고정 해제' : '고정 완료',
        message: currentPinned
          ? `"${authorName}"님의 방문록 고정이 해제되었습니다.`
          : `"${authorName}"님의 방문록이 상단에 고정되었습니다.`,
        type: 'success',
      });
    } catch {
      showAlert({
        title: '고정 설정 실패',
        message: '고정 상태 변경에 실패했습니다.',
        type: 'error',
      });
    }
  };

  const handleReplySubmit = async (id: string, authorName: string) => {
    if (!replyText.trim()) {
      showAlert({
        title: '입력 오류',
        message: '답글 내용을 입력해주세요.',
        type: 'warning',
      });
      return;
    }

    try {
      await addReply({ id, adminReply: replyText.trim() }).unwrap();
      showAlert({
        title: '답글 등록 완료',
        message: `"${authorName}"님의 방문록에 답글이 등록되었습니다.`,
        type: 'success',
      });
      setReplyingTo(null);
      setReplyText('');
    } catch {
      showAlert({
        title: '답글 등록 실패',
        message: '답글 등록에 실패했습니다.',
        type: 'error',
      });
    }
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
          <h1 className="text-3xl font-bold tracking-tight">방문록</h1>
          <p className="text-sm text-muted-foreground mt-1">
            방문록을 관리하고 답글을 작성합니다
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              방문록을 불러올 수 없습니다. 다시 시도해주세요.
            </p>
          </div>
        )}

        {/* Guestbook Table - Desktop */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    작성자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    내용
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    관리자 답글
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    고정
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
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                    {/* Author */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {entry.authorAvatarUrl ? (
                          <img
                            src={entry.authorAvatarUrl}
                            alt={entry.authorName}
                            className="w-10 h-10 rounded-full border-2 border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm">
                            {entry.authorName[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {entry.authorName}
                          </div>
                          {entry.authorEmail && (
                            <div className="text-xs text-muted-foreground truncate">
                              {entry.authorEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Content */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap max-w-md">
                        {entry.content}
                      </div>
                    </td>

                    {/* Admin Reply */}
                    <td className="px-6 py-4">
                      {replyingTo === entry.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="답글을 입력하세요..."
                            className="w-full min-h-[80px] px-3 py-2 bg-background border border-border rounded-lg text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReplySubmit(entry.id, entry.authorName)}
                              className="px-3 py-1.5 bg-accent text-white rounded-md text-xs font-medium hover:bg-accent/90 transition-colors cursor-pointer"
                            >
                              등록
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1.5 bg-muted text-foreground rounded-md text-xs font-medium hover:bg-muted/80 transition-colors cursor-pointer"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : entry.adminReply ? (
                        <div className="space-y-2">
                          <div className="text-sm text-foreground line-clamp-2 whitespace-pre-wrap">
                            {entry.adminReply}
                          </div>
                          <button
                            onClick={() => {
                              setReplyingTo(entry.id);
                              setReplyText(entry.adminReply || '');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-xs hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            수정
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyingTo(entry.id);
                            setReplyText('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-md text-xs font-medium hover:bg-accent/90 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          답글 작성
                        </button>
                      )}
                    </td>

                    {/* Pinned */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePinned(entry.id, entry.isPinned, entry.authorName)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          entry.isPinned
                            ? 'bg-accent text-white hover:bg-accent/90'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Pin className={`w-3 h-3 ${entry.isPinned ? 'fill-current' : ''}`} />
                        {entry.isPinned ? '고정됨' : '고정'}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(entry.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDelete(entry.id, entry.authorName)}
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

        {/* Guestbook Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-lg border border-border bg-card space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {entry.authorAvatarUrl ? (
                    <img
                      src={entry.authorAvatarUrl}
                      alt={entry.authorName}
                      className="w-10 h-10 rounded-full border-2 border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {entry.authorName[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">
                      {entry.authorName}
                    </div>
                    {entry.authorEmail && (
                      <div className="text-xs text-muted-foreground truncate">
                        {entry.authorEmail}
                      </div>
                    )}
                  </div>
                </div>
                {entry.isPinned && (
                  <Pin className="w-4 h-4 text-accent fill-current flex-shrink-0" />
                )}
              </div>

              {/* Content */}
              <div className="text-sm text-foreground whitespace-pre-wrap">
                {entry.content}
              </div>

              {/* Admin Reply */}
              {replyingTo === entry.id ? (
                <div className="space-y-2 pt-3 border-t border-border">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="답글을 입력하세요..."
                    className="w-full min-h-[80px] px-3 py-2 bg-background border border-border rounded-lg text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReplySubmit(entry.id, entry.authorName)}
                      className="flex-1 px-3 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 transition-colors cursor-pointer"
                    >
                      등록
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="flex-1 px-3 py-2 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : entry.adminReply ? (
                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground font-semibold">관리자 답글</div>
                  <div className="text-sm text-foreground whitespace-pre-wrap">
                    {entry.adminReply}
                  </div>
                  <button
                    onClick={() => {
                      setReplyingTo(entry.id);
                      setReplyText(entry.adminReply || '');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted text-muted-foreground rounded-md text-xs hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    수정
                  </button>
                </div>
              ) : null}

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  {formatDate(entry.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  {!entry.adminReply && (
                    <button
                      onClick={() => {
                        setReplyingTo(entry.id);
                        setReplyText('');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-md text-xs font-medium hover:bg-accent/90 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      답글
                    </button>
                  )}
                  <button
                    onClick={() => togglePinned(entry.id, entry.isPinned, entry.authorName)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      entry.isPinned
                        ? 'bg-accent text-white hover:bg-accent/90'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Pin className={`w-3 h-3 ${entry.isPinned ? 'fill-current' : ''}`} />
                    {entry.isPinned ? '고정' : '고정'}
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id, entry.authorName)}
                    className="px-3 py-1.5 rounded-md hover:bg-destructive/10 transition-colors text-destructive cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Count */}
        <div className="text-sm text-muted-foreground">
          전체 <span className="font-semibold text-foreground">{entries.length}</span>개의
          방문록
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGuestbookPage;
