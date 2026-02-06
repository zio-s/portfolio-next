/**
 * CommentForm Component
 *
 * 댓글 작성/수정/답글 폼 컴포넌트
 *
 * 주요 기능:
 * - 새 댓글 작성 (top-level)
 * - 답글 작성 (parentId 전달)
 * - 댓글 수정 (editingComment 전달)
 * - 로그인/비로그인 사용자 모두 지원
 * - Form validation (min length, required fields)
 */

import { useState, useEffect } from 'react';
import {
  useAddCommentMutation,
  useUpdateCommentMutation,
} from '../api/commentsApi';
import type { Comment } from '../types/Comment';
import { useAppSelector, selectUser } from '../../../store';

interface CommentFormProps {
  projectId: string;
  parentId?: string; // 답글인 경우
  editingComment?: Comment; // 수정 모드인 경우
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const CommentForm = ({
  projectId,
  parentId,
  editingComment,
  onSuccess,
  onCancel,
  placeholder = '댓글을 작성해주세요...',
  autoFocus = false,
}: CommentFormProps) => {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [error, setError] = useState('');

  // Redux Selector 패턴 사용 (Best Practice)
  const currentUser = useAppSelector(selectUser);
  const isLoggedIn = !!currentUser;

  // RTK Query mutations
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();

  const isLoading = isAdding || isUpdating;
  const isEditMode = !!editingComment;

  /**
   * 수정 모드인 경우 기존 댓글 내용으로 초기화
   */
  useEffect(() => {
    if (editingComment) {
      setContent(editingComment.content);
    }
  }, [editingComment]);

  /**
   * Form validation
   */
  const validateForm = (): boolean => {
    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return false;
    }

    if (content.trim().length < 2) {
      setError('댓글은 최소 2자 이상 입력해주세요.');
      return false;
    }

    // 비로그인 사용자인 경우 이름 필수
    if (!isLoggedIn && !authorName.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }

    setError('');
    return true;
  };

  /**
   * 댓글 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditMode) {
        // 수정 모드
        await updateComment({
          id: editingComment!.id,
          content: content.trim(),
        }).unwrap();
      } else {
        // 생성 모드 (새 댓글 or 답글)
        await addComment({
          projectId,
          content: content.trim(),
          parentId,
          // 로그인 사용자: Redux에서 가져온 사용자 정보 사용
          // 비로그인 사용자: 폼에서 입력한 정보 사용
          authorName: isLoggedIn ? currentUser!.name : authorName.trim(),
          authorEmail: isLoggedIn ? currentUser!.email : (authorEmail.trim() || undefined),
        }).unwrap();
      }

      // 성공 시 폼 초기화
      setContent('');
      setAuthorName('');
      setAuthorEmail('');
      setError('');

      // 부모 컴포넌트에 성공 알림
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string'
        ? (err as { message: string }).message
        : '댓글 작성에 실패했습니다.';
      setError(errorMessage);
    }
  };

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    setContent('');
    setError('');
    onCancel?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: parentId ? '12px' : '16px',
        background: parentId ? 'var(--background-secondary)' : 'var(--background-primary)',
        borderRadius: '8px',
        border: parentId ? '1px solid var(--border-color)' : 'none',
      }}
    >
      {/* 비로그인 사용자 정보 입력 */}
      {!isLoggedIn && !isEditMode && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="이름 *"
            disabled={isLoading}
            style={{
              flex: '1 1 200px',
              padding: '10px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'var(--background-primary)',
              color: 'var(--text-primary)',
            }}
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="이메일 (선택)"
            disabled={isLoading}
            style={{
              flex: '1 1 200px',
              padding: '10px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'var(--background-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      )}

      {/* 댓글 내용 입력 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={isLoading}
        rows={parentId ? 3 : 4}
        style={{
          padding: '12px 14px',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          fontSize: '14px',
          lineHeight: '1.6',
          resize: 'vertical',
          minHeight: '80px',
          background: 'var(--background-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'inherit',
        }}
      />

      {/* 에러 메시지 */}
      {error && (
        <div
          style={{
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {(isEditMode || parentId || onCancel) && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            취소
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          style={{
            padding: '8px 20px',
            border: 'none',
            borderRadius: '6px',
            background:
              isLoading || !content.trim()
                ? '#9ca3af'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isLoading || !content.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !content.trim() ? 0.6 : 1,
          }}
        >
          {isLoading ? '전송 중...' : isEditMode ? '수정' : parentId ? '답글 작성' : '댓글 작성'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
