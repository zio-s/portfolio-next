/**
 * PostCommentList Component
 *
 * 블로그 게시글 댓글 목록 컴포넌트 - Tailwind CSS & Framer Motion
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Reply, Trash2 } from 'lucide-react';
import { useGetPostCommentsQuery, useDeletePostCommentMutation } from '../../../store/api/postCommentsApi';
import { PostCommentForm } from './PostCommentForm';
import { useAlertModal, useConfirmModal } from '@/components/modal/hooks';
import type { PostComment } from '../../../store/types';

interface PostCommentListProps {
  postId: string;
  maxDepth?: number;
}

export const PostCommentList = ({ postId, maxDepth = 3 }: PostCommentListProps) => {
  const { data, isLoading, error, refetch } = useGetPostCommentsQuery(postId);

  /**
   * Loading Skeleton
   */
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-4 border-t border-border">
            <div className="w-10 h-10 rounded-full bg-accent/10 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-accent/10 rounded w-1/4 animate-pulse" />
              <div className="h-3 bg-accent/10 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-accent/10 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 text-center bg-destructive/10 border border-destructive/30 rounded-xl"
      >
        <p className="text-destructive font-medium mb-3">댓글을 불러오는데 실패했습니다.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-destructive text-white rounded-lg text-sm hover:bg-destructive/90 transition-colors"
        >
          다시 시도
        </button>
      </motion.div>
    );
  }

  /**
   * Empty State
   */
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-12 px-6 text-center bg-accent/5 rounded-xl border border-accent/10"
      >
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-accent/50" />
        <p className="text-base text-muted-foreground mb-2">아직 댓글이 없습니다</p>
        <p className="text-sm text-muted-foreground/70">첫 번째 댓글을 작성해보세요!</p>
      </motion.div>
    );
  }

  /**
   * 댓글 목록 렌더링
   */
  return (
    <div>
      {/* 댓글 개수 표시 */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-accent" />
        <span className="text-lg font-semibold text-foreground">
          댓글 <span className="text-accent">{data.length}</span>개
        </span>
      </div>

      {/* 댓글 트리 렌더링 */}
      <div className="space-y-0">
        {data.map((comment, index) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            depth={0}
            maxDepth={maxDepth}
            isLast={index === data.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * CommentItem Component
 */
interface CommentItemProps {
  comment: PostComment;
  postId: string;
  depth: number;
  maxDepth: number;
  isLast?: boolean;
}

const CommentItem = ({ comment, postId, depth, maxDepth, isLast = false }: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleteComment, { isLoading: isDeleting }] = useDeletePostCommentMutation();
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  // localStorage에서 본인 댓글인지 확인
  const isMyComment = () => {
    const myComments = JSON.parse(localStorage.getItem('myComments') || '[]');
    return myComments.includes(comment.id);
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
  };

  const handleDeleteClick = () => {
    showConfirm({
      title: '댓글 삭제',
      message: '댓글을 삭제하시겠습니까?',
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await deleteComment(comment.id).unwrap();

          // localStorage에서 삭제
          const myComments = JSON.parse(localStorage.getItem('myComments') || '[]');
          const updatedComments = myComments.filter((id: string) => id !== comment.id);
          localStorage.setItem('myComments', JSON.stringify(updatedComments));

          showAlert({
            title: '완료',
            message: '댓글이 삭제되었습니다',
            type: 'success',
          });
        } catch (error) {
          showAlert({
            title: '오류',
            message: '댓글 삭제에 실패했습니다',
            type: 'error',
          });
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${!isLast ? 'border-b border-border' : ''}`}
    >
      <div
        className={`flex gap-3 p-4 ${depth > 0 ? 'ml-8 pl-6 border-l-2 border-accent/20' : ''}`}
      >
        {/* 아바타 */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center text-accent font-semibold text-sm border-2 border-accent/10">
            {comment.author_name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* 댓글 내용 */}
        <div className="flex-1 min-w-0">
          {/* 작성자 & 날짜 */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-foreground">{comment.author_name}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
          </div>

          {/* 댓글 텍스트 */}
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-3">
            {comment.content}
          </p>

          {/* 답글 & 삭제 버튼 */}
          <div className="flex items-center gap-4">
            {depth < maxDepth && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium transition-colors group"
              >
                <Reply className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                {showReplyForm ? '취소' : '답글'}
              </button>
            )}

            {/* 본인 댓글일 때만 삭제 버튼 표시 */}
            {isMyComment() && (
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 text-xs text-destructive/70 hover:text-destructive font-medium transition-colors group disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                삭제
              </button>
            )}
          </div>

          {/* 답글 폼 */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3"
              >
                <PostCommentForm
                  postId={postId}
                  parentId={comment.id}
                  onSuccess={handleReplySuccess}
                  onCancel={() => setShowReplyForm(false)}
                  placeholder={`${comment.author_name}님에게 답글 작성...`}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 대댓글 렌더링 */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply, index) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              maxDepth={maxDepth}
              isLast={index === comment.replies!.length - 1 && isLast}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
