/**
 * Guestbook Card Component
 *
 * h-creations.com style with emoji avatars
 */

import * as React from 'react';
import { MessageCircle, Pin, Loader2, PinOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useAddAdminReplyMutation, useUpdateGuestbookEntryMutation } from '../api/guestbookApi';
import { useAlertModal } from '@/components/modal/hooks/use-alert-modal';
import { filterProfanity, hasProfanity } from '@/utils/profanityFilter';
import type { Guestbook } from '../types/Guestbook';

interface GuestbookCardProps {
  guestbook: Guestbook;
  showAdminBadge?: boolean;
}

export const GuestbookCard: React.FC<GuestbookCardProps> = ({
  guestbook,
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [addAdminReply, { isLoading: isAddingReply }] = useAddAdminReplyMutation();
  const [updateEntry, { isLoading: isUpdatingPin }] = useUpdateGuestbookEntryMutation();
  const { showAlert } = useAlertModal();

  const [isReplyFormOpen, setIsReplyFormOpen] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    if (diffInSeconds < 7776000) return `${Math.floor(diffInSeconds / 2592000)}달 전`;
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get emoji based on name hash
  const getEmoji = (name: string) => {
    const emojis = ['😊', '🎉', '💡', '🚀', '✨', '🌟', '💻', '🎨', '📚', '🎯', '🔥', '💪', '🌈', '⭐', '🎵'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return emojis[Math.abs(hash) % emojis.length];
  };

  // Handle pin toggle (admin only)
  const handleTogglePin = async () => {
    if (!isAuthenticated) return;

    try {
      await updateEntry({
        id: guestbook.id,
        isPinned: !guestbook.isPinned,
      }).unwrap();

      showAlert({
        title: guestbook.isPinned ? '고정 해제' : '고정 완료',
        message: guestbook.isPinned ? '방문록 고정이 해제되었습니다.' : '방문록이 상단에 고정되었습니다.',
        type: 'success',
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showAlert({
        title: '고정 실패',
        message: error?.data?.message || '고정 상태 변경에 실패했습니다.',
        type: 'error',
      });
    }
  };

  // Handle admin reply submission
  const handleSubmitReply = async () => {
    if (!isAuthenticated || !replyText.trim()) {
      showAlert({
        title: '입력 오류',
        message: '답글 내용을 입력해주세요.',
        type: 'warning',
      });
      return;
    }

    // 욕설 필터 적용
    const filteredContent = filterProfanity(replyText.trim());
    const contentHadProfanity = hasProfanity(replyText);

    if (contentHadProfanity) {
      showAlert({
        title: '내용이 수정되었습니다',
        message: '부적절한 표현이 예쁜 말로 자동 변환되었습니다.',
        type: 'info',
      });
    }

    try {
      await addAdminReply({
        id: guestbook.id,
        adminReply: filteredContent,
      }).unwrap();

      setReplyText('');
      setIsReplyFormOpen(false);

      showAlert({
        title: '답글 작성 완료',
        message: '답글이 성공적으로 작성되었습니다.',
        type: 'success',
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showAlert({
        title: '답글 작성 실패',
        message: error?.data?.message || '답글 작성에 실패했습니다.',
        type: 'error',
      });
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-2xl border border-border">
            {getEmoji(guestbook.authorName)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{guestbook.authorName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(guestbook.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {guestbook.isPinned && (
                <Pin className="w-4 h-4 text-accent fill-accent" />
              )}
              {/* Pin Toggle Button (Admin Only) */}
              {isAuthenticated && (
                <button
                  onClick={handleTogglePin}
                  disabled={isUpdatingPin}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors disabled:opacity-50"
                  title={guestbook.isPinned ? '고정 해제' : '상단 고정'}
                >
                  {isUpdatingPin ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : guestbook.isPinned ? (
                    <PinOff className="w-4 h-4" />
                  ) : (
                    <Pin className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words mb-3">
            {guestbook.content}
          </p>

          {/* Reply Button (Admin Only) */}
          {isAuthenticated && !guestbook.adminReply && (
            <button
              onClick={() => setIsReplyFormOpen(!isReplyFormOpen)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>{isReplyFormOpen ? '취소' : '답글쓰기'}</span>
            </button>
          )}

          {/* Reply Form (Admin Only) */}
          {isAuthenticated && isReplyFormOpen && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답글을 입력하세요 (최소 2자)"
                className="w-full p-3 text-sm rounded-lg bg-background border border-border focus:border-accent focus:outline-none resize-none"
                rows={3}
                maxLength={1000}
                disabled={isAddingReply}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReply}
                  disabled={isAddingReply || !replyText.trim()}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAddingReply && <Loader2 className="w-3 h-3 animate-spin" />}
                  답글 작성
                </button>
                <button
                  onClick={() => {
                    setIsReplyFormOpen(false);
                    setReplyText('');
                  }}
                  disabled={isAddingReply}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Admin Reply */}
          {guestbook.adminReply && (
            <div className="mt-4 flex gap-3 pl-4 border-l-2 border-accent/30">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-xl border border-accent/30">
                  👨‍💻
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm text-accent">SEM</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-accent/20 text-accent rounded">
                    ADMIN
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {guestbook.adminRepliedAt && formatDate(guestbook.adminRepliedAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                  {guestbook.adminReply}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mt-6 border-t border-border/50" />
    </div>
  );
};
