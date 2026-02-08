/**
 * CommentItem Component
 *
 * 개별 댓글 아이템 컴포넌트 (재귀 렌더링 지원)
 *
 * 주요 기능:
 * - 댓글 내용 표시 (author, timestamp, content)
 * - 좋아요 기능 (optimistic update)
 * - 답글 작성 (CommentForm toggle)
 * - 수정/삭제 (본인 댓글만)
 * - 재귀적 대댓글 렌더링 (depth 기반 indentation)
 * - 최대 nesting depth 제한 (기본: 3 levels)
 */

import { useState, useRef, useEffect } from 'react';
import {
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} from '../api/commentsApi';
import { CommentForm } from './CommentForm';
import type { CommentTreeItem } from '../types/Comment';
import { useAppSelector, selectUser, selectIsAdmin } from '../../../store';
import { useAlertModal } from '@/components/modal/hooks/use-alert-modal';
import { useConfirmModal } from '@/components/modal/hooks/use-confirm-modal';

interface CommentItemProps {
  comment: CommentTreeItem;
  projectId: string;
  maxDepth?: number; // 최대 nesting depth (default: 3)
}

export const CommentItem = ({
  comment,
  projectId,
  maxDepth = 3,
}: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  // Redux Selector 패턴 사용 (Best Practice)
  const currentUser = useAppSelector(selectUser);
  const isOwner = currentUser && currentUser.id === comment.userId;
  const isAdmin = useAppSelector(selectIsAdmin);
  const canDelete = isAdmin || isOwner;
  const isAdminComment = currentUser && comment.authorEmail === currentUser.email && isAdmin;

  // 모달 시스템
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  // RTK Query mutations
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();

  // LocalStorage로 좋아요 상태 관리
  const COMMENT_LIKE_KEY = `comment_liked_${comment.id}`;
  const [hasLiked, setHasLiked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COMMENT_LIKE_KEY) === 'true';
  });

  // UI 표시용 likes 카운트 (즉시 반영)
  const [displayedLikes, setDisplayedLikes] = useState<number>(comment.likes);

  // 댓글 likes 값 변경 시 동기화
  useEffect(() => {
    setDisplayedLikes(comment.likes);
  }, [comment.likes]);

  // Debounce 타이머 관리
  const likeTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 좋아요 토글 핸들러 (UI 즉시 반영 + 1초 debounce)
   */
  const handleLikeToggle = () => {
    // 1. UI 즉시 토글 (버튼 상태 + 숫자)
    const newLikedState = !hasLiked;
    setHasLiked(newLikedState);

    // 숫자도 즉시 증가/감소
    setDisplayedLikes((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));

    if (newLikedState) {
      localStorage.setItem(COMMENT_LIKE_KEY, 'true');
    } else {
      localStorage.removeItem(COMMENT_LIKE_KEY);
    }

    // 2. 이전 타이머 취소
    if (likeTimerRef.current) {
      clearTimeout(likeTimerRef.current);
    }

    // 3. 1초 후 서버 요청
    likeTimerRef.current = setTimeout(async () => {
      try {
        if (newLikedState) {
          await likeComment(comment.id).unwrap();
        } else {
          await unlikeComment(comment.id).unwrap();
        }
      } catch {
        // 실패 시 상태 복원 (버튼 + 숫자)
        setHasLiked(!newLikedState);
        setDisplayedLikes((prev) => (newLikedState ? Math.max(0, prev - 1) : prev + 1));
        if (!newLikedState) {
          localStorage.setItem(COMMENT_LIKE_KEY, 'true');
        } else {
          localStorage.removeItem(COMMENT_LIKE_KEY);
        }
      }
    }, 1000);
  };

  // Cleanup: 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (likeTimerRef.current) {
        clearTimeout(likeTimerRef.current);
      }
    };
  }, []);

  /**
   * 삭제 핸들러
   */
  const handleDelete = () => {
    showConfirm({
      title: '댓글 삭제',
      message: '정말 이 댓글을 삭제하시겠습니까?',
      type: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await deleteComment(comment.id).unwrap();
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

  /**
   * 답글 작성 성공 핸들러
   */
  const handleReplySuccess = () => {
    setIsReplying(false);
    setShowReplies(true); // 답글 보이도록
  };

  /**
   * 수정 성공 핸들러
   */
  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  /**
   * 시간 포맷 (상대 시간)
   */
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (days > 0) {
      return `${days}일 전`;
    } else if (hours > 0) {
      return `${hours}시간 전`;
    } else if (minutes > 0) {
      return `${minutes}분 전`;
    } else {
      return '방금 전';
    }
  };

  const indentSize = comment.depth * 40; // depth당 40px indentation
  const canReply = comment.depth < maxDepth; // 최대 depth 제한

  return (
    <div
      style={{
        marginLeft: `${indentSize}px`,
        paddingTop: '16px',
        borderTop: comment.depth === 0 ? '1px solid var(--border-color)' : 'none',
      }}
    >
      {/* 댓글 헤더 + 내용 */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Avatar */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: comment.authorAvatar
              ? `url(${comment.authorAvatar})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          {!comment.authorAvatar && comment.authorName.charAt(0).toUpperCase()}
        </div>

        {/* 댓글 본문 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 작성자 + 시간 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}
            >
              {comment.authorName}
            </span>
            {isAdminComment && (
              <span
                style={{
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: '700',
                  background: 'hsl(var(--accent) / 0.2)',
                  color: 'hsl(var(--accent))',
                  borderRadius: '4px',
                }}
              >
                ADMIN
              </span>
            )}
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
              }}
            >
              {formatTime(comment.createdAt)}
            </span>
            {comment.createdAt !== comment.updatedAt && (
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  fontStyle: 'italic',
                }}
              >
                (수정됨)
              </span>
            )}
          </div>

          {/* 댓글 내용 (수정 모드 or 일반 표시) */}
          {isEditing ? (
            <CommentForm
              projectId={projectId}
              editingComment={comment}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditing(false)}
              autoFocus
            />
          ) : (
            <p
              style={{
                margin: '0 0 10px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {comment.content}
            </p>
          )}

          {/* 액션 버튼들 */}
          {!isEditing && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* 좋아요 버튼 */}
              <button
                onClick={handleLikeToggle}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  border: 'none',
                  background: 'transparent',
                  color: hasLiked ? '#ef4444' : 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!hasLiked) {
                    e.currentTarget.style.color = '#ef4444';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!hasLiked) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span>{hasLiked || displayedLikes > 0 ? '❤️' : '🤍'}</span>
                {displayedLikes > 0 && <span>{displayedLikes}</span>}
              </button>

              {/* 답글 버튼 */}
              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {isReplying ? '취소' : '답글'}
                </button>
              )}

              {/* 수정 버튼 (본인 댓글만) */}
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  수정
                </button>
              )}

              {/* 삭제 버튼 (본인 댓글 또는 관리자) */}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '13px',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.6 : 1,
                  }}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              )}

              {/* 답글 토글 버튼 (대댓글이 있는 경우) */}
              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {showReplies
                    ? `답글 숨기기 (${comment.replies.length})`
                    : `답글 보기 (${comment.replies.length})`}
                </button>
              )}
            </div>
          )}

          {/* 답글 작성 폼 */}
          {isReplying && canReply && (
            <div style={{ marginTop: '12px' }}>
              <CommentForm
                projectId={projectId}
                parentId={comment.id}
                onSuccess={handleReplySuccess}
                onCancel={() => setIsReplying(false)}
                placeholder={`@${comment.authorName}에게 답글...`}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* 재귀적 대댓글 렌더링 ⭐ */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              projectId={projectId}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
