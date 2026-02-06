/**
 * CommentList Component
 *
 * Real API connected comment list with infinite scroll
 * Minimal design matching h-creations.com aesthetic
 */

import * as React from 'react';
import { Loader2, MessageSquare, User, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGetCommentsQuery, useCreateCommentMutation } from '@/features/portfolio/api/projectsApi';
import { useAlertModal } from '@/components/modal/hooks/use-alert-modal';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { filterProfanity, filterNickname, hasProfanity } from '@/utils/profanityFilter';
import type { Database } from '@/lib/database.types';

export interface CommentListProps {
  projectId: string;
  className?: string;
}

export const CommentList: React.FC<CommentListProps> = ({ projectId, className }) => {
  const [page, setPage] = React.useState(1);
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [nickname, setNickname] = React.useState('');
  const [commentText, setCommentText] = React.useState('');
  const [replyNickname, setReplyNickname] = React.useState('');
  const [replyText, setReplyText] = React.useState('');

  // Fetch comments from API
  const { data, isLoading, error } = useGetCommentsQuery({ projectId, page, limit: 10 });
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const { showAlert } = useAlertModal();

  // Check if user is authenticated (admin)
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    // Admin (로그인 상태): 댓글 내용만 확인
    if (isAuthenticated) {
      if (!commentText.trim()) {
        showAlert({
          title: '입력 오류',
          message: '댓글 내용을 입력해주세요.',
          type: 'warning',
        });
        return;
      }
    } else {
      // 일반 사용자: 닉네임 + 댓글 내용 확인
      if (!nickname.trim() || !commentText.trim()) {
        showAlert({
          title: '입력 오류',
          message: '닉네임과 댓글 내용을 모두 입력해주세요.',
          type: 'warning',
        });
        return;
      }

      // 관리자 전용 닉네임 차단
      const lowerNickname = nickname.trim().toLowerCase();
      if (lowerNickname === 'admin' || lowerNickname === 'sem' || nickname.trim() === 'SEM') {
        showAlert({
          title: '사용 불가능한 닉네임',
          message: '해당 닉네임은 관리자 전용입니다.',
          type: 'error',
        });
        return;
      }
    }

    // 욕설 필터 적용
    const filteredName = isAuthenticated ? 'SEM' : filterNickname(nickname.trim());
    const filteredContent = filterProfanity(commentText.trim());

    // 욕설이 감지되었는지 확인
    const nameHadProfanity = !isAuthenticated && hasProfanity(nickname);
    const contentHadProfanity = hasProfanity(commentText);

    if (nameHadProfanity || contentHadProfanity) {
      showAlert({
        title: '내용이 수정되었습니다',
        message: '부적절한 표현이 예쁜 말로 자동 변환되었습니다.',
        type: 'info',
      });
    }

    try {
      await createComment({
        projectId,
        author: filteredName,
        content: filteredContent,
      }).unwrap();

      // Clear form
      if (!isAuthenticated) {
        setNickname('');
      }
      setCommentText('');
    } catch (error: unknown) {
      let errorMessage = '댓글 작성에 실패했습니다.';
      if (error && typeof error === 'object') {
        if ('data' in error && typeof (error as { data?: { message?: string } }).data === 'object' && (error as { data?: { message?: string } }).data?.message) {
          errorMessage = (error as { data: { message: string } }).data.message;
        } else if ('message' in error && typeof (error as { message?: string }).message === 'string') {
          errorMessage = (error as { message: string }).message;
        }
      }
      showAlert({
        title: '댓글 작성 실패',
        message: errorMessage,
        type: 'error',
      });
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (parentId: string) => {
    // Admin (로그인 상태): 답글 내용만 확인
    if (isAuthenticated) {
      if (!replyText.trim()) {
        showAlert({
          title: '입력 오류',
          message: '답글 내용을 입력해주세요.',
          type: 'warning',
        });
        return;
      }
    } else {
      // 일반 사용자: 닉네임 + 답글 내용 확인
      if (!replyNickname.trim() || !replyText.trim()) {
        showAlert({
          title: '입력 오류',
          message: '닉네임과 답글 내용을 모두 입력해주세요.',
          type: 'warning',
        });
        return;
      }

      // 관리자 전용 닉네임 차단
      const lowerReplyNickname = replyNickname.trim().toLowerCase();
      if (lowerReplyNickname === 'admin' || lowerReplyNickname === 'sem' || replyNickname.trim() === 'SEM') {
        showAlert({
          title: '사용 불가능한 닉네임',
          message: '해당 닉네임은 관리자 전용입니다.',
          type: 'error',
        });
        return;
      }
    }

    // 욕설 필터 적용
    const filteredName = isAuthenticated ? 'SEM' : filterNickname(replyNickname.trim());
    const filteredContent = filterProfanity(replyText.trim());

    // 욕설이 감지되었는지 확인
    const nameHadProfanity = !isAuthenticated && hasProfanity(replyNickname);
    const contentHadProfanity = hasProfanity(replyText);

    if (nameHadProfanity || contentHadProfanity) {
      showAlert({
        title: '내용이 수정되었습니다',
        message: '부적절한 표현이 예쁜 말로 자동 변환되었습니다.',
        type: 'info',
      });
    }

    try {
      await createComment({
        projectId,
        author: filteredName,
        content: filteredContent,
        parentId,
      }).unwrap();

      // Clear form
      if (!isAuthenticated) {
        setReplyNickname('');
      }
      setReplyText('');
      setReplyingTo(null);
    } catch (error: unknown) {
      let errorMessage = '답글 작성에 실패했습니다.';
      if (error && typeof error === 'object') {
        if ('data' in error && typeof (error as { data?: { message?: string } }).data === 'object' && (error as { data?: { message?: string } }).data?.message) {
          errorMessage = (error as { data: { message: string } }).data.message;
        } else if ('message' in error && typeof (error as { message?: string }).message === 'string') {
          errorMessage = (error as { message: string }).message;
        }
      }
      showAlert({
        title: '답글 작성 실패',
        message: errorMessage,
        type: 'error',
      });
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Comment Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare className="w-4 h-4" />
        <span>댓글 {data?.total || 0}개</span>
      </div>

      {/* Comment Form */}
      <div className="p-4 rounded-lg bg-card border border-border space-y-3">
        {/* 로그인하지 않은 경우에만 닉네임 입력 필드 표시 */}
        {!isAuthenticated && (
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (최소 2자)"
            className="w-full p-3 text-sm rounded-lg bg-background border border-border focus:border-accent focus:outline-none"
            maxLength={20}
          />
        )}
        {/* 관리자 로그인 시 표시 */}
        {isAuthenticated && (
          <div className="flex items-center gap-2 text-sm text-accent">
            <User className="w-4 h-4" />
            <span className="font-semibold">SEM</span>
            <span className="text-muted-foreground">로 댓글 작성</span>
          </div>
        )}
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="댓글을 입력하세요 (최소 2자)"
          className="w-full p-3 text-sm rounded-lg bg-background border border-border focus:border-accent focus:outline-none resize-none"
          rows={3}
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmitComment} disabled={isCreating} size="sm">
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            댓글 작성
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-destructive">댓글을 불러올 수 없습니다.</p>
        </div>
      )}

      {/* Comments List */}
      {data && data.comments.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.comments.map((comment: Database['public']['Tables']['comments']['Row'] & { replies: Database['public']['Tables']['comments']['Row'][] }) => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <div className="flex gap-3 p-4 rounded-lg bg-card border border-border hover:border-accent/30 transition-colors">
                {/* Avatar */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  {comment.author_name === 'SEM' && (
                    <span className="text-[10px] font-semibold text-accent">admin</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-sm font-medium ${comment.author_name === 'SEM' ? 'text-accent' : ''}`}>
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {comment.created_at ? formatRelativeTime(comment.created_at) : '방금 전'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    {comment.content}
                  </p>

                  {/* Reply Button */}
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3" />
                    답글
                  </button>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 space-y-2">
                      {/* 로그인하지 않은 경우에만 닉네임 입력 필드 표시 */}
                      {!isAuthenticated && (
                        <input
                          type="text"
                          value={replyNickname}
                          onChange={(e) => setReplyNickname(e.target.value)}
                          placeholder="닉네임 (최소 2자)"
                          className="w-full p-2 text-sm rounded-lg bg-background border border-border focus:border-accent focus:outline-none"
                          maxLength={20}
                        />
                      )}
                      {/* 관리자 로그인 시 표시 */}
                      {isAuthenticated && (
                        <div className="flex items-center gap-2 text-xs text-accent">
                          <User className="w-3 h-3" />
                          <span className="font-semibold">SEM</span>
                          <span className="text-muted-foreground">로 답글 작성</span>
                        </div>
                      )}
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="답글을 입력하세요 (최소 2자)"
                        className="w-full p-3 text-sm rounded-lg bg-background border border-border focus:border-accent focus:outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={isCreating}
                        >
                          {isCreating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                          답글 작성
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyNickname('');
                            setReplyText('');
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 space-y-3">
                  {comment.replies.map((reply: Database['public']['Tables']['comments']['Row']) => (
                    <div
                      key={reply.id}
                      className="flex gap-3 p-4 rounded-lg bg-muted/50 border border-border"
                    >
                      {/* Reply Avatar */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        {reply.author_name === 'SEM' && (
                          <span className="text-[9px] font-semibold text-accent">admin</span>
                        )}
                      </div>

                      {/* Reply Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className={`text-sm font-medium ${reply.author_name === 'SEM' ? 'text-accent' : ''}`}>
                            {reply.author_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {reply.created_at ? formatRelativeTime(reply.created_at) : '방금 전'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {data && data.total > page * 10 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
};
