/**
 * CommentList Component
 *
 * 댓글 목록 컴포넌트
 *
 * 주요 기능:
 * - RTK Query로 댓글 목록 조회
 * - buildCommentTree()로 flat array → tree 구조 변환
 * - CommentItem으로 재귀적 렌더링
 * - Loading skeleton 표시
 * - Empty state / Error state 처리
 */

import { useGetCommentsQuery } from '../api/commentsApi';
import { buildCommentTree } from '../utils/commentTree';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  projectId: string;
  maxDepth?: number;
}

export const CommentList = ({ projectId, maxDepth = 3 }: CommentListProps) => {
  const { data, isLoading, error, refetch } = useGetCommentsQuery(projectId);

  /**
   * Loading Skeleton
   */
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '16px 0',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {/* Avatar skeleton */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--background-secondary)',
                flexShrink: 0,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            {/* Content skeleton */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  width: '30%',
                  height: '14px',
                  background: 'var(--background-secondary)',
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'var(--background-secondary)',
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        ))}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </div>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
        }}
      >
        <p style={{ fontSize: '16px', color: '#ef4444', marginBottom: '12px' }}>
          댓글을 불러오는데 실패했습니다.
        </p>
        <button
          onClick={() => refetch()}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  /**
   * Empty State
   */
  if (!data || data.items.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--background-secondary)',
          borderRadius: '12px',
        }}
      >
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          아직 댓글이 없습니다
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
          첫 번째 댓글을 작성해보세요!
        </p>
      </div>
    );
  }

  /**
   * 댓글 목록 렌더링
   */
  const commentTree = buildCommentTree(data.items);

  return (
    <div>
      {/* 댓글 개수 표시 */}
      <div
        style={{
          marginBottom: '16px',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}
      >
        댓글 {data.total}개
      </div>

      {/* 댓글 트리 렌더링 */}
      <div>
        {commentTree.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            projectId={projectId}
            maxDepth={maxDepth}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentList;
