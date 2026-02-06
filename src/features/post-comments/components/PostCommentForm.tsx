/**
 * PostCommentForm Component
 *
 * 블로그 게시글 댓글 작성 폼 - Tailwind CSS & Framer Motion
 */

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, X, User, Mail, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../../store';
import { selectUser } from '../../../store/slices/authSlice';
import { useCreatePostCommentMutation } from '../../../store/api/postCommentsApi';

interface PostCommentFormProps {
  postId: string;
  parentId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export const PostCommentForm = ({
  postId,
  parentId = null,
  onSuccess,
  onCancel,
  placeholder = '댓글을 작성해주세요...',
}: PostCommentFormProps) => {
  const currentUser = useAppSelector(selectUser);
  const isLoggedIn = !!currentUser;

  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [error, setError] = useState('');

  const [createComment, { isLoading }] = useCreatePostCommentMutation();

  /**
   * 유효성 검사
   */
  const validateForm = (): boolean => {
    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return false;
    }

    if (!isLoggedIn && !authorName.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }

    return true;
  };

  /**
   * 폼 제출
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      const result = await createComment({
        post_id: postId,
        content: content.trim(),
        author_name: isLoggedIn ? currentUser!.name : authorName.trim(),
        author_email: isLoggedIn ? currentUser!.email : (authorEmail.trim() || undefined),
        parent_id: parentId || null,
      }).unwrap();

      // 작성한 댓글 ID를 localStorage에 저장
      if (result && typeof result === 'object' && 'id' in result) {
        const myComments = JSON.parse(localStorage.getItem('myComments') || '[]');
        myComments.push(result.id);
        localStorage.setItem('myComments', JSON.stringify(myComments));
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

  const handleCancel = () => {
    setContent('');
    setError('');
    onCancel?.();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 ${
        parentId ? 'p-3 bg-accent/5 rounded-lg border border-accent/10' : 'p-4 bg-card rounded-xl border border-border'
      }`}
    >
      {/* 로그인 사용자 표시 */}
      {isLoggedIn && !parentId && (
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-white text-xs font-semibold">
            {currentUser!.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-foreground">
            {currentUser!.name}
          </span>
          <span className="text-xs text-muted-foreground">본 댓글 작성</span>
        </div>
      )}

      {/* 비로그인 사용자 정보 입력 */}
      {!isLoggedIn && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="이름 *"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="이메일 (선택)"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* 댓글 입력 영역 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        rows={parentId ? 3 : 4}
        className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* 에러 메시지 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
        >
          <span>{error}</span>
        </motion.div>
      )}

      {/* 버튼 영역 */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-accent/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || (!isLoggedIn && !authorName.trim()) || !content.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                작성 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {parentId ? '답글 작성' : '댓글 작성'}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
};
